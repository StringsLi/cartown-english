import { readonly, ref } from "vue";
import { configureAudioPlayback, getAudioVolume, stopAudio } from "@/services/audioService";

export interface SavedRecording { filePath: string; durationSeconds: number }
export interface RecordSession { started: Promise<void>; finished: Promise<SavedRecording> }
interface ActiveSession {
  started: boolean; stopped: boolean; stopRequested: boolean; startedAt: number; maxSeconds: number;
  resolveStart(): void; rejectStart(error: unknown): void;
  resolveFinish(result: SavedRecording): void; rejectFinish(error: unknown): void;
  finished: Promise<SavedRecording>; startTimer?: ReturnType<typeof setTimeout>;
}
let recorderManager: UniApp.RecorderManager | null = null;
let active: ActiveSession | null = null, pendingStart = false, startVersion = 0;
let recordAudio: UniApp.InnerAudioContext | null = null;
const playback = ref<{ phase: "idle" | "loading" | "playing" | "ended" | "error"; path: string }>({ phase: "idle", path: "" });
export const recordPlaybackState = readonly(playback);

// 只安装一次原生监听，系统自动停止、手动停止共用同一份保存结果。
function getRecorderManager(): UniApp.RecorderManager {
  if (!recorderManager) {
    recorderManager = uni.getRecorderManager();
    recorderManager.onStart(() => {
      const session = active; if (!session || session.stopped || session.started) return;
      clearTimeout(session.startTimer); session.started = true; session.startedAt = Date.now(); session.resolveStart();
      if (session.stopRequested) { try { recorderManager!.stop(); } catch (error) { failCapture(error); } }
    });
    recorderManager.onStop(async (result: { tempFilePath?: string; duration?: number }) => {
      const session = active; if (!session || session.stopped) return;
      session.stopped = true; clearTimeout(session.startTimer);
      if (!session.started) session.rejectStart(new Error("录音没有成功开始，请再试一次"));
      try {
        if (!result.tempFilePath) throw new Error("没有录到声音，请再试一次");
        const filePath = await saveRecordFile(result.tempFilePath);
        const duration = typeof result.duration === "number" && result.duration > 0 ? result.duration : Date.now() - session.startedAt;
        session.resolveFinish({ filePath, durationSeconds: Math.max(1, Math.min(session.maxSeconds, Math.round(duration / 1000))) });
      } catch (error) {
        if (error instanceof RecordSaveError) error.durationSeconds = Math.max(1, Math.min(session.maxSeconds, Math.round((typeof result.duration === "number" ? result.duration : Date.now() - session.startedAt) / 1000)));
        session.rejectFinish(error);
      }
      finally { if (active === session) active = null; }
    });
    recorderManager.onError(() => failCapture(new Error("录音中断，请检查麦克风后再试一次")));
  }
  return recorderManager;
}
function failCapture(error: unknown): void {
  const session = active; if (!session || session.stopped) return;
  session.stopped = true; clearTimeout(session.startTimer); active = null;
  session.rejectStart(error); session.rejectFinish(error);
}
export async function startRecord(maxSeconds = 10): Promise<RecordSession> {
  maxSeconds = maxSeconds === 30 ? 30 : 10;
  if (pendingStart || active) throw new Error("上一段录音正在处理，请稍等");
  // #ifdef H5
  throw new Error("网页可回听和导出，录制请打开微信小程序");
  // #endif
  const version = ++startVersion; pendingStart = true;
  try {
    await ensureRecordPermission();
    if (version !== startVersion) throw new Error("已取消开始录音");
    const manager = getRecorderManager(); stopRecordPlayback(); stopAudio();
    let resolveStart!: () => void, rejectStart!: (e: unknown) => void;
    let resolveFinish!: (r: SavedRecording) => void, rejectFinish!: (e: unknown) => void;
    const started = new Promise<void>((resolve,reject) => { resolveStart = resolve; rejectStart = reject; });
    const finished = new Promise<SavedRecording>((resolve,reject) => { resolveFinish = resolve; rejectFinish = reject; });
    void started.catch(() => {}); void finished.catch(() => {});
    const session: ActiveSession = { started: false, stopped: false, stopRequested: false, startedAt: Date.now(), maxSeconds, resolveStart, rejectStart, resolveFinish, rejectFinish, finished };
    active = session;
    session.startTimer = setTimeout(() => { if (active === session && !session.started) { failCapture(new Error("录音启动超时，请重试")); try { manager.stop(); } catch { /* 已结束失败会话 */ } } }, 8000);
    try { manager.start({ duration: maxSeconds * 1000, sampleRate: 16000, numberOfChannels: 1, encodeBitRate: 48000, format: "mp3" }); }
    catch (e) { failCapture(e); }
    return { started, finished };
  } finally { pendingStart = false; }
}
export function cancelPendingRecord(): void { startVersion += 1; if (active && !active.started && !active.stopped) active.stopRequested = true; }
export function stopRecord(): Promise<SavedRecording> {
  const session = active;
  if (!session) return Promise.reject(new Error("当前没有正在录制的声音"));
  if (!session.stopped && !session.stopRequested) {
    session.stopRequested = true;
    if (session.started) { try { getRecorderManager().stop(); } catch (e) { failCapture(e); } }
  }
  return session.finished;
}

export function playRecord(filePath: string): void {
  stopRecordPlayback(); stopAudio(); configureAudioPlayback();
  const audio = uni.createInnerAudioContext(); recordAudio = audio;
  playback.value = { phase: "loading", path: filePath }; audio.volume = getAudioVolume();
  audio.onPlay(() => { if (recordAudio === audio) playback.value = { phase: "playing", path: filePath }; });
  audio.onEnded(() => { if (recordAudio !== audio) return; recordAudio = null; audio.destroy(); playback.value = { phase: "ended", path: filePath }; });
  audio.onError(() => { if (recordAudio !== audio) return; recordAudio = null; audio.destroy(); playback.value = { phase: "error", path: filePath }; });
  audio.autoplay = true; audio.src = filePath;
}
export function stopRecordPlayback(): void {
  const audio = recordAudio; recordAudio = null; playback.value = { phase: "idle", path: "" };
  audio?.stop(); audio?.destroy();
}
export class RecordPermissionError extends Error { constructor() { super("需要允许使用麦克风才能录音"); } }
export class RecordSaveError extends Error { durationSeconds?: number; constructor(public tempFilePath: string) { super("录音已结束，但还没保存好，可以重新保存"); } }
async function ensureRecordPermission(): Promise<void> {
  const setting = await new Promise<UniApp.GetSettingSuccessResult>((resolve,reject) => uni.getSetting({ success: resolve, fail: reject }));
  if (setting.authSetting["scope.record"]) return;
  try { await new Promise<void>((resolve,reject) => uni.authorize({ scope: "scope.record", success: () => resolve(), fail: reject })); }
  catch { throw new RecordPermissionError(); }
}
export function saveRecordFile(tempFilePath: string): Promise<string> {
  return new Promise((resolve,reject) => uni.saveFile({ tempFilePath, success: result => resolve(result.savedFilePath), fail: () => reject(new RecordSaveError(tempFilePath)) }));
}
