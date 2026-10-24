import { playgroundTopics } from "@/mock/playground";
import { getStorage, removeStorage, setStorage } from "@/utils/storage";
import type { WordPractice } from "@/services/playgroundLearningService";

const KEY = "cartown_favorite_words_v1";
const catalog = playgroundTopics.flatMap(topic => topic.items.map(item => ({
  ...item, key: `${topic.id}:${item.id}`, topicId: topic.id, topicTitle: topic.title, tint: topic.tint
})));
const validKeys = new Set(catalog.map(item => item.key));

export function getFavoriteWords(): string[] {
  const raw = getStorage<unknown>(KEY);
  return Array.isArray(raw) ? [...new Set(raw.filter((key): key is string => typeof key === "string" && validKeys.has(key)))] : [];
}

export function toggleFavoriteWord(key: string): string[] {
  const favorites = getFavoriteWords();
  if (!validKeys.has(key)) return favorites;
  const next = favorites.includes(key) ? favorites.filter(value => value !== key) : [...favorites, key];
  setStorage(KEY, next);
  return next;
}

export function clearFavoriteWords(): void { removeStorage(KEY); }

export function getWordbookEntries(heardIds: string[], words: Record<string, WordPractice>, favorites: string[], reviewIds: string[]) {
  const heard = new Set(heardIds), starred = new Set(favorites), due = new Set(reviewIds);
  return catalog.map(item => ({ ...item, heard: heard.has(item.key), favorite: starred.has(item.key),
    independent: (words[item.key]?.correct || 0) > 0, review: due.has(item.key) }));
}
