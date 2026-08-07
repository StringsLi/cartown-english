export type BookLevel = "A" | "B" | "C";

export type BookTheme =
  | "Animals"
  | "Colors"
  | "Food"
  | "Family"
  | "Toys"
  | "Actions"
  | "Bedtime"
  | "Daily Life"
  | "Vehicles";

export type VehicleStoryId = "red-car" | "digger" | "fire-truck" | "city-bus";

export type ReadStatus = "not_started" | "reading" | "completed";

export interface Book {
  id: string;
  title: string;
  cover: string;
  level: BookLevel;
  ageRange: string;
  theme: BookTheme;
  description: string;
  keywords: string[];
  targetSentence: string;
  pageCount: number;
  isPublished: boolean;
  sort: number;
  vehicleStoryId?: VehicleStoryId;
}

export interface Hotspot {
  word: string;
  wordCn: string;
  phonetic: string;
  audio: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BookPage {
  id: string;
  bookId: string;
  pageIndex: number;
  image: string;
  sentence: string;
  sentenceCn: string;
  audio: string;
  hotspots: Hotspot[];
  vehicleStoryId?: VehicleStoryId;
}

export interface Word {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  image: string;
  audio: string;
  level: BookLevel;
  theme: BookTheme;
}

export interface UserProgress {
  userId: string;
  bookId: string;
  readStatus: ReadStatus;
  currentPage: number;
  readCount: number;
  lastReadAt: string;
  completedAt?: string;
}

export interface RepeatRecord {
  userId: string;
  bookId: string;
  sentence: string;
  audioUrl: string;
  durationSeconds?: number;
  createdAt: string;
}

export interface GameRecord {
  userId: string;
  bookId: string;
  gameType: "listen_choose_image";
  score: number;
  total: number;
  createdAt: string;
}

export interface ParentQuestion {
  en: string;
  cn: string;
}

export interface ParentTip {
  bookId: string;
  title: string;
  questions: ParentQuestion[];
  activity: string;
}
