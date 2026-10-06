import { getStorage, setStorage } from "@/utils/storage";
import { addCartownStar } from "@/services/cartownProgressService";
import { getSpaceBody, getSpaceSeries, spaceBodies, spaceSeries, seriesBodies, type SpaceBody } from "@/mock/solarSystem";
const KEY = "cartown_space_learning_v1";
export interface SpaceProgress { heardIds: string[]; completedSeriesIds: string[] }
export function getSpaceProgress(): SpaceProgress {
  const raw = getStorage<Partial<SpaceProgress>>(KEY);
  const clean = (value: unknown, valid: string[]) => Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && valid.includes(id)))] : [];
  return { heardIds: clean(raw?.heardIds, spaceBodies.map(b => b.id)), completedSeriesIds: clean(raw?.completedSeriesIds, spaceSeries.map(s => s.id)) };
}
export function markSpaceHeard(id: string): SpaceProgress {
  const progress = getSpaceProgress();
  if (getSpaceBody(id) && !progress.heardIds.includes(id)) { progress.heardIds.push(id); setStorage(KEY, progress); }
  return progress;
}
export function completeSpaceSeries(id: string, solvedIds: string[]): boolean {
  if (!spaceSeries.some(series => series.id === id)) return false;
  const progress = getSpaceProgress();
  if (progress.completedSeriesIds.includes(id) || !getSpaceSeries(id).bodyIds.every(bodyId => solvedIds.includes(bodyId))) return false;
  progress.completedSeriesIds.push(id); setStorage(KEY, progress); addCartownStar(); return true;
}
function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1)))); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export interface SpaceQuestion { target: SpaceBody; choices: SpaceBody[] }
export function createSpaceRound(id: string, random = Math.random): SpaceQuestion[] {
  const bodies = seriesBodies(id);
  return shuffle(bodies, random).map(target => ({ target, choices: shuffle([target, ...shuffle(bodies.filter(body => body.id !== target.id), random).slice(0, 3)], random) }));
}
