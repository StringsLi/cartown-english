import { ref } from "vue";
import { getStorage, setStorage } from "@/utils/storage";
import { configureAudioPlayback, getAudioVolume, stopAudio } from "@/services/audioService";
import { resolveCachedMedia, invalidateCachedMedia } from "@/services/mediaCacheService";
import { listeningTracks } from "../catalog";

export const LISTENING_KEY = "cartown_listening_queue_v1";
type Phase = "idle" | "loading" | "playing" | "paused" | "ended" | "error";
interface SavedQueue { ids: string[]; index: number; position: number; timerMinutes: number; remainingMs: number; repeat: boolean; }
const finite = (value: unknown, fallback = 0) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
export function normalizeQueue(raw?: Partial<SavedQueue> | null): SavedQueue {
  const valid = new Set(listeningTracks.map(track => track.id));
  const ids = Array.isArray(raw?.ids) ? [...new Set(raw.ids.filter(id => valid.has(id)))] : listeningTracks.filter(t => t.kind === "story").map(t => t.id);
  const timerMinutes = [0, 5, 10, 15].includes(raw?.timerMinutes ?? -1) ? raw!.timerMinutes! : 10;
  return { ids, index: Math.min(Math.floor(finite(raw?.index)), Math.max(0, ids.length - 1)), position: Math.min(finite(raw?.position), 3600),
    timerMinutes, remainingMs: Math.min(finite(raw?.remainingMs, timerMinutes * 60000), timerMinutes * 60000), repeat: raw?.repeat === true };
}

