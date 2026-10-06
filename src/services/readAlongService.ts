import { phraseHash } from '@/services/audioCatalog';
import { isCloudAsset } from '@/services/assetService';
import { navigate, backTo } from '@/services/navigationService';

export interface ReadAlongContext {
  key: string; title: string; sentence: string; sentenceCn?: string;
  audio: string; returnUrl: string; bookId?: string;
}
export function parentQuestionAudio(text: string): string { return '/pkg-speaking/static/audio/parent-questions/' + phraseHash(text) + '.mp3'; }
const CACHE_KEY = 'cartown_read_along_contexts_v1';
const MAX_CONTEXTS = 40;
const readingRoutes = new Set(['pages/index/index', 'pages/vehicles/index', 'pkg-reading/book-detail/index', 'pkg-reading/reader/index', 'pkg-reading/point-read/index', 'pkg-learning/playground-game/index', 'pkg-music/index/index', 'pkg-space/body/index', 'pkg-adventure/delivery/index', 'pkg-adventure/roleplay/index', 'pkg-world/world/index', 'pkg-cars/car-learn/index', 'pkg-cars/car-logos/index', 'pkg-cars/car-colors/index', 'pkg-cars/car-count/index', 'pkg-cars/car-traffic/index']);
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
export function isReadAlongAudio(value: string): boolean {
  if (/^\/(?:pkg-(?:cars|learning|reading|music|space|adventure|speaking)\/)?static\/audio\/[a-zA-Z0-9/_-]+\.(mp3|wav)$/.test(value)) return true;
  if (/^\/pkg-learning\/static\/playground-audio\/[a-zA-Z0-9_-]+\.mp3$/.test(value)) return true;
  return isCloudAsset(value) && /\/source-assets\/audio-original\/[a-zA-Z0-9/_-]+\.(mp3|wav)$/.test(value);
}
export function isReadingReturnUrl(value: string): boolean {
  return value.length <= 800 && /^\/(?:pages|pkg-(?:cars|learning|reading|music|space|adventure|world))\/[a-z-]+\/index(?:\?[^\s#]*)?$/.test(value)
    && readingRoutes.has(value.slice(1).split('?')[0]) && !value.includes('..');
}
export function normalizeReadAlong(value: unknown): ReadAlongContext | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Partial<ReadAlongContext>;
  const key = clean(v.key, 96), title = clean(v.title, 80), sentence = clean(v.sentence, 500);
  const audio = clean(v.audio, 500), returnUrl = clean(v.returnUrl, 800);
  if (!/^[a-zA-Z0-9:_-]{1,96}$/.test(key) || !title || !sentence || !isReadAlongAudio(audio) || !isReadingReturnUrl(returnUrl)) return null;
  const bookId = typeof v.bookId === 'string' && /^book_[a-zA-Z0-9_-]+$/.test(v.bookId) ? v.bookId : undefined;
  return { key, title, sentence, sentenceCn: clean(v.sentenceCn, 300), audio, returnUrl, ...(bookId ? { bookId } : {}) };
}
export function getReadAlongContext(id: string): ReadAlongContext | null {
  if (!/^[a-zA-Z0-9:_-]{1,96}$/.test(id)) return null;
  const stored: unknown = uni.getStorageSync(CACHE_KEY);
  if (!Array.isArray(stored)) return null;
  return stored.map(normalizeReadAlong).find(c => c?.key === id) || null;
}
export function openReadAlong(context: ReadAlongContext): void {
  const valid = normalizeReadAlong(context);
  if (!valid) { uni.showToast({ title: '这段跟读还没准备好，请重新打开学习页', icon: 'none' }); return; }
  // Source identity also includes the spoken text; changing a card never changes an active recording.
  const key = valid.key.slice(0, 75) + ':' + phraseHash(valid.sentence);
  const stored: unknown = uni.getStorageSync(CACHE_KEY);
  const previous = Array.isArray(stored) ? stored.map(normalizeReadAlong).filter((c): c is ReadAlongContext => !!c && c.key !== key) : [];
  try { uni.setStorageSync(CACHE_KEY, [{ ...valid, key }, ...previous].slice(0, MAX_CONTEXTS)); }
  catch { uni.showToast({ title: '跟读准备未保存，请检查本机存储后重试', icon: 'none' }); return; }
  navigate({ url: '/pkg-speaking/record/index?practice=' + encodeURIComponent(key) });
}
export function returnToReading(url: string): void {
  const target = isReadingReturnUrl(url) ? url : '/pages/index/index';
  const pages = getCurrentPages();
  const previous = pages[pages.length - 2];
  // A full native page stack may replace the source page instead of pushing a new one.
  if (previous?.route === target.slice(1).split('?')[0]) backTo(target);
  else navigate({ url: target }, 'redirectTo');
}
