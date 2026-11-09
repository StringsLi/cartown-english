import { getStorage, setStorage } from '@/utils/storage';
import { todayKey } from '@/utils/date';
import { getSpeechLesson, speechLessons, type SpeechLanguage } from '../catalog';
export const SPEECH_KEY = 'cartown_daily_speech_v1';
interface SpeechDay { heard: string[]; recorded: string[] }
interface SpeechProgress { started: string; language: SpeechLanguage; days: Record<string, SpeechDay> }
function dayNumber(key: string) { const [y,m,d] = key.split('-').map(Number); return Date.UTC(y,m-1,d) / 86400000; }
function validDate(key: unknown): key is string {
  return typeof key === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(key) && todayKey(new Date(`${key}T12:00:00`)) === key;
}
export function getSpeechProgress(now = new Date()): SpeechProgress {
  const today = todayKey(now), raw = getStorage<Partial<SpeechProgress>>(SPEECH_KEY);
  const cleanIds = (ids: unknown) => Array.isArray(ids) ? [...new Set(ids.filter((id): id is string => typeof id === 'string' && !!getSpeechLesson(id)))] : [];
  const days: Record<string, SpeechDay> = {};
  if (raw?.days && typeof raw.days === 'object') for (const [date,value] of Object.entries(raw.days)) {
    if (validDate(date) && date <= today && dayNumber(today) - dayNumber(date) < 90 && value && typeof value === 'object') {
      const heard = cleanIds(value.heard);
      days[date] = { heard, recorded: cleanIds(value.recorded).filter(id => heard.includes(id)) };
    }
  }
  const state: SpeechProgress = { started: validDate(raw?.started) && raw.started <= today ? raw.started : today, language: raw?.language === 'en' ? 'en' : 'zh', days };
  if (!raw || JSON.stringify(raw) !== JSON.stringify(state)) setStorage(SPEECH_KEY, state);
  return state;
}
export function setSpeechLanguage(language: SpeechLanguage) {
  if (language === 'en' || language === 'zh') setStorage(SPEECH_KEY, { ...getSpeechProgress(), language });
}
export function dailySpeech(language: SpeechLanguage, now = new Date()) {
  const state = getSpeechProgress(now), offset = Math.max(0, dayNumber(todayKey(now)) - dayNumber(state.started));
  return speechLessons.filter(lesson => lesson.language === language)[offset % 10];
}
export function speechDay(now = new Date()): SpeechDay { return getSpeechProgress(now).days[todayKey(now)] || { heard: [], recorded: [] }; }
export function markSpeech(id: string, kind: 'heard' | 'recorded', date = todayKey()): boolean {
  if (kind !== 'heard' && kind !== 'recorded') return false;
  if (!getSpeechLesson(id) || !validDate(date) || date > todayKey() || dayNumber(todayKey()) - dayNumber(date) >= 90) return false;
  const state = getSpeechProgress(), day = state.days[date] || { heard: [], recorded: [] };
  if (kind === 'recorded' && !day.heard.includes(id)) return false;
  day[kind] = [...new Set([...day[kind], id])]; state.days[date] = day;
  return setStorage(SPEECH_KEY, state);
}
