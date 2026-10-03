<template>
  <view class="page repeat-page">
    <view class="repeat-header">
      <button role="button" class="repeat-header__back" @tap="goReader">‹ 返回阅读</button>
      <text class="repeat-header__page">跟读练习</text>
    </view>

    <view class="repeat-intro">
      <text class="section-kicker">Listen · Record · Compare</text>
      <text class="page-title">跟我读</text>
      <text class="page-subtitle">先听原声，再读给自己听。轻松开口，比读得完美更重要。</text>
    </view>

    <view class="sentence-card soft-card">
      <text class="sentence-card__label">PAGE {{ currentPageNumber }} · {{ book.title }}</text>
      <text class="sentence-card__en">{{ activeSentence }}</text>
      <text v-if="activeSentenceCn" class="sentence-card__cn">{{ activeSentenceCn }}</text>
      <AudioButton label="▶ 听原声" :src="activeAudio" size="large" :disabled="isRecording || isStarting || isFinishing" />
    </view>

    <view class="record-stage soft-card" :class="{ 'record-stage--active': isRecording }">
      <text class="record-stage__eyebrow">{{ isRecording ? 'RECORDING NOW' : recordedPath ? 'YOUR RECORDING' : 'READY WHEN YOU ARE' }}</text>
      <view class="waveform" aria-hidden="true">
        <view v-for="(bar, index) in waveBars" :key="index" class="waveform__bar" :style="{ height: bar + 'rpx' }" />
      </view>
      <text class="record-stage__hint">{{ recordHint }}</text>
      <text v-if="isRecording" class="record-stage__timer">{{ recordTimeLabel }} / 00:10</text>
      <button role="button" class="record-button" :class="{ 'record-button--active': isRecording }" :disabled="isStarting || isFinishing || !!unsavedPath" @tap="toggleRecord">
        <text>{{ isRecording ? '■' : '●' }}</text>
        <text>{{ isStarting ? '正在准备…' : isFinishing ? '正在保存…' : isRecording ? '停止录音' : '开始录音' }}</text>
      </button>
    </view>
    <view v-if="unsavedPath" class="record-backup soft-card"><text class="record-backup__title">这段声音还没保存好</text><text class="record-backup__desc">录音临时保留在当前设备，请先重新保存，再导出留作纪念。</text><BigButton label="重新保存这段录音" variant="warm" :disabled="isFinishing" @tap="retrySave" /></view>

    <view class="playback-grid">
      <AudioButton label="原声  ▶" :src="activeAudio" size="large" :disabled="isRecording || isStarting || isFinishing" />
      <BigButton label="我的录音 ▶" variant="ghost" :disabled="!recordedPath || isRecording || isStarting || isFinishing" @tap="playMyRecord" />
    </view>

    <view v-if="recordedPath" class="current-export"><BigButton label="保存 / 导出我的录音 ↓" variant="warm" @tap="goRecordings" /></view>

    <view class="record-backup soft-card">
      <view class="record-backup__head">
        <view>
          <text class="record-backup__title">孩子的录音小册</text>
          <text class="record-backup__desc">已保存 {{ savedRecordCount }} 条。可以回听、导出单条音频或备份全部录音。</text>
        </view>
        <text class="record-backup__badge">LOCAL</text>
      </view>
      <view class="record-backup__actions">
        <BigButton label="管理和导出录音 ›" variant="ghost" @tap="goRecordings" />
      </view>
    </view>

    <view class="repeat-footer">
      <BigButton label="回阅读页" variant="ghost" @tap="goReader" />
      <BigButton label="完成跟读" variant="warm" @tap="goBack" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { backTo, navigate } from "@/services/navigationService";
import { computed, ref } from "vue";
import { onLoad, onShow, onHide, onUnload } from "@dcloudio/uni-app";
import AudioButton from "@/components/AudioButton.vue";
import BigButton from "@/components/BigButton.vue";
import { decodeRouteText, resolveBookId, getBookById, getBookPages, getTodayBook } from "@/services/bookService";
import { playRecord, startRecord, stopRecord, stopRecordPlayback, cancelPendingRecord, RecordPermissionError, RecordSaveError, saveRecordFile, type SavedRecording } from "@/services/recordService";
import { getRepeatRecords, saveRepeatRecord, flushLearningState } from "@/services/progressService";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const bookId = ref(getTodayBook().id);
const sentence = ref("");
const recordedPath = ref("");
const isRecording = ref(false);
const recordSeconds = ref(0);
const isFinishing = ref(false);
const isStarting = ref(false), unsavedPath = ref("");
let pageVisible = true;
const savedRecordCount = ref(getRepeatRecords().length);
const waveBars = [22, 38, 58, 34, 72, 46, 84, 56, 30, 66, 42, 24, 58, 36, 20];
let recordTimer: ReturnType<typeof setInterval> | undefined;

