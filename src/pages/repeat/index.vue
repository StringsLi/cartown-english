<template>
  <view class="page repeat-page">
    <view class="repeat-header">
      <button class="repeat-header__back" @tap="goReader">‹ 返回阅读</button>
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
      <AudioButton label="▶ 听原声" :src="activeAudio" size="large" />
    </view>

    <view class="record-stage soft-card" :class="{ 'record-stage--active': isRecording }">
      <text class="record-stage__eyebrow">{{ isRecording ? 'RECORDING NOW' : recordedPath ? 'YOUR RECORDING' : 'READY WHEN YOU ARE' }}</text>
      <view class="waveform" aria-hidden="true">
        <view v-for="(bar, index) in waveBars" :key="index" class="waveform__bar" :style="{ height: bar + 'rpx' }" />
      </view>
      <text class="record-stage__hint">{{ recordHint }}</text>
      <text v-if="isRecording" class="record-stage__timer">{{ recordTimeLabel }} / 00:10</text>
      <button class="record-button" :class="{ 'record-button--active': isRecording }" @tap="toggleRecord">
        <text>{{ isRecording ? '■' : '●' }}</text>
        <text>{{ isRecording ? '停止录音' : '开始录音' }}</text>
      </button>
    </view>

    <view class="playback-grid">
      <AudioButton label="原声  ▶" :src="activeAudio" size="large" />
      <BigButton label="我的录音 ▶" variant="ghost" :disabled="!recordedPath" @tap="playMyRecord" />
    </view>

    <view class="record-backup soft-card">
      <view class="record-backup__head">
        <view>
          <text class="record-backup__title">录音本地备份</text>
          <text class="record-backup__desc">已保存 {{ savedRecordCount }} 条，可导出后在本机或微信文件中恢复。</text>
        </view>
        <text class="record-backup__badge">LOCAL</text>
      </view>
      <view class="record-backup__actions">
        <BigButton label="导出备份" variant="ghost" @tap="exportRecords" />
        <BigButton label="导入备份" variant="warm" @tap="importRecords" />
      </view>
    </view>

    <view class="repeat-footer">
      <BigButton label="回阅读页" variant="ghost" @tap="goReader" />
      <BigButton label="完成跟读" variant="warm" @tap="goBack" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import AudioButton from "@/components/AudioButton.vue";
import BigButton from "@/components/BigButton.vue";
import { getBookById, getBookPages, getTodayBook } from "@/services/bookService";
import { exportRepeatRecordArchive, importRepeatRecordArchive } from "@/services/recordArchiveService";
import { playRecord, saveRepeatRecord, startRecord, stopRecord } from "@/services/recordService";
import { getRepeatRecords } from "@/services/progressService";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const bookId = ref(getTodayBook().id);
const sentence = ref("");
const recordedPath = ref("");
const isRecording = ref(false);
const recordSeconds = ref(0);
const isFinishing = ref(false);
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
  if (isRecording.value) return "读完这句后，点击停止录音。";
  if (recordedPath.value) return "录音已保存在本机，可以回放或再读一次。";
  return "点击录音按钮，读一遍就很好。";
});

onLoad((query) => {
  const params = query as Record<string, string | undefined>;
  bookId.value = params.bookId || getTodayBook().id;
  sentence.value = params.sentence ? decodeURIComponent(params.sentence) : "";
});

onUnload(() => {
  clearRecordTimer();
  if (isRecording.value) void stopRecord();
});

async function toggleRecord() {
  if (isRecording.value) {
    await finishRecord();
    return;
  }
  await beginRecord();
}

async function beginRecord() {
  try {
    await startRecord();
    isRecording.value = true;
    recordSeconds.value = 0;
    recordTimer = setInterval(() => {
      recordSeconds.value += 1;
      if (recordSeconds.value >= 10) void finishRecord();
    }, 1000);
    uni.showToast({ title: "开始录音", icon: "none" });
  } catch {
    uni.showModal({
      title: "需要麦克风权限",
      content: "跟读录音只保存在当前设备，请在系统设置中允许使用麦克风。",
      confirmText: "去设置",
      success: (result) => {
        if (result.confirm) uni.openSetting({});
      }
    });
  }
}

async function finishRecord() {
  if (isFinishing.value || !isRecording.value) return;
  isFinishing.value = true;
  clearRecordTimer();

  try {
    recordedPath.value = await stopRecord();
    saveRepeatRecord({
      bookId: book.value.id,
      sentence: activeSentence.value,
      audioUrl: recordedPath.value,
      durationSeconds: Math.max(1, recordSeconds.value)
    });
    savedRecordCount.value = getRepeatRecords().length;
    uni.showToast({ title: "录音已保存", icon: "none" });
  } catch {
    uni.showToast({ title: "录音保存失败", icon: "none" });
  } finally {
    isRecording.value = false;
    isFinishing.value = false;
  }
}

function clearRecordTimer() {
  if (recordTimer) clearInterval(recordTimer);
  recordTimer = undefined;
}

function playMyRecord() {
  if (recordedPath.value) playRecord(recordedPath.value);
}

async function exportRecords() {
  try {
    const count = await exportRepeatRecordArchive();
    uni.showToast({ title: count ? `已导出 ${count} 条录音` : "暂无录音可导出", icon: "none" });
  } catch {
    uni.showToast({ title: "导出失败，请重试", icon: "none" });
  }
}

async function importRecords() {
  try {
    const result = await importRepeatRecordArchive();
    savedRecordCount.value = getRepeatRecords().length;
    uni.showToast({ title: result.restored ? `已恢复 ${result.restored} 条录音` : "没有新的录音需要恢复", icon: "none" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "导入失败，请选择录音备份文件";
    uni.showToast({ title: message, icon: "none" });
  }
}

function goReader() {
  uni.redirectTo({ url: `/pages/reader/index?bookId=${book.value.id}&pageIndex=${currentPageNumber.value}` });
}

function goBack() {
  uni.navigateBack();
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

.record-backup__actions { margin-top: 22rpx; }

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
