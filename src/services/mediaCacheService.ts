import { highResolutionAsset, isCloudAsset } from "@/services/assetService";

type MediaKind = "audio" | "image";

interface CacheEntry {
  path: string;
  size: number;
  lastAccess: number;
  kind: MediaKind;
}

interface CacheIndex {
  version: string;
  entries: Record<string, CacheEntry>;
}

interface CloudTempFile {
  fileID: string;
  tempFileURL: string;
  status: number;
  errMsg?: string;
}

interface FileSystemManagerLike {
  accessSync(path: string): void;
  unlinkSync(path: string): void;
  saveFile(options: {
    tempFilePath: string;
    success(result: { savedFilePath: string }): void;
    fail(error: unknown): void;
  }): void;
  getFileInfo(options: {
    filePath: string;
    success(result: { size: number }): void;
    fail(error: unknown): void;
  }): void;
}

declare const wx: {
  cloud?: {
    getTempFileURL(options: { fileList: string[] }): Promise<{ fileList: CloudTempFile[] }>;
  };
  downloadFile(options: {
    url: string;
    success(result: { statusCode: number; tempFilePath: string }): void;
    fail(error: unknown): void;
  }): unknown;
  getFileSystemManager(): FileSystemManagerLike;
};

const CACHE_VERSION = "explorer-media-2026-07-29-v3";
const CACHE_STORAGE_KEY = "cartown_media_cache_index";
const MAX_CACHE_BYTES = 80 * 1024 * 1024;
const inFlight = new Map<string, Promise<string>>();
let cacheIndex: CacheIndex | null = null;

export async function resolveCachedMedia(source: string, kind: MediaKind): Promise<string> {
  const asset = highResolutionAsset(source);

  // #ifndef MP-WEIXIN
  return asset;
  // #endif

  // #ifdef MP-WEIXIN
  if (!asset || (!isCloudAsset(asset) && !/^https?:\/\//i.test(asset))) {
    return asset;
  }

  const cached = findCachedFile(asset);
  if (cached) {
    touchEntry(asset);
    return cached as string;
  }

  const pending = inFlight.get(asset);
  if (pending) {
    return await (pending as Promise<string>);
  }

  const request = downloadAndCache(asset, kind)
    .catch(async (error) => {
      console.warn("Media cache download failed; using network URL.", error);
      return resolveNetworkUrl(asset);
    })
    .finally(() => inFlight.delete(asset));

  inFlight.set(asset, request);
  return request;
  // #endif
}

export function clearMediaCache(): void {
  // #ifdef MP-WEIXIN
  const index = getCacheIndex();
  for (const entry of Object.values(index.entries)) {
    removeSavedFile(entry.path);
  }
  cacheIndex = { version: CACHE_VERSION, entries: {} };
  persistIndex();
  // #endif
}

async function downloadAndCache(asset: string, kind: MediaKind): Promise<string> {
  const downloadUrl = await resolveNetworkUrl(asset);
  const tempFilePath = await downloadFile(downloadUrl);
  let savedFilePath: string;

  try {
    savedFilePath = await saveFile(tempFilePath);
  } catch {
    evictOldestFiles(MAX_CACHE_BYTES / 2);
    savedFilePath = await saveFile(tempFilePath);
  }

  const size = await fileSize(savedFilePath);
  const index = getCacheIndex();
  index.entries[asset] = {
    path: savedFilePath,
    size,
    lastAccess: Date.now(),
    kind
  };
  enforceCacheLimit();
  persistIndex();
  return savedFilePath;
}

async function resolveNetworkUrl(asset: string): Promise<string> {
  if (!isCloudAsset(asset)) {
    return asset;
  }
  if (typeof wx === "undefined" || !wx.cloud) {
    throw new Error("WeChat CloudBase is unavailable.");
  }

  const result = await wx.cloud.getTempFileURL({ fileList: [asset] });
  const file = result.fileList[0];
  if (!file || file.status !== 0 || !file.tempFileURL) {
    throw new Error(file?.errMsg || "CloudBase did not return a download URL.");
  }
  return file.tempFileURL;
}

function downloadFile(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url,
      success(result) {
        if (result.statusCode >= 200 && result.statusCode < 300 && result.tempFilePath) {
          resolve(result.tempFilePath);
        } else {
          reject(new Error(`Media download failed with HTTP ${result.statusCode}.`));
        }
      },
      fail: reject
    });
  });
}

function saveFile(tempFilePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().saveFile({
      tempFilePath,
      success: (result) => resolve(result.savedFilePath),
      fail: reject
    });
  });
}

function fileSize(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    wx.getFileSystemManager().getFileInfo({
      filePath,
      success: (result) => resolve(result.size || 0),
      fail: () => resolve(0)
    });
  });
}

function getCacheIndex(): CacheIndex {
  if (cacheIndex) {
    return cacheIndex;
  }

  const stored = uni.getStorageSync(CACHE_STORAGE_KEY) as CacheIndex | undefined;
  if (stored?.version === CACHE_VERSION && stored.entries) {
    cacheIndex = stored;
    return cacheIndex;
  }

  if (stored?.entries) {
    for (const entry of Object.values(stored.entries)) {
      removeSavedFile(entry.path);
    }
  }

  cacheIndex = { version: CACHE_VERSION, entries: {} };
  persistIndex();
  return cacheIndex;
}

function findCachedFile(asset: string): string | null {
  const entry = getCacheIndex().entries[asset];
  if (!entry) {
    return null;
  }

  try {
    wx.getFileSystemManager().accessSync(entry.path);
    return entry.path;
  } catch {
    delete getCacheIndex().entries[asset];
    persistIndex();
    return null;
  }
}

function touchEntry(asset: string): void {
  const entry = getCacheIndex().entries[asset];
  if (!entry || Date.now() - entry.lastAccess < 60_000) {
    return;
  }
  entry.lastAccess = Date.now();
  persistIndex();
}

function enforceCacheLimit(): void {
  const total = Object.values(getCacheIndex().entries).reduce((sum, entry) => sum + entry.size, 0);
  if (total > MAX_CACHE_BYTES) {
    evictOldestFiles(MAX_CACHE_BYTES * 0.8);
  }
}

function evictOldestFiles(targetBytes: number): void {
  const index = getCacheIndex();
  const entries = Object.entries(index.entries).sort(([, first], [, second]) => first.lastAccess - second.lastAccess);
  let total = entries.reduce((sum, [, entry]) => sum + entry.size, 0);

  for (const [asset, entry] of entries) {
    if (total <= targetBytes) {
      break;
    }
    removeSavedFile(entry.path);
    total -= entry.size;
    delete index.entries[asset];
  }
  persistIndex();
}

function removeSavedFile(path: string): void {
  try {
    wx.getFileSystemManager().unlinkSync(path);
  } catch {
    // The client may already have cleared this cached file.
  }
}

function persistIndex(): void {
  if (cacheIndex) {
    uni.setStorageSync(CACHE_STORAGE_KEY, cacheIndex);
  }
}
