<template>
  <view class="page repeat-page">
    <view class="repeat-hero soft-card">
      <text class="section-kicker">Listen and Repeat</text>
      <text class="page-title">跟我读</text>
      <text class="page-subtitle">先听原音，再让孩子跟读一句。读得轻松，比读得完美更重要。</text>
    </view>

    <view class="sentence-card soft-card">
      <text class="sentence-card__label">{{ book.title }}</text>
      <text class="sentence-card__en">{{ activeSentence }}</text>
      <text v-if="activeSentenceCn" class="sentence-card__cn">{{ activeSentenceCn }}</text>
      <AudioButton label="听原音" :src="activeAudio" size="large" />
    </view>

    <view class="repeat-steps">
      <view class="repeat-step soft-card">
        <text class="repeat-step__num">1</text>
        <text class="repeat-step__title">Listen</text>
        <text class="repeat-step__desc">听一句</text>
      </view>
      <view class="repeat-step soft-card">
        <text class="repeat-step__num">2</text>
        <text class="repeat-step__title">Repeat</text>
        <text class="repeat-step__desc">跟着读</text>
      </view>
      <view class="repeat-step soft-card">
        <text class="repeat-step__num">3</text>
        <text class="repeat-step__title">Smile</text>
        <text class="repeat-step__desc">夸一下</text>
      </view>
    </view>

    <view class="record-card soft-card">
      <text class="record-card__title">{{ isRecording ? "正在录音..." : recordedPath ? "录音已保存" : "准备好了吗？" }}</text>
      <text class="record-card__hint">{{ recordHint }}</text>
      <text v-if="isRecording" class="record-card__timer">{{ recordTimeLabel }} / 00:10</text>
      <view class="record-card__actions">
        <BigButton :label="isRecording ? '停止录音' : '开始录音'" :variant="isRecording ? 'warm' : 'primary'" @tap="toggleRecord" />
        <BigButton label="播放我的录音" variant="ghost" :disabled="!recordedPath" @tap="playMyRecord" />
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
import { playRecord, saveRepeatRecord, startRecord, stopRecord } from "@/services/recordService";

const bookId = ref(getTodayBook().id);
const sentence = ref("");
const recordedPath = ref("");
const isRecording = ref(false);
const recordSeconds = ref(0);
const isFinishing = ref(false);
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
  if (isRecording.value) {
    return "读完这句话后点“停止录音”。";
  }

  if (recordedPath.value) {
    return "可以播放给孩子听，也可以再录一次。";
  }

  return "点一下开始录音，读一句就好。";
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

  beginRecord();
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
  } catch (error) {
    uni.showModal({
      title: "需要麦克风权限",
      content: "跟读录音只用于本地回放，请在系统设置中允许使用麦克风。",
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
    uni.showToast({ title: "录音已保存", icon: "none" });
  } catch (error) {
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
  if (recordedPath.value) {
    playRecord(recordedPath.value);
  }
}

function goReader() {
  uni.redirectTo({
    url: `/pages/reader/index?bookId=${book.value.id}&pageIndex=${currentPageNumber.value}`
  });
}

function goBack() {
  uni.navigateBack();
}
</script>

<style scoped lang="scss">
.repeat-page {
  padding-bottom: 166rpx;
}

.repeat-hero {
  padding: 32rpx;
  background:
    radial-gradient(circle at 92% 20%, rgba(255, 214, 107, 0.34), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 58%, #fff0dd 100%);
}

.sentence-card {
  margin-top: 26rpx;
  padding: 34rpx 30rpx;
  text-align: center;
}

.record-card__timer {
  display: block;
  margin-top: 14rpx;
  font-size: 30rpx;
  font-weight: 800;
  color: $color-primary;
}

.sentence-card__label {
  display: block;
  font-size: 24rpx;
  font-weight: 900;
  color: $color-coral;
}

.sentence-card__en {
  display: block;
  margin-top: 14rpx;
  font-size: 48rpx;
  font-weight: 900;
  color: $color-primary-dark;
  line-height: 1.22;
}

.sentence-card__cn {
  display: block;
  margin: 14rpx 0 26rpx;
  font-size: 27rpx;
  color: $color-muted;
  line-height: 1.5;
}

.repeat-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 24rpx;
}

.repeat-step {
  min-height: 158rpx;
  padding: 20rpx 12rpx;
  text-align: center;
}

.repeat-step__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  font-size: 24rpx;
  font-weight: 900;
  color: $color-primary-dark;
  background: rgba(255, 214, 107, 0.76);
}

.repeat-step__title {
  display: block;
  margin-top: 12rpx;
  font-size: 27rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.repeat-step__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  color: $color-muted;
}

.record-card {
  margin-top: 24rpx;
  padding: 30rpx;
}

.record-card__title {
  display: block;
  font-size: 34rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.record-card__hint {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: $color-muted;
  line-height: 1.5;
}

.record-card__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 26rpx;
}

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
  border-top: 1rpx solid rgba(107, 175, 232, 0.16);
  background: rgba(255, 248, 236, 0.94);
  backdrop-filter: blur(14rpx);
  transform: translateX(-50%);
}
</style>
