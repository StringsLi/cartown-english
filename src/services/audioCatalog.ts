const PHRASE_AUDIO_ROOT = "/static/audio/phrases";

export function normalizeEnglishPhrase(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export function phraseAudioPath(text: string): string {
  return `${PHRASE_AUDIO_ROOT}/${phraseHash(normalizeEnglishPhrase(text))}.mp3`;
}

function phraseHash(text: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}
