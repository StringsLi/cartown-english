type SpeakOptions = {
  rate?: number;
  pitch?: number;
  lang?: string;
  onEnd?: () => void;
};

const defaultVoiceOptions = {
  lang: 'en-US',
  rate: 0.82,
  pitch: 1.15,
};

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking() {
  if (canSpeak()) {
    window.speechSynthesis.cancel();
  }
}

export function speakEnglish(text: string, options: SpeakOptions = {}) {
  if (!canSpeak()) {
    options.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang ?? defaultVoiceOptions.lang;
  utterance.rate = options.rate ?? defaultVoiceOptions.rate;
  utterance.pitch = options.pitch ?? defaultVoiceOptions.pitch;
  utterance.onend = () => options.onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function speakVehicle(word: string, sentence: string) {
  speakEnglish(`${word}. ${sentence}`);
}

export function speakPraise() {
  speakEnglish('Great job!', { rate: 0.9, pitch: 1.25 });
}

export function speakTryAgain() {
  speakEnglish('Try again!', { rate: 0.85, pitch: 1.1 });
}
