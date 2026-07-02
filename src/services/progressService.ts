import { mockBooks } from "@/mock/books";
import type { GameRecord, ReadStatus, RepeatRecord, UserProgress } from "@/types/book";
import { formatDateTime, isYesterday, todayKey } from "@/utils/date";
import { getStorage, removeStorage, setStorage } from "@/utils/storage";

const STORAGE_KEY = "little_english_book_progress";
const DEFAULT_USER_ID = "local_child";

export interface LearningState {
  userId: string;
  childNickname: string;
  streakDays: number;
  lastStudyDate: string;
  readBookIds: string[];
  progressMap: Record<string, UserProgress>;
  repeatRecords: RepeatRecord[];
  gameRecords: GameRecord[];
}

export interface HomeStats {
  todayCompleted: boolean;
  streakDays: number;
  readBookCount: number;
  learnedWordCount: number;
  lastReadAt?: string;
}

const defaultState: LearningState = {
  userId: DEFAULT_USER_ID,
  childNickname: "Little Reader",
  streakDays: 0,
  lastStudyDate: "",
  readBookIds: [],
  progressMap: {},
  repeatRecords: [],
  gameRecords: []
};

export function getLearningState(): LearningState {
  const stored = getStorage<LearningState>(STORAGE_KEY);

  return {
    ...defaultState,
    ...stored,
    readBookIds: stored?.readBookIds ?? [],
    progressMap: stored?.progressMap ?? {},
    repeatRecords: stored?.repeatRecords ?? [],
    gameRecords: stored?.gameRecords ?? []
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

  touchStudyStreak(state);

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
  const nextRecord: RepeatRecord = {
    userId: state.userId,
    createdAt: formatDateTime(),
    ...record
  };

  state.repeatRecords.unshift(nextRecord);
  saveLearningState(state);

  return nextRecord;
}

export function saveGameRecord(record: Omit<GameRecord, "userId" | "createdAt">): GameRecord {
  const state = getLearningState();
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
    lastReadAt: latest
  };
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
