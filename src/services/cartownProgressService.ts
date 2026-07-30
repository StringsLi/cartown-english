import { getStorage, removeStorage, setStorage } from "@/utils/storage";

const STORAGE_KEY = "cartown_english_progress";

export interface CartownProgress {
  stars: number;
  learnedVehicleIndex: number;
  logoIndex: number;
  logoQuizDone: number;
  storyBookIndex: number;
  storyPageIndex: number;
  colorQuestionsDone: number;
  countQuestionsDone: number;
  trafficTurnsDone: number;
}

const defaultProgress: CartownProgress = {
  stars: 0,
  learnedVehicleIndex: 0,
  logoIndex: 0,
  logoQuizDone: 0,
  storyBookIndex: 0,
  storyPageIndex: 0,
  colorQuestionsDone: 0,
  countQuestionsDone: 0,
  trafficTurnsDone: 0
};

export function getCartownProgress(): CartownProgress {
  return {
    ...defaultProgress,
    ...(getStorage<CartownProgress>(STORAGE_KEY) ?? {})
  };
}

export function saveCartownProgress(progress: Partial<CartownProgress>): CartownProgress {
  const nextProgress = {
    ...getCartownProgress(),
    ...progress
  };

  setStorage(STORAGE_KEY, nextProgress);
  return nextProgress;
}

export function addCartownStar(count = 1): CartownProgress {
  const current = getCartownProgress();

  return saveCartownProgress({
    stars: current.stars + count
  });
}

export function clearCartownProgress(): void {
  removeStorage(STORAGE_KEY);
}
