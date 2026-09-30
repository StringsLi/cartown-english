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
  if (audioConfigured || typeof wx === "undefined" || !wx.setInnerAudioOption) {
    return;
  }

  wx.setInnerAudioOption({
    obeyMuteSwitch: false,
    mixWithOther: true,
    fail: (error) => console.warn("Unable to configure WeChat audio output.", error)
  });
  audioConfigured = true;
}

export function playAudio(url?: string, fallbackText?: string, onStarted?: () => void): void {
  if (!url) {
    uni.showToast({ title: fallbackText || "Audio unavailable", icon: "none" });
    return;
  }

  const requestId = ++playbackRequest;
  destroyCurrentAudio();
  void startPlayback(url, fallbackText, requestId, onStarted);
}

async function startPlayback(url: string, fallbackText: string | undefined, requestId: number, onStarted?: () => void): Promise<void> {
  try {
    configureAudioPlayback();
    const playableUrl = await resolveCachedMedia(url, "audio");
    if (requestId !== playbackRequest) return;

    const audio = uni.createInnerAudioContext();
    currentAudio = audio;
    let started = false;
    audio.onPlay(() => {
      if (started || currentAudio !== audio || requestId !== playbackRequest) return;
      started = true;
      onStarted?.();
    });
    audio.src = playableUrl;
    audio.autoplay = true;
    audio.volume = 1;
    audio.onEnded(() => {
      if (currentAudio === audio) destroyCurrentAudio();
    });
    audio.onError(() => {
      if (currentAudio === audio) destroyCurrentAudio();
      handleAudioFailure(fallbackText);
    });
  } catch (error) {
    console.warn("Unable to resolve cached audio.", error);
    if (requestId === playbackRequest) handleAudioFailure(fallbackText);
  }
}

export function stopAudio(): void {
  playbackRequest += 1;
  destroyCurrentAudio();
}

function destroyCurrentAudio(): void {
  if (!currentAudio) return;
  currentAudio.stop();
  currentAudio.destroy();
  currentAudio = null;
}

function handleAudioFailure(fallbackText?: string): void {
  uni.showToast({
    title: fallbackText ? "Audio unavailable, please try again" : "Audio failed to load",
    icon: "none"
  });
}

export function speakEnglish(text: string): void {
  if (!text) return;
  playAudio(phraseAudioPath(text), text);
}