const book = computed(() => getBookById(bookId.value) ?? getTodayBook());
const pages = computed(() => getBookPages(book.value.id));
const matchedPage = computed(() => pages.value.find((page) => page.sentence === sentence.value) ?? pages.value[0]);
const activeSentence = computed(() => sentence.value || matchedPage.value?.sentence || book.value.targetSentence);
const activeSentenceCn = computed(() => matchedPage.value?.sentenceCn || "");
const activeAudio = computed(() => matchedPage.value?.audio || "");
const currentPageNumber = computed(() => matchedPage.value?.pageIndex ?? 1);
const recordTimeLabel = computed(() => `00:${String(recordSeconds.value).padStart(2, "0")}`);
const recordHint = computed(() => {
  if (isStarting.value) return "准备好麦克风，再开始读。";
  if (isFinishing.value) return "正在把这段声音保存到本机…";
  if (unsavedPath.value) return "先保存好这段声音，再录下一句。";
  if (isRecording.value) return "读完这句后，点击停止录音。";
  if (recordedPath.value) return "录音已保存在本机，可以回放或再读一次。";
  return "点击录音按钮，读一遍就很好。";
});

onLoad((query) => {
  const params = query as Record<string, string | undefined>;
  bookId.value = resolveBookId(params.bookId);
  sentence.value = decodeRouteText(params.sentence);
  recordedPath.value = getRepeatRecords().find(r => r.bookId === book.value.id && r.sentence === activeSentence.value)?.audioUrl || "";
});

onShow(() => { pageVisible = true; savedRecordCount.value = getRepeatRecords().length; if (!isRecording.value && !isStarting.value && !isFinishing.value && !unsavedPath.value) recordedPath.value = getRepeatRecords().find(r => r.bookId === book.value.id && r.sentence === activeSentence.value)?.audioUrl || ""; });
onHide(() => { pageVisible = false; cancelPendingRecord(); stopRecordPlayback(); if (isRecording.value || isStarting.value) void finishRecord(); });
onUnload(() => {
  stopRecordPlayback();
  clearRecordTimer();
  pageVisible = false; cancelPendingRecord();
  if (isRecording.value && !isFinishing.value) void stopRecord().catch(() => {});
});

async function toggleRecord() {
  if (isStarting.value || isFinishing.value || unsavedPath.value) return;
  if (isRecording.value) {
    await finishRecord();
    return;
  }
  await beginRecord();
}

async function beginRecord() {
  if (isStarting.value || isFinishing.value || isRecording.value) return;
  isStarting.value = true;
  try {
    const session = await startRecord();
    void session.finished.then(result => saveFinished(result)).catch(error => handleCaptureError(error)).finally(() => { clearRecordTimer(); isRecording.value = false; isFinishing.value = false; });
    await session.started;
    if (!pageVisible) { void stopRecord().catch(() => {}); return; }
    isStarting.value = false;
    isRecording.value = true;
    recordSeconds.value = 0;
    recordTimer = setInterval(() => {
      recordSeconds.value += 1;
      if (recordSeconds.value >= 10) void finishRecord();
    }, 1000);
    uni.showToast({ title: "开始录音", icon: "none" });
  } catch (error) {
    if (!pageVisible) return;
    if (error instanceof RecordPermissionError) uni.showModal({
      title: "需要麦克风权限",
      content: "跟读录音只保存在当前设备，请在系统设置中允许使用麦克风。",
      confirmText: "去设置",
      success: (result) => {
        if (result.confirm) uni.openSetting({});
      }
    });
    else uni.showToast({ title: error instanceof Error ? error.message : "录音启动失败，请重试", icon: "none" });
  } finally { isStarting.value = false; }
}

async function finishRecord() {
  if (isFinishing.value || !isRecording.value) return;
  isFinishing.value = true;
  clearRecordTimer();

  try {
    await stopRecord();
  } catch { /* finished 统一处理保存与错误，避免重复提示 */ }
}
function saveFinished(result: SavedRecording) {
    recordedPath.value = result.filePath; unsavedPath.value = "";
    saveRepeatRecord({
      bookId: book.value.id,
      sentence: activeSentence.value,
      audioUrl: recordedPath.value,
      durationSeconds: result.durationSeconds
    });
    savedRecordCount.value = getRepeatRecords().length;
    flushLearningState();
    if (pageVisible) uni.showToast({ title: "录音已保存", icon: "none" });
}
function handleCaptureError(error: unknown) {
  if (error instanceof RecordSaveError) { unsavedPath.value = error.tempFilePath; recordSeconds.value = error.durationSeconds || recordSeconds.value; }
  if (pageVisible && (isRecording.value || isFinishing.value || error instanceof RecordSaveError)) uni.showToast({ title: error instanceof Error ? error.message : "录音中断，请再试一次", icon: "none" });
}
async function retrySave() {
  if (!unsavedPath.value || isFinishing.value) return;
  isFinishing.value = true;
  try { saveFinished({ filePath: await saveRecordFile(unsavedPath.value), durationSeconds: Math.max(1, recordSeconds.value) }); }
  catch (error) { handleCaptureError(error); }
  finally { isFinishing.value = false; }
}

