import { getStorage, setStorage } from "@/utils/storage";
import { todayKey } from "@/utils/date";
import { lifeRoutines } from "../catalog";

export const ROUTINE_KEY = "cartown_life_routines_v1";
interface RoutineProgress { selected: string; days: Record<string, string[]>; }
const validSteps = new Set(lifeRoutines.flatMap(routine => routine.steps.map(step => step.id)));

function retentionWindow(now: Date) {
  const first = new Date(now); first.setDate(first.getDate() - 89);
  return { first: todayKey(first), last: todayKey(now) };
}
function validDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && todayKey(new Date(`${date}T12:00:00`)) === date;
}
export function getRoutineProgress(now = new Date()): RoutineProgress {
  const raw = getStorage<Partial<RoutineProgress>>(ROUTINE_KEY);
  const window = retentionWindow(now);
  const days: Record<string, string[]> = {};
  if (raw?.days && typeof raw.days === "object" && !Array.isArray(raw.days)) {
    for (const [date, ids] of Object.entries(raw.days).sort()) {
      if (date >= window.first && date <= window.last && validDate(date) && Array.isArray(ids)) {
        days[date] = [...new Set(ids.filter(id => typeof id === "string" && validSteps.has(id)))];
      }
    }
  }
  const state = { selected: lifeRoutines.some(r => r.id === raw?.selected) ? raw!.selected! : lifeRoutines[0].id, days };
  // Remove expired entries from disk too, even when no new step is marked.
  if (raw && (raw.selected !== state.selected || JSON.stringify(raw.days) !== JSON.stringify(days))) setStorage(ROUTINE_KEY, state);
  return state;
}

export function selectRoutine(id: string): void {
  if (!lifeRoutines.some(r => r.id === id)) return;
  setStorage(ROUTINE_KEY, { ...getRoutineProgress(), selected: id });
}

export function setRoutineStep(id: string, done: boolean, date = todayKey()): boolean {
  const window = retentionWindow(new Date());
  if (!validSteps.has(id) || !validDate(date) || date < window.first || date > window.last) return false;
  const state = getRoutineProgress();
  const ids = new Set(state.days[date] || []);
  if (done) ids.add(id); else ids.delete(id);
  state.days[date] = [...ids];
  return setStorage(ROUTINE_KEY, state);
}

export function getRoutineWeek(now = new Date()) {
  const { days } = getRoutineProgress(now);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now); date.setDate(date.getDate() - 6 + index);
    const key = todayKey(date), steps = days[key] || [];
    return { date: key, label: `${date.getMonth() + 1}/${date.getDate()}`, count: lifeRoutines.filter(r => r.steps.every(s => steps.includes(s.id))).length };
  });
}
