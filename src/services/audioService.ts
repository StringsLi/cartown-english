import { phraseAudioPath } from "@/services/audioCatalog";
import { invalidateCachedMedia, resolveCachedMedia } from "@/services/mediaCacheService";
import { ref, readonly } from "vue";
import { getStorage, setStorage } from "@/utils/storage";

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
type AudioPhase = "idle" | "loading" | "playing" | "ended" | "error";
const state = ref<{ phase: AudioPhase; label: string; canReplay: boolean }>({ phase: "idle", label: "", canReplay: false });
export const audioPlaybackState = readonly(state);
let replay: { url: string; label?: string; onStarted?: () => void } | null = null;
let volume: number | null = null;
export function getAudioVolume(): number {
  if (volume === null) {
    const stored = getStorage<number>("cartown_audio_volume");
    volume = typeof stored === "number" && Number.isFinite(stored) ? Math.min(1, Math.max(0, stored)) : 1;
  }
  return volume;
}
export function setAudioVolume(value: number): void {
  if (!Number.isFinite(value)) return;
  volume = Math.min(1, Math.max(0, value));
  setStorage("cartown_audio_volume", volume);
  if (currentAudio) currentAudio.volume = volume;
}
export function replayAudio(): void {
  if (replay) playAudio(replay.url, replay.label, replay.onStarted);
}

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
    stopAudio();
    state.value = { phase: "error", label: "这段声音还没有准备好", canReplay: false };
    uni.showToast({ title: "这段声音还没有准备好", icon: "none" });
    return;
  }

  const requestId = ++playbackRequest;
  destroyCurrentAudio();
  replay = { url, label: fallbackText, onStarted };
  state.value = { phase: "loading", label: fallbackText || "英语点读", canReplay: true };
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
      state.value = { phase: "playing", label: fallbackText || "英语点读", canReplay: true };
      onStarted?.();
    });
    audio.onEnded(() => {
      if (currentAudio !== audio || requestId !== playbackRequest) return;
      destroyCurrentAudio();
      state.value = { phase: "ended", label: fallbackText || "英语点读", canReplay: true };
    });
    audio.onError(() => {
      if (currentAudio !== audio || requestId !== playbackRequest) return;
      destroyCurrentAudio();
      invalidateCachedMedia(url);
      handleAudioFailure();
    });
    audio.volume = getAudioVolume();
    audio.autoplay = true;
    audio.src = playableUrl;
  } catch (error) {
    console.warn("Unable to resolve cached audio.", error);
    if (requestId === playbackRequest) handleAudioFailure();
  }
}

export function stopAudio(): void {
  playbackRequest += 1;
  destroyCurrentAudio();
  replay = null;
  state.value = { phase: "idle", label: "", canReplay: false };
}

function destroyCurrentAudio(): void {
  if (!currentAudio) return;
  const audio = currentAudio;
  currentAudio = null;
  audio.stop();
  audio.destroy();
}

function handleAudioFailure(): void {
  state.value = { phase: "error", label: "声音没有播出来，点一下再试试", canReplay: !!replay };
  uni.showToast({
    title: "声音加载失败，请再试一次",
    icon: "none"
  });
}

export function speakEnglish(text: string, onStarted?: () => void): void {
  if (!text) return;
  playAudio(phraseAudioPath(text), text, onStarted);
}
