import { phraseAudioPath } from "@/services/audioCatalog";
import { resolveCachedMedia } from "@/services/mediaCacheService";

declare const wx: {
  setInnerAudioOption(options: {
    obeyMuteSwitch: boolean;
    mixWithOther: boolean;
    fail?(error: unknown): void;
  }): void;
};

let currentAudio: UniApp.InnerAudioContext | null = null;
let playbackRequest = 0;
let audioConfigured = false;

export function configureAudioPlayback(): void {
  // #ifdef MP-WEIXIN
  if (audioConfigured || typeof wx === "undefined" || !wx.setInnerAudioOption) {
    return;
  }

  wx.setInnerAudioOption({
    obeyMuteSwitch: false,
    mixWithOther: true,
    fail: (error) => console.warn("Unable to configure WeChat audio output.", error)
  });
  audioConfigured = true;
  // #endif
}

export function playAudio(url?: string, fallbackText?: string): void {
  if (!url) {
    if (fallbackText) {
      speakEnglish(fallbackText);
    } else {
      uni.showToast({ title: "音频稍后补充", icon: "none" });
    }
    return;
  }

  const requestId = ++playbackRequest;
  destroyCurrentAudio();
  void startPlayback(url, fallbackText, requestId);
}

async function startPlayback(url: string, fallbackText: string | undefined, requestId: number): Promise<void> {
  try {
    configureAudioPlayback();
    const playableUrl = await resolveCachedMedia(url, "audio");
    if (requestId !== playbackRequest) {
      return;
    }

    const audio = uni.createInnerAudioContext();
    currentAudio = audio;
    audio.src = playableUrl;
    audio.autoplay = true;
    audio.volume = 1;
    audio.onEnded(() => {
      if (currentAudio === audio) {
        destroyCurrentAudio();
      }
    });
    audio.onError(() => {
      if (currentAudio === audio) {
        destroyCurrentAudio();
      }
      handleAudioFailure(fallbackText);
    });
  } catch (error) {
    console.warn("Unable to resolve cached audio.", error);
    if (requestId === playbackRequest) {
      handleAudioFailure(fallbackText);
    }
  }
}

export function stopAudio(): void {
  playbackRequest += 1;
  destroyCurrentAudio();
}

function destroyCurrentAudio(): void {
  if (!currentAudio) {
    return;
  }

  currentAudio.stop();
  currentAudio.destroy();
  currentAudio = null;
}

function handleAudioFailure(fallbackText?: string): void {
  if (fallbackText) {
    speakWithBrowserVoice(fallbackText);
  } else {
    uni.showToast({ title: "音频加载失败，请重试", icon: "none" });
  }
}

function scoreEnglishVoice(voice: SpeechSynthesisVoice): number {
  const lang = voice.lang.toLowerCase();
  const name = voice.name.toLowerCase();

  if (!lang.startsWith("en")) {
    return -1;
  }

  let score = 0;

  if (lang === "en-us") {
    score += 30;
  } else if (lang === "en-gb") {
    score += 24;
  } else if (lang.startsWith("en-")) {
    score += 18;
  }

  if (name.includes("natural") || name.includes("neural") || name.includes("online")) {
    score += 35;
  }

  if (/(aria|jenny|ava|emma|samantha|karen|google|brian|daniel|alex|guy|zira)/.test(name)) {
    score += 20;
  }

  if (name.includes("compact") || name.includes("desktop")) {
    score -= 8;
  }

  return score;
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return voices
    .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
    .sort((a, b) => scoreEnglishVoice(b) - scoreEnglishVoice(a))[0] ?? null;
}

function speakWithBrowserVoice(text: string): void {
  if (!text) {
    return;
  }

  // #ifdef H5
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickEnglishVoice();

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }

    utterance.rate = 0.94;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
    return;
  }
  // #endif

  uni.showToast({ title: text, icon: "none" });
}

export function speakEnglish(text: string): void {
  if (!text) {
    return;
  }

  playAudio(phraseAudioPath(text), text);
}