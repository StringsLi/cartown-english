import { getStorage, removeStorage, setStorage } from "@/utils/storage";

const STORAGE_KEY = "cartown_english_progress";
const DEBOUNCE_MS = 300;

let cachedProgress: CartownProgress | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export interface CartownProgress {
  stars: number;
  learnedVehicleIndex: number;
  learnedVehicleIds: string[];
  logoIndex: number;
  logoQuizDone: number;
  storyBookIndex: number;
  storyPageIndex: number;
  colorQuestionsDone: number;
  countQuestionsDone: number;
  trafficTurnsDone: number;
  playgroundCompletedTopicIds: string[];
  playgroundHeardWordIds: string[];
}

const defaultProgress: CartownProgress = {
  stars: 0,
  learnedVehicleIndex: 0,
  learnedVehicleIds: [],
  logoIndex: 0,
  logoQuizDone: 0,
  storyBookIndex: 0,
  storyPageIndex: 0,
  colorQuestionsDone: 0,
  countQuestionsDone: 0,
  trafficTurnsDone: 0,
  playgroundCompletedTopicIds: [],
  playgroundHeardWordIds: []
};

export function getCartownProgress(): CartownProgress {
  if (!cachedProgress) {
    const stored = getStorage<CartownProgress>(STORAGE_KEY);
    cachedProgress = {
      ...defaultProgress,
      ...(stored ?? {}),
      learnedVehicleIds: stored?.learnedVehicleIds ?? [],
      playgroundCompletedTopicIds: stored?.playgroundCompletedTopicIds ?? [],
      playgroundHeardWordIds: stored?.playgroundHeardWordIds ?? []
    };
  }
  return cachedProgress;
}

export function saveCartownProgress(progress: Partial<CartownProgress>): CartownProgress {
  cachedProgress = { ...getCartownProgress(), ...progress };
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (cachedProgress) setStorage(STORAGE_KEY, cachedProgress);
    saveTimer = null;
  }, DEBOUNCE_MS);
  return cachedProgress;
}

export function flushCartownProgress(): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (cachedProgress) setStorage(STORAGE_KEY, cachedProgress);
}

export function addCartownStar(count = 1): CartownProgress {
  const current = getCartownProgress();

  return saveCartownProgress({
    stars: current.stars + count
  });
}

export function completePlaygroundTopic(topicId: string): { earned: boolean; progress: CartownProgress } {
  const current = getCartownProgress();
  if (!topicId || current.playgroundCompletedTopicIds.includes(topicId)) {
    return { earned: false, progress: current };
  }

  const progress = saveCartownProgress({
    playgroundCompletedTopicIds: [...current.playgroundCompletedTopicIds, topicId],
    stars: current.stars + 1
  });
  return { earned: true, progress };
}

export function recordPlaygroundWord(topicId: string, itemId: string): CartownProgress {
  const current = getCartownProgress();
  const wordId = `${topicId}:${itemId}`;
  if (current.playgroundHeardWordIds.includes(wordId)) return current;
  return saveCartownProgress({
    playgroundHeardWordIds: [...current.playgroundHeardWordIds, wordId]
  });
}

export function completeCartownVehicle(vehicleId: string): { earned: boolean; progress: CartownProgress } {
  const current = getCartownProgress();
  if (!vehicleId || current.learnedVehicleIds.includes(vehicleId)) {
    return { earned: false, progress: current };
  }

  const progress = saveCartownProgress({
    learnedVehicleIds: [...current.learnedVehicleIds, vehicleId],
    stars: current.stars + 1
  });
  return { earned: true, progress };
}

export function clearCartownProgress(): void {
  cachedProgress = null;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  removeStorage(STORAGE_KEY);
}
