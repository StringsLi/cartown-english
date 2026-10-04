import {
  CLOUD_ENV_ID,
  CLOUD_STORAGE_BUCKET,
  CLOUD_STORAGE_ROOT
} from "@/config/cloud";

const CLOUD_ASSET_ROOT = `${CLOUD_STORAGE_ROOT}/source-assets`;
const CLOUD_FILE_PREFIX = `cloud://${CLOUD_ENV_ID}.${CLOUD_STORAGE_BUCKET}/`;

export function highResolutionAsset(path: string): string {
  if (!path || path.startsWith("cloud://") || /^https?:\/\//i.test(path)) {
    return path;
  }

  const cloudPath = originalAssetPath(path);
  // #ifdef H5
  // The web build serves original images itself; CloudBase file IDs require wx.cloud.
  if (typeof window !== "undefined" && cloudPath && /\.(?:png|jpe?g|webp|svg)$/i.test(path)) {
    return `/static/${cloudPath.replace(/^(books|topic-icons|cartown-logos)-original\//, "$1/")}`;
  }
  // #endif
  return cloudPath ? `${CLOUD_FILE_PREFIX}${CLOUD_ASSET_ROOT}/${cloudPath}` : path;
}

export function isCloudAsset(path: string): boolean {
  return path.startsWith(CLOUD_FILE_PREFIX);
}

function originalAssetPath(path: string): string | null {
  const normalized = path.replace(/\\/g, "/").replace(/^\/+/, "");

  const bookMatch = normalized.match(/^static\/books\/([^/]+)\/([^/]+)\.(?:jpe?g|webp)$/i);
  if (bookMatch) {
    return `books-original/${bookMatch[1]}/${bookMatch[2]}.jpg`;
  }

  const topicMatch = normalized.match(/^static\/topic-icons\/(flags|maps|vehicles)\/([^/]+)\.(?:png|webp|svg)$/i);
  if (topicMatch) {
    return `topic-icons-original/${topicMatch[1]}/${topicMatch[2]}.png`;
  }

  const logoMatch = normalized.match(/^static\/cartown-logos\/([^/]+)\.(?:png|webp)$/i);
  if (logoMatch) {
    return `cartown-logos-original/${logoMatch[1]}.png`;
  }

  const phraseMatch = normalized.match(/^static\/audio\/phrases\/([^/]+)\.mp3$/i);
  if (phraseMatch) {
    return `audio-original/phrases/${phraseMatch[1]}.mp3`;
  }

  // Car model names are bundled MP3 files, not cloud-hosted WAV originals.
  if (/^static\/audio\/car-models\/[^/]+\.mp3$/i.test(normalized)) {
    return null;
  }

  const audioMatch = normalized.match(/^static\/audio\/([^/]+)\/([^/]+)\.(?:mp3|wav)$/i);
  if (audioMatch) {
    return `audio-original/${audioMatch[1]}/${audioMatch[2]}.wav`;
  }

  return null;
}
