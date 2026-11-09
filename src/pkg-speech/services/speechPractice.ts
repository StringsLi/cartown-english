import { ref } from 'vue';
import { todayKey } from '@/utils/date';
import { getStorage, setStorage, removeStorage } from '@/utils/storage';
import { configureAudioPlayback, getAudioVolume, stopAudio } from '@/services/audioService';
import { resolveCachedMedia, invalidateCachedMedia } from '@/services/mediaCacheService';
import { startRecord, stopRecord, cancelPendingRecord, stopRecordPlayback, playRecord, saveRecordFile, RecordSaveError, RecordPermissionError, type SavedRecording } from '@/services/recordService';
import { saveRepeatRecord, getRepeatRecords, flushLearningState } from '@/services/progressService';
import { getSpeechLesson, speechAudioSource, type SpeechLanguage } from '../catalog';
import { dailySpeech, getSpeechProgress, markSpeech, setSpeechLanguage, speechDay } from './speechProgress';

export const SPEECH_DRAFT_KEY = 'cartown_speech_draft_v1';
interface SpeechDraft { id: string; path: string; seconds: number; date: string }
export function createSpeechPractice() {
  const draft = getStorage<SpeechDraft>(SPEECH_DRAFT_KEY);
  const recover = draft && getSpeechLesson(draft.id) && typeof draft.path === 'string' && draft.path && Number.isFinite(draft.seconds) && draft.seconds > 0 ? draft : undefined;
  const language = recover ? getSpeechLesson(recover.id)!.language : getSpeechProgress().language;
  const state = ref({ id: recover?.id || dailySpeech(language).id, language, sample: 'idle', position: 0, duration: 0, ready: false,
    recording: 'idle', seconds: recover?.seconds || 0, unsaved: recover || null as SpeechDraft | null,
    recordedPath: '', note: recover ? '上次的录音还没保存好，请先重新保存。' : '先完整听一遍，再录下自己的表达。', permissionDenied: false });
  let audio: UniApp.InnerAudioContext | null = null, token = 0, visible = true, disposed = false;
  let timeout: ReturnType<typeof setTimeout> | undefined, timer: ReturnType<typeof setInterval> | undefined;
  const current = () => getSpeechLesson(state.value.id)!;
  const busy = () => state.value.recording !== 'idle' || !!state.value.unsaved;
  function refresh() {
    state.value.ready = speechDay().heard.includes(state.value.id);
    state.value.recordedPath = getRepeatRecords().find(record => record.bookId === 'speech:' + state.value.id)?.audioUrl || '';
  }
  function stopSample() {
    token++; clearTimeout(timeout); timeout = undefined;
    const previous = audio; audio = null; previous?.stop(); previous?.destroy();
    state.value.sample = 'idle';
  }
  function choose(id: string) {
    const lesson = getSpeechLesson(id);
    if (!lesson || busy() || disposed) return;
    stopSample(); stopRecordPlayback(); state.value.id = id; state.value.language = lesson.language;
    state.value.position = 0; state.value.duration = 0; state.value.seconds = 0; state.value.permissionDenied = false;
    setSpeechLanguage(lesson.language); refresh();
    state.value.note = state.value.ready ? '今天听过这篇了，可以开始录音，也可以再听一次。' : '先完整听一遍，再录下自己的表达。';
  }
  function changeLanguage(language: SpeechLanguage) { choose(dailySpeech(language).id); }
  async function listen() {
    if (busy() || disposed || !visible) return;
    stopRecordPlayback(); stopAudio();
    if (audio && state.value.sample === 'playing') { audio.pause(); state.value.sample = 'paused'; return; }
    if (audio && state.value.sample === 'paused') { audio.play(); return; }
    if (state.value.sample === 'loading') { stopSample(); state.value.note = '已取消加载，可以再听一次。'; return; }
    stopSample(); const request = token, lesson = current();
    state.value.sample = 'loading'; state.value.position = 0; state.value.note = '正在准备一分钟示范…';
    const fail = () => {
      if (request !== token || disposed) return;
      stopSample(); invalidateCachedMedia(lesson.audio); state.value.sample = 'error'; state.value.note = '声音暂时没播出来，点听示范重试。';
    };
    timeout = setTimeout(fail, 20000);
    try {
      const source = await resolveCachedMedia(speechAudioSource(lesson), 'audio');
      if (request !== token || disposed || !visible) return;
      configureAudioPlayback(); const context = uni.createInnerAudioContext(); audio = context;
      const active = () => request === token && audio === context && !disposed;
      context.onPlay(() => { if (!active()) return; clearTimeout(timeout); state.value.sample = 'playing'; state.value.note = '先听一个小故事，再换成自己的经历。'; });
      context.onTimeUpdate(() => { if (!active()) return; state.value.position = Number.isFinite(context.currentTime) ? context.currentTime : 0; state.value.duration = Number.isFinite(context.duration) ? context.duration : 0; });
      context.onPause(() => { if (active() && !(context.duration > 0 && context.currentTime >= context.duration - 0.05)) state.value.sample = 'paused'; });
      context.onEnded(() => {
        if (!active()) return;
        const audible = context.volume > 0 && getAudioVolume() > 0;
        stopSample(); if (audible) markSpeech(lesson.id, 'heard'); refresh(); state.value.sample = 'ended';
        state.value.note = audible ? '听完啦！看着三张提示卡，用自己的话说也很好。' : '这次示范没有声音，请恢复音量后再听一遍。';
      });
      context.onError(fail); context.volume = getAudioVolume(); context.src = source; context.autoplay = false; context.play();
    } catch { fail(); }
  }
  function persist(result: SavedRecording, target: { id: string; date: string }) {
    const lesson = getSpeechLesson(target.id)!;
    saveRepeatRecord({ bookId: 'speech:' + lesson.id, sentence: lesson.title, sourceTitle: `小小演说家 · ${lesson.language === 'zh' ? '中文' : '英文'} · ${lesson.subtitle}`, audioUrl: result.filePath, durationSeconds: result.durationSeconds });
    const saved = flushLearningState(); markSpeech(lesson.id, 'recorded', target.date); removeStorage(SPEECH_DRAFT_KEY);
    state.value.unsaved = null; state.value.recordedPath = result.filePath; state.value.seconds = result.durationSeconds;
    state.value.note = saved ? '这段表达已保存在本机。回听一下，找到自己喜欢的一句话吧！' : '音频文件已保存，记录还在暂存，请点上方重新保存记录。';
  }
  function captureError(error: unknown, target: { id: string; date: string }) {
    if (error instanceof RecordSaveError) {
      const pending = { ...target, path: error.tempFilePath, seconds: error.durationSeconds || Math.max(1, state.value.seconds) };
      state.value.unsaved = pending; setStorage(SPEECH_DRAFT_KEY, pending);
    }
    state.value.permissionDenied = error instanceof RecordPermissionError;
    state.value.note = error instanceof Error ? error.message : '录音未能完成，请再试一次。';
  }
  async function record() {
    if (state.value.recording === 'recording') { await finish(); return; }
    refresh();
    if (busy() || disposed || !visible) return;
    if (!state.value.ready) { state.value.note = '请先完整听完今天这篇示范，再开始录音。'; return; }
    const target = { id: state.value.id, date: todayKey() };
    stopSample(); stopRecordPlayback(); state.value.recording = 'starting'; state.value.permissionDenied = false;
    try {
      const session = await startRecord(90);
      void session.finished.then(result => persist(result, target)).catch(error => captureError(error, target)).finally(() => {
        clearInterval(timer); timer = undefined; state.value.recording = 'idle';
      });
      await session.started;
      if (!visible || disposed) { void stopRecord().catch(() => {}); return; }
      state.value.recording = 'recording'; state.value.seconds = 0; const began = Date.now();
      state.value.note = '慢慢说，忘了可以看看提示。说完就点停止，不必凑满一分钟。';
      timer = setInterval(() => { state.value.seconds = Math.min(90, Math.floor((Date.now() - began) / 1000)); if (state.value.seconds >= 90) void finish(); }, 250);
    } catch (error) {
      if (visible && !disposed) captureError(error, target);
      if (state.value.recording === 'starting') state.value.recording = 'idle';
    }
  }
  async function finish() {
    if (state.value.recording !== 'recording') return;
    state.value.recording = 'saving'; clearInterval(timer); timer = undefined;
    try { await stopRecord(); } catch { /* finished owns persistence and errors */ }
  }
  async function retrySave() {
    const pending = state.value.unsaved;
    if (!pending || state.value.recording !== 'idle') return;
    state.value.recording = 'saving';
    try { persist({ filePath: await saveRecordFile(pending.path), durationSeconds: pending.seconds }, pending); }
    catch (error) { captureError(error, pending); }
    finally { state.value.recording = 'idle'; }
  }
  function replay() { if (!busy() && state.value.recordedPath) { stopSample(); playRecord(state.value.recordedPath); } }
  function hide() {
    visible = false; stopSample(); stopRecordPlayback(); cancelPendingRecord();
    if (state.value.recording === 'recording') void finish();
    else if (state.value.recording === 'starting') void stopRecord().catch(() => {});
  }
  function show() { visible = true; refresh(); }
  function dispose() { hide(); disposed = true; }
  refresh();
  return { state, current, busy, refresh, choose, changeLanguage, listen, record, retrySave, replay, hide, show, dispose, stopSample };
}