/** A page-owned player: hiding the page always pauses; resume is an explicit tap. */
export function createListeningPlayer() {
  const state = ref({ ...normalizeQueue(getStorage<SavedQueue>(LISTENING_KEY)), phase: "idle" as Phase, duration: 0, note: "选好声音，把手机放在一旁，慢慢听。" });
  let audio: UniApp.InnerAudioContext | null = null;
  let request = 0, lastTick = 0, lastSave = 0;
  let ticker: ReturnType<typeof setInterval> | undefined;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  const current = () => listeningTracks.find(track => track.id === state.value.ids[state.value.index]);
  function save() {
    const { ids, index, position, timerMinutes, remainingMs, repeat } = state.value;
    setStorage(LISTENING_KEY, { ids: [...ids], index, position, timerMinutes, remainingMs, repeat });
  }
  function release() {
    request++;
    clearInterval(ticker); ticker = undefined;
    clearTimeout(watchdog); watchdog = undefined;
    const previous = audio; audio = null;
    if (previous) { previous.stop(); previous.destroy(); }
  }
  function accountTime() {
    const now = Date.now();
    if (state.value.phase === "playing" && state.value.timerMinutes) state.value.remainingMs = Math.max(0, state.value.remainingMs - Math.max(0, now - lastTick));
    lastTick = now;
  }
  function pause(note = "已暂停，下次从这里继续。") {
    accountTime();
    if (audio && Number.isFinite(audio.currentTime) && (state.value.phase === "playing" || audio.currentTime > 0)) state.value.position = audio.currentTime;
    release();
    state.value.phase = "paused"; state.value.note = note; save();
  }
  function checkTime() {
    accountTime();
    if (state.value.timerMinutes && state.value.remainingMs <= 0) {
      pause("定时时间到啦，今天先听到这里。继续播放会重新计时。");
      return false;
    }
    return true;
  }
  async function play() {
    if (disposed || !current() || ["playing", "loading"].includes(state.value.phase)) return;
    stopAudio(); configureAudioPlayback();
    if (state.value.timerMinutes && state.value.remainingMs <= 0) state.value.remainingMs = state.value.timerMinutes * 60000;
    release(); const token = request, track = current()!;
    state.value.phase = "loading"; state.value.note = "正在准备声音…";
    const fail = () => {
      if (token !== request || disposed) return;
      if (audio && Number.isFinite(audio.currentTime) && audio.currentTime > 0) state.value.position = audio.currentTime;
      accountTime(); release(); invalidateCachedMedia(track.audio);
      state.value.phase = "error"; state.value.note = "这段声音暂时没能播放，可以重试或选择下一段。"; save();
    };
    watchdog = setTimeout(fail, 20000);
    try {
      const src = await resolveCachedMedia(track.audio, "audio");
      if (token !== request || disposed) return;
      const context = uni.createInnerAudioContext(); audio = context;
      let resumeAt = state.value.position;
      const active = () => token === request && audio === context && !disposed;
      const applyResume = () => {
        if (resumeAt <= 0 || !Number.isFinite(context.duration) || context.duration <= 0) return;
        const position = Math.min(resumeAt, Math.max(0, context.duration - 0.1));
        resumeAt = 0; // Clear before seek, which may synchronously emit updates.
        context.seek(position); state.value.position = position;
      };
      context.onPlay(() => {
        if (!active()) return;
        clearTimeout(watchdog); watchdog = undefined;
        lastTick = Date.now(); lastSave = lastTick;
        state.value.phase = "playing"; state.value.note = "正在陪你听，想停就停。";
        clearInterval(ticker);
        ticker = setInterval(() => { if (active()) checkTime(); }, 250);
      });
      context.onTimeUpdate(() => {
        if (!active()) return;
        state.value.position = finite(context.currentTime);
        state.value.duration = finite(context.duration);
        applyResume();
        if (checkTime() && Date.now() - lastSave >= 5000) { save(); lastSave = Date.now(); }
      });
      context.onCanplay(() => {
        if (!active()) return;
        state.value.duration = finite(context.duration);
        // H5 does not consistently apply startTime on a fresh audio source.
        applyResume();
      });
      context.onPause(() => {
        // HTMLAudio emits pause immediately before ended at a natural finish.
        // Let ended advance the queue instead of destroying its event source.
        if (active() && !(context.duration > 0 && context.currentTime >= context.duration - 0.05)) pause("声音已暂停，点继续播放即可续听。");
      });
      context.onEnded(() => {
        if (!active() || !checkTime()) return;
        release(); state.value.position = 0; state.value.duration = 0;
        if (state.value.index + 1 < state.value.ids.length) state.value.index++;
        else if (state.value.repeat) state.value.index = 0;
        else { state.value.index = 0; state.value.phase = "ended"; state.value.note = "列表听完啦，和孩子去生活里玩一玩吧。"; save(); return; }
        state.value.phase = "paused"; save(); void play();
      });
      context.onError(fail);
      context.autoplay = false;
      context.volume = getAudioVolume();
      context.startTime = state.value.position;
      context.src = src;
      context.play();
    } catch { fail(); }
  }
  function choose(index: number, autoplay = false) {
    if (!Number.isInteger(index) || index < 0 || index >= state.value.ids.length) return;
    pause(); state.value.index = index; state.value.position = 0; state.value.duration = 0; save();
    if (autoplay) void play();
  }
  function skip(delta: number) {
    const count = state.value.ids.length;
    if (!count || ![-1, 1].includes(delta)) return;
    const next = state.value.index + delta;
    choose(state.value.repeat ? (next + count) % count : next, state.value.phase === "playing" || state.value.phase === "loading");
  }
  function seek(seconds: number) {
    if (!Number.isFinite(seconds) || !state.value.duration) return;
    state.value.position = Math.min(Math.max(seconds, 0), Math.max(0, state.value.duration - 0.1));
    audio?.seek(state.value.position); save();
  }
  function toggle(id: string) {
    if (disposed || !listeningTracks.some(track => track.id === id)) return;
    const previous = current()?.id;
    // Editing another entry must not cancel this track or its pending load.
    if (previous === id) pause("播放列表已更新，点继续播放开始听。");
    state.value.ids = state.value.ids.includes(id) ? state.value.ids.filter(value => value !== id) : [...state.value.ids, id];
    const index = state.value.ids.indexOf(previous || "");
    state.value.index = index >= 0 ? index : Math.min(state.value.index, Math.max(0, state.value.ids.length - 1));
    if (index < 0) {
      state.value.position = 0; state.value.duration = 0;
      state.value.note = state.value.ids.length ? "播放列表已更新，点继续播放开始听。" : "列表是空的，加入喜欢的故事或儿歌吧。";
    }
    save();
  }
  function move(index: number, delta: number) {
    const next = index + delta;
    if (index < 0 || next < 0 || index >= state.value.ids.length || next >= state.value.ids.length) return;
    const id = current()?.id;
    const ids = [...state.value.ids]; [ids[index], ids[next]] = [ids[next], ids[index]];
    state.value.ids = ids; state.value.index = ids.indexOf(id!); save();
  }
  function setTimer(minutes: number) {
    if (![0, 5, 10, 15].includes(minutes)) return;
    accountTime(); state.value.timerMinutes = minutes; state.value.remainingMs = minutes * 60000; save();
  }
  function toggleRepeat() { state.value.repeat = !state.value.repeat; save(); }
  function restore() {
    if (disposed || ["playing", "loading"].includes(state.value.phase)) return;
    Object.assign(state.value, normalizeQueue(getStorage<SavedQueue>(LISTENING_KEY)), { duration: 0 });
  }
  function dispose() { if (!disposed) { pause(); disposed = true; } }
  return { state, current, play, pause, choose, skip, seek, toggle, move, setTimer, toggleRepeat, restore, dispose };
}
