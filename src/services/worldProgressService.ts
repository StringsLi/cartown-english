import { getStorage, setStorage } from "@/utils/storage";
import { todayKey } from "@/utils/date";
const EXPLORED = "cartown_explored_countries";
const DAILY = "cartown_daily_countries";
function ids(value: unknown, valid: readonly string[]): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && valid.includes(id)))] : [];
}
export function getCountryProgress(valid: readonly string[], date = todayKey()) {
  const stored = getStorage<{ date: string; ids: string[] }>(DAILY);
  return { explored: ids(getStorage(EXPLORED), valid), today: stored?.date === date ? ids(stored.ids, valid) : [] };
}
/** Called only when the audio actually starts. Repeated countries count once per day. */
export function recordCountryListening(id: string, valid: readonly string[], date = todayKey()) {
  const progress = getCountryProgress(valid, date);
  if (!valid.includes(id)) return progress;
  progress.explored = [...new Set([...progress.explored, id])];
  progress.today = [...new Set([...progress.today, id])];
  setStorage(EXPLORED, progress.explored); setStorage(DAILY, { date, ids: progress.today });
  return progress;
}
