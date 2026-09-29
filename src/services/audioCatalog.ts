import { highResolutionAsset } from "@/services/assetService";

const PHRASE_AUDIO_ROOT = "/static/audio/phrases";
const PACKAGED_PHRASE_AUDIO_ROOT = "/pkg-reading/static/audio/phrases";
const PACKAGED_PHRASE_AUDIO = new Set([
  "01842735.mp3",
  "3cb635ae.mp3",
  "7142b4f4.mp3",
  "7e297770.mp3",
  "96f3858c.mp3",
  "9dd6ec65.mp3",
  "a0619613.mp3",
  "a3530ee2.mp3",
  "b559cddd.mp3",
  "ebb03227.mp3"
]);

export function normalizeEnglishPhrase(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export function phraseAudioPath(text: string): string {
  const fileName = phraseAudioFileName(text);
  if (PACKAGED_PHRASE_AUDIO.has(fileName)) {
    return `${PACKAGED_PHRASE_AUDIO_ROOT}/${fileName}`;
  }

  return highResolutionAsset(`${PHRASE_AUDIO_ROOT}/${fileName}`);
}

export function phraseAudioFileName(text: string): string {
  return `${phraseHash(normalizeEnglishPhrase(text))}.mp3`;
}

export function phraseHash(text: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}
