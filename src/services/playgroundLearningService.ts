import { getPlaygroundTopic, playgroundTopics, type PlaygroundItem } from "@/mock/playground";
import { todayKey } from "@/utils/date";
import { getStorage, removeStorage, setStorage } from "@/utils/storage";

const KEY = "cartown_playground_learning";
const DAY = 86400000;
export interface WordPractice {
  correct: number; wrong: number; streak: number;
  lastPracticeAt: number; nextReviewAt: number; lastSuccessDate: string;
}
export interface PlaygroundSession {
  topicId: string; mode: "learn" | "quiz"; wordIndex: number;
  questionIds: string[]; questionIndex: number; answered: boolean;
  hadWrong: boolean; reviewOnly: boolean;
}
interface DailyPlay {
  date: string; heardIds: string[]; solvedIds: string[]; adventureIds: string[];
}
interface LearningProgress {
  words: Record<string, WordPractice>; daily: DailyPlay; session: PlaygroundSession | null;
}
let cached: LearningProgress | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const emptyDaily = (now = Date.now()): DailyPlay => ({ date: todayKey(new Date(now)), heardIds: [], solvedIds: [], adventureIds: [] });
const wordKeys = new Set(playgroundTopics.flatMap(t => t.items.map(i => `${t.id}:${i.id}`)));
const count = (n: unknown) => typeof n === "number" && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;

export function getPlaygroundLearning(): LearningProgress {
  if (!cached) {
    const stored = getStorage<LearningProgress>(KEY);
    const words: Record<string, WordPractice> = {};
    for (const [key, value] of Object.entries(stored?.words || {})) {
      if (!wordKeys.has(key) || !value) continue;
      words[key] = { correct: count(value.correct), wrong: count(value.wrong), streak: count(value.streak), lastPracticeAt: count(value.lastPracticeAt), nextReviewAt: count(value.nextReviewAt), lastSuccessDate: typeof value.lastSuccessDate === "string" ? value.lastSuccessDate : "" };
    }
    const d = stored?.daily;
    const ids = (value: unknown) => Array.isArray(value) ? [...new Set(value.filter(k => typeof k === "string" && wordKeys.has(k)))] : [];
    cached = { words, daily: d ? { date: typeof d.date === "string" ? d.date : "", heardIds: ids(d.heardIds), solvedIds: ids(d.solvedIds), adventureIds: Array.isArray(d.adventureIds) ? d.adventureIds.filter(k => typeof k === "string").slice(0, 12) : [] } : emptyDaily(), session: validSession(stored?.session) };
  }
  return cached;
}
function validSession(s?: PlaygroundSession | null): PlaygroundSession | null {
  const topic = s && getPlaygroundTopic(s.topicId);
  if (!s || !topic || !["learn", "quiz"].includes(s.mode)) return null;
  const questions = Array.isArray(s.questionIds) ? [...new Set(s.questionIds.filter(id => topic.items.some(i => i.id === id)))] : [];
  if (!questions.length) return null;
  if (!s.reviewOnly && questions.length !== topic.items.length) return null;
  return { topicId: topic.id, mode: s.mode, wordIndex: Math.min(count(s.wordIndex), topic.items.length - 1), questionIds: questions, questionIndex: Math.min(count(s.questionIndex), questions.length - 1), answered: s.answered === true, hadWrong: s.hadWrong === true, reviewOnly: s.reviewOnly === true };
}
function save(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(flushPlaygroundLearning, 300);
}
export function flushPlaygroundLearning(): void {
  if (timer) clearTimeout(timer);
  timer = null;
  if (cached) setStorage(KEY, cached);
}
function daily(now: number): DailyPlay {
  const state = getPlaygroundLearning();
  if (state.daily.date !== todayKey(new Date(now))) state.daily = emptyDaily(now);
  return state.daily;
}
export function getTodayPlay(now = Date.now()): DailyPlay {
  const state = getPlaygroundLearning();
  return state.daily.date === todayKey(new Date(now)) ? state.daily : emptyDaily(now);
}
export function recordPlaygroundListening(topicId: string, itemId: string, now = Date.now()): void {
  const id = `${topicId}:${itemId}`;
  if (!wordKeys.has(id)) return;
  const d = daily(now);
  if (!d.heardIds.includes(id)) { d.heardIds.push(id); save(); }
}
export function recordPlaygroundAnswer(topicId: string, itemId: string, correct: boolean, assisted = false, now = Date.now()): void {
  const id = `${topicId}:${itemId}`;
  if (!wordKeys.has(id)) return;
  const state = getPlaygroundLearning(), d = daily(now);
  if (correct && !d.solvedIds.includes(id)) d.solvedIds.push(id);
  if (!assisted) {
    const previous = state.words[id] || { correct: 0, wrong: 0, streak: 0, lastPracticeAt: 0, nextReviewAt: 0, lastSuccessDate: "" };
    const date = todayKey(new Date(now));
    const streak = correct ? previous.streak + (previous.lastSuccessDate !== date || previous.streak === 0 ? 1 : 0) : 0;
    state.words[id] = { correct: previous.correct + (correct ? 1 : 0), wrong: previous.wrong + (correct ? 0 : 1), streak, lastPracticeAt: now, nextReviewAt: correct ? now + DAY * (streak >= 3 ? 7 : streak >= 2 ? 3 : 1) : now, lastSuccessDate: correct ? date : previous.lastSuccessDate };
  }
  save();
}
export function recordAdventureToday(id: string, now = Date.now()): void {
  const d = daily(now);
  if (!d.adventureIds.includes(id)) { d.adventureIds.push(id); save(); }
}
export function savePlaygroundSession(session: PlaygroundSession | null): void {
  getPlaygroundLearning().session = validSession(session); save();
}
export function getReviewWordIds(now = Date.now()): string[] {
  return Object.entries(getPlaygroundLearning().words)
    .filter(([, w]) => w.correct + w.wrong > 0 && w.nextReviewAt <= now)
    .sort(([a, x], [b, y]) => (x.streak === 0 ? 0 : 1) - (y.streak === 0 ? 0 : 1) || x.nextReviewAt - y.nextReviewAt || a.localeCompare(b))
    .map(([id]) => id);
}
export function getReviewTopic(now = Date.now()) {
  const key = getReviewWordIds(now)[0];
  return key ? getPlaygroundTopic(key.split(":")[0]) : undefined;
}
export function getReviewItems(topicId: string, now = Date.now()): PlaygroundItem[] {
  const topic = getPlaygroundTopic(topicId);
  return getReviewWordIds(now).filter(id => id.startsWith(`${topicId}:`)).map(id => topic?.items.find(i => i.id === id.split(":")[1])).filter((i): i is PlaygroundItem => !!i).slice(0, 5);
}
export function getPlaygroundSummary(heardIds: string[], now = Date.now()) {
  const words = getPlaygroundLearning().words;
  return { heard: new Set(heardIds.filter(id => wordKeys.has(id))).size, independent: Object.values(words).filter(w => w.correct > 0).length, review: getReviewWordIds(now).length };
}
export function clearPlaygroundLearning(): void {
  if (timer) clearTimeout(timer);
  timer = null; cached = null; removeStorage(KEY);
}
