import { mockBooks } from "@/mock/books";
import type { GameRecord, ReadStatus, RepeatRecord, UserProgress } from "@/types/book";
import { formatDateTime, isYesterday, todayKey } from "@/utils/date";
import { getStorage, removeStorage, setStorage } from "@/utils/storage";

const STORAGE_KEY = "little_english_book_progress";
const DEFAULT_USER_ID = "local_child";
const MAX_REPEAT_RECORDS = 12;

export interface LearningState {
  userId: string;
  childNickname: string;
  streakDays: number;
  lastStudyDate: string;
  readBookIds: string[];
  progressMap: Record<string, UserProgress>;
  repeatRecords: RepeatRecord[];
  gameRecords: GameRecord[];
  studyDates: string[];
  readingSecondsByDate: Record<string, number>;
}

export interface HomeStats {
  todayCompleted: boolean;
  streakDays: number;
  readBookCount: number;
  learnedWordCount: number;
  lastReadAt?: string;
  weeklyReadingSeconds: number;
  previousWeeklyReadingSeconds: number;
}

export interface WeekActivityDay {
  dateKey: string;
  label: string;
  done: boolean;
  isToday: boolean;
}

const defaultState: LearningState = {
  userId: DEFAULT_USER_ID,
  childNickname: "Little Reader",
  streakDays: 0,
  lastStudyDate: "",
  readBookIds: [],
  progressMap: {},
  repeatRecords: [],
  gameRecords: [],
  studyDates: [],
  readingSecondsByDate: {}
};

export function getLearningState(): LearningState {
  const stored = getStorage<LearningState>(STORAGE_KEY);

  return {
    userId: stored?.userId ?? defaultState.userId,
    childNickname: stored?.childNickname ?? defaultState.childNickname,
    streakDays: stored?.streakDays ?? defaultState.streakDays,
    lastStudyDate: stored?.lastStudyDate ?? defaultState.lastStudyDate,
    readBookIds: stored?.readBookIds ?? [],
    progressMap: stored?.progressMap ?? {},
    repeatRecords: stored?.repeatRecords ?? [],
    gameRecords: stored?.gameRecords ?? [],
    studyDates: stored?.studyDates ?? [],
    readingSecondsByDate: stored?.readingSecondsByDate ?? {}
  };
}

export function saveLearningState(state: LearningState): void {
  setStorage(STORAGE_KEY, state);
}

export function updateChildNickname(childNickname: string): void {
  const state = getLearningState();
  state.childNickname = childNickname || defaultState.childNickname;
  saveLearningState(state);
}

export function getProgress(bookId?: string): UserProgress | Record<string, UserProgress> | undefined {
  const state = getLearningState();
  return bookId ? state.progressMap[bookId] : state.progressMap;
}

export function saveProgress(params: {
  bookId: string;
  readStatus?: ReadStatus;
  currentPage?: number;
}): UserProgress {
  const state = getLearningState();
  const now = formatDateTime();
  const existing = state.progressMap[params.bookId];

  markStudy(state);

  const nextProgress: UserProgress = {
    userId: state.userId,
    bookId: params.bookId,
    readStatus: params.readStatus ?? existing?.readStatus ?? "reading",
    currentPage: params.currentPage ?? existing?.currentPage ?? 1,
    readCount: existing?.readCount ?? 0,
    lastReadAt: now,
    completedAt: existing?.completedAt
  };

  state.progressMap[params.bookId] = nextProgress;
  saveLearningState(state);

  return nextProgress;
}

export function completeBook(bookId: string): UserProgress {
  const state = getLearningState();
  const now = formatDateTime();
  const book = mockBooks.find((item) => item.id === bookId);
  const existing = state.progressMap[bookId];

  markStudy(state);

  if (!state.readBookIds.includes(bookId)) {
    state.readBookIds.push(bookId);
  }

  const nextProgress: UserProgress = {
    userId: state.userId,
    bookId,
    readStatus: "completed",
    currentPage: book?.pageCount ?? existing?.currentPage ?? 1,
    readCount: (existing?.readCount ?? 0) + 1,
    lastReadAt: now,
    completedAt: now
  };

  state.progressMap[bookId] = nextProgress;
  saveLearningState(state);

  return nextProgress;
}

export function saveRepeatRecord(record: Omit<RepeatRecord, "userId" | "createdAt">): RepeatRecord {
  const state = getLearningState();
  markStudy(state);
  const nextRecord: RepeatRecord = {
    userId: state.userId,
    createdAt: formatDateTime(),
    ...record
  };

  state.repeatRecords = [nextRecord, ...state.repeatRecords].slice(0, MAX_REPEAT_RECORDS);
  saveLearningState(state);

  return nextRecord;
}