function clearRecordTimer() {
  if (recordTimer) clearInterval(recordTimer);
  recordTimer = undefined;
}

function playMyRecord() {
  if (recordedPath.value) playRecord(recordedPath.value);
}

function goRecordings() { if (isStarting.value || isRecording.value || isFinishing.value || unsavedPath.value) { uni.showToast({ title: "先保存好这段录音，再导出", icon: "none" }); return; } stopRecordPlayback(); navigate({ url: "/pkg-reading/recordings/index" }); }

function goReader() {
  navigate({ url: `/pkg-reading/reader/index?bookId=${book.value.id}&pageIndex=${currentPageNumber.value}` }, "redirectTo");
}

function goBack() {
  backTo("/pages/books/index");
}
</script>

<style scoped lang="scss">
.repeat-page { padding-bottom: 176rpx; }

.repeat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.repeat-header__back,
.repeat-header__page {
  font-size: 22rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.repeat-header__page { color: $color-muted; }

.repeat-intro { padding: 6rpx 4rpx 20rpx; }

.sentence-card {
  padding: 32rpx 28rpx;
  text-align: center;
}

.sentence-card__label,
.sentence-card__en,
.sentence-card__cn {
  display: block;
}

.sentence-card__label {
  font-size: 20rpx;
  font-weight: 900;
  color: $color-coral;
  letter-spacing: 1rpx;
}

.sentence-card__en {
  margin-top: 16rpx;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 44rpx;
  font-weight: 700;
  color: $color-primary-dark;
  line-height: 1.25;
}

.sentence-card__cn {
  margin: 12rpx 0 24rpx;
  font-size: 25rpx;
  color: $color-muted;
}

.record-stage {
  margin-top: 22rpx;
  padding: 30rpx 28rpx;
  text-align: center;
  background: #fffdf9;
}

.record-stage--active { border-color: rgba(185, 95, 61, 0.55); background: #fbf0eb; }

.record-stage__eyebrow {
  display: block;
  font-size: 19rpx;
  font-weight: 900;
  letter-spacing: 1rpx;
  color: $color-coral;
}

.waveform {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7rpx;
  height: 142rpx;
  margin-top: 12rpx;
}

.waveform__bar {
  width: 8rpx;
  border-radius: $radius-pill;
  background: $color-sky-soft;
}

.record-stage--active .waveform__bar { background: $color-primary; }

.record-stage__hint {
  display: block;
  min-height: 36rpx;
  font-size: 24rpx;
  color: $color-muted;
}

.record-stage__timer {
  display: block;
  margin-top: 8rpx;
  font-size: 28rpx;
  font-weight: 900;
  color: $color-primary;
}

.record-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  min-width: 188rpx;
  min-height: 86rpx;
  margin-top: 20rpx;
  padding: 0 26rpx;
  border: 8rpx solid #f2e3dc;
  border-radius: $radius-pill;
  font-size: 25rpx;
  font-weight: 900;
  color: #fff;
  background: $color-primary;
}

.record-button--active { background: #93442e; }

.playback-grid,
.record-backup__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.playback-grid { margin-top: 20rpx; }

.record-backup {
  margin-top: 22rpx;
  padding: 26rpx;
  background: #f7eee8;
}

.record-backup__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.record-backup__title,
.record-backup__desc { display: block; }

.record-backup__title {
  font-size: 29rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.record-backup__desc {
  margin-top: 8rpx;
  font-size: 21rpx;
  line-height: 1.48;
  color: $color-muted;
}

.record-backup__badge {
  flex: 0 0 auto;
  padding: 8rpx 12rpx;
  border-radius: $radius-pill;
  font-size: 17rpx;
  font-weight: 900;
  letter-spacing: 1rpx;
  color: #557050;
  background: #e4eee0;
}

.record-backup__actions { display: block; margin-top: 22rpx; }
.current-export { margin-top: 16rpx; }

.repeat-footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14rpx;
  width: 100%;
  max-width: 900px;
  padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid $color-line;
  background: rgba(251, 247, 239, 0.97);
  transform: translateX(-50%);
}
</style>