export function getRepeatRecords(): RepeatRecord[] {
  return getLearningState().repeatRecords;
}

export function mergeRepeatRecords(records: RepeatRecord[]): { added: number; total: number } {
  const state = getLearningState();
  const currentKeys = new Set(state.repeatRecords.map(repeatRecordKey));
  const incoming = records.filter((record) => {
    const key = repeatRecordKey(record);
    if (currentKeys.has(key)) return false;
    currentKeys.add(key);
    return true;
  });

  state.repeatRecords = [...incoming, ...state.repeatRecords]
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, MAX_REPEAT_RECORDS);
  saveLearningState(state);

  const savedKeys = new Set(state.repeatRecords.map(repeatRecordKey));
  const added = incoming.filter((record) => savedKeys.has(repeatRecordKey(record))).length;
  return { added, total: state.repeatRecords.length };
}

export function saveGameRecord(record: Omit<GameRecord, "userId" | "createdAt">): GameRecord {
  const state = getLearningState();
  markStudy(state);
  const nextRecord: GameRecord = {
    userId: state.userId,
    createdAt: formatDateTime(),
    ...record
  };

  state.gameRecords.unshift(nextRecord);
  saveLearningState(state);

  return nextRecord;
}

export function getHomeStats(): HomeStats {
  const state = getLearningState();
  const completedProgress = Object.values(state.progressMap).filter((item) => item.readStatus === "completed");
  const learnedWords = new Set<string>();

  mockBooks
    .filter((book) => state.readBookIds.includes(book.id))
    .forEach((book) => {
      book.keywords.forEach((keyword) => learnedWords.add(keyword));
    });

  const latest = completedProgress
    .map((item) => item.lastReadAt)
    .sort()
    .at(-1);

  return {
    todayCompleted: state.lastStudyDate === todayKey(),
    streakDays: state.streakDays,
    readBookCount: state.readBookIds.length,
    learnedWordCount: learnedWords.size,
    lastReadAt: latest,
    weeklyReadingSeconds: sumReadingSeconds(state, weekDateKeys(0)),
    previousWeeklyReadingSeconds: sumReadingSeconds(state, weekDateKeys(-7))
  };
}

export function addReadingDuration(durationSeconds: number): void {
  const seconds = Math.min(60 * 60, Math.max(0, Math.round(durationSeconds)));
  if (seconds < 1) return;

  const state = getLearningState();
  const dateKey = todayKey();
  state.readingSecondsByDate[dateKey] = (state.readingSecondsByDate[dateKey] ?? 0) + seconds;
  markStudy(state);
  saveLearningState(state);
}

export function getCurrentWeekActivity(): WeekActivityDay[] {
  const state = getLearningState();
  const today = new Date();
  const todayDateKey = todayKey(today);
  const labels = ["一", "二", "三", "四", "五", "六", "日"];

  return weekDateKeys(0).map((dateKey, index) => ({
    dateKey,
    label: labels[index],
    done: state.studyDates.includes(dateKey),
    isToday: dateKey === todayDateKey
  }));
}

export function getRecentProgress(limit = 3): UserProgress[] {
  const state = getLearningState();
  return Object.values(state.progressMap)
    .sort((first, second) => second.lastReadAt.localeCompare(first.lastReadAt))
    .slice(0, limit);
}

export function clearLearningData(): void {
  removeStorage(STORAGE_KEY);
}

function touchStudyStreak(state: LearningState): void {
  const today = todayKey();

  if (state.lastStudyDate === today) {
    return;
  }

  state.streakDays = isYesterday(state.lastStudyDate) ? state.streakDays + 1 : 1;
  state.lastStudyDate = today;
}

function repeatRecordKey(record: RepeatRecord): string {
  return `${record.bookId}|${record.sentence}|${record.createdAt}`;
}

function markStudy(state: LearningState): void {
  touchStudyStreak(state);
  const dateKey = todayKey();
  if (!state.studyDates.includes(dateKey)) {
    state.studyDates = [...state.studyDates, dateKey].slice(-90);
  }
}

function weekDateKeys(dayOffset: number): string[] {
  const today = new Date();
  const mondayOffset = ((today.getDay() + 6) % 7) * -1 + dayOffset;

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(12, 0, 0, 0);
    date.setDate(today.getDate() + mondayOffset + index);
    return todayKey(date);
  });
}

function sumReadingSeconds(state: LearningState, dateKeys: string[]): number {
  return dateKeys.reduce((total, dateKey) => total + (state.readingSecondsByDate[dateKey] ?? 0), 0);
}
