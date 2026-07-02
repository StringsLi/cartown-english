<template>
  <view class="page reader-page">
    <view class="reader-top soft-card">
      <view class="reader-top__head">
        <view>
          <text class="section-kicker">Now reading</text>
          <text class="reader-top__title">{{ book.title }}</text>
        </view>
        <text class="reader-top__page">Page {{ currentPageNumber }}</text>
      </view>
      <ProgressBar label="阅读进度" :current="currentPageNumber" :total="totalPages" />
    </view>

    <view class="reader-illustration soft-card">
      <image
        v-if="currentPage && !imageFailed"
        class="reader-illustration__image"
        :src="currentPage.image"
        mode="aspectFill"
        @error="imageFailed = true"
      />
      <view v-else class="reader-art">
        <view class="reader-art__sun" />
        <view class="reader-art__book">
          <text class="reader-art__book-title">{{ book.title }}</text>
          <text class="reader-art__book-page">Page {{ currentPageNumber }}</text>
        </view>
        <view class="reader-art__ground" />
      </view>

      <view v-if="currentPage?.hotspots.length" class="reader-hotspots">
        <view v-for="hotspot in currentPage.hotspots" :key="hotspot.word" class="reader-hotspot" @tap="playHotspot(hotspot.audio)">
          <text class="reader-hotspot__word">{{ hotspot.word }}</text>
          <text class="reader-hotspot__cn">{{ hotspot.wordCn }}</text>
        </view>
      </view>

      <AudioButton v-if="currentPage" class="reader-illustration__audio" label="听一听" :src="currentPage.audio" size="large" />
    </view>

    <view v-if="currentPage" class="reader-sentence soft-card">
      <text class="reader-sentence__en">{{ currentPage.sentence }}</text>
      <text class="reader-sentence__cn">{{ currentPage.sentenceCn }}</text>
    </view>

    <view v-if="showCompletion" class="completion-card soft-card">
      <text class="completion-card__en">You did it! Great reading!</text>
      <text class="completion-card__cn">今天的绘本读完啦，可以再读一遍，或者去看陪读卡。</text>
      <view class="completion-card__actions">
        <BigButton label="再读一遍" variant="warm" @tap="restartReading" />
        <BigButton label="回到详情" variant="ghost" @tap="goDetail" />
      </view>
    </view>

    <view class="reader-actions">
      <BigButton label="上一页" variant="ghost" :disabled="isFirstPage" @tap="previousPage" />
      <BigButton label="点读" variant="warm" @tap="goPointRead" />
      <BigButton label="跟读" variant="ghost" @tap="goRepeat" />
      <BigButton :label="nextButtonLabel" @tap="nextPage" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AudioButton from "@/components/AudioButton.vue";
import BigButton from "@/components/BigButton.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import { playAudio } from "@/services/audioService";
import { getBookById, getBookPages, getTodayBook } from "@/services/bookService";
import { completeBook } from "@/services/progressService";

const bookId = ref(getTodayBook().id);
const activePageIndex = ref(0);
const imageFailed = ref(false);
const showCompletion = ref(false);

const book = computed(() => getBookById(bookId.value) ?? getTodayBook());
const pages = computed(() => getBookPages(book.value.id));
const totalPages = computed(() => Math.max(pages.value.length, 1));
const currentPage = computed(() => pages.value[activePageIndex.value] ?? pages.value[0]);
const currentPageNumber = computed(() => Math.min(activePageIndex.value + 1, totalPages.value));
const isFirstPage = computed(() => activePageIndex.value <= 0);
const isLastPage = computed(() => activePageIndex.value >= totalPages.value - 1);
const nextButtonLabel = computed(() => (isLastPage.value ? "完成阅读" : "下一页"));

onLoad((query) => {
  const params = query as Record<string, string | undefined>;
  bookId.value = params.bookId || getTodayBook().id;
  activePageIndex.value = normalizePageIndex(params.pageIndex);
});

watch(
  () => currentPage.value?.image,
  () => {
    imageFailed.value = false;
  }
);

watch(
  () => pages.value.length,
  () => {
    activePageIndex.value = Math.min(activePageIndex.value, totalPages.value - 1);
  }
);

function normalizePageIndex(pageIndex?: string): number {
  const parsed = Number(pageIndex);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 0;
  }

  return parsed - 1;
}

function previousPage() {
  if (isFirstPage.value) {
    return;
  }

  showCompletion.value = false;
  activePageIndex.value -= 1;
}

function nextPage() {
  if (isLastPage.value) {
    if (!showCompletion.value) {
      completeBook(book.value.id);
    }
    showCompletion.value = true;
    return;
  }

  showCompletion.value = false;
  activePageIndex.value += 1;
}

function restartReading() {
  showCompletion.value = false;
  activePageIndex.value = 0;
}

function playHotspot(audio: string) {
  playAudio(audio);
}

function goPointRead() {
  uni.navigateTo({
    url: `/pages/point-read/index?bookId=${book.value.id}&pageIndex=${currentPageNumber.value}`
  });
}

function goRepeat() {
  const sentence = encodeURIComponent(currentPage.value?.sentence ?? book.value.targetSentence);

  uni.navigateTo({
    url: `/pages/repeat/index?bookId=${book.value.id}&sentence=${sentence}`
  });
}

function goDetail() {
  uni.redirectTo({
    url: `/pages/book-detail/index?bookId=${book.value.id}`
  });
}
</script>

<style scoped lang="scss">
.reader-page {
  padding-bottom: 204rpx;
}

.reader-top {
  padding: 26rpx;
}

.reader-top__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 22rpx;
}

.reader-top__title {
  display: block;
  font-size: 34rpx;
  font-weight: 900;
  color: $color-primary-dark;
  letter-spacing: 0;
}

.reader-top__page {
  flex: 0 0 auto;
  padding: 10rpx 18rpx;
  border-radius: $radius-pill;
  font-size: 23rpx;
  font-weight: 900;
  color: $color-primary-dark;
  background: rgba(255, 214, 107, 0.58);
}

.reader-illustration {
  position: relative;
  height: 54vh;
  min-height: 520rpx;
  max-height: 760rpx;
  margin-top: 26rpx;
  overflow: hidden;
  background:
    radial-gradient(circle at 86% 14%, rgba(255, 214, 107, 0.36), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #eaf6ff 62%, #fff3e8 100%);
}

.reader-illustration__image {
  width: 100%;
  height: 100%;
}

.reader-art {
  position: relative;
  width: 100%;
  height: 100%;
}

.reader-art__sun {
  position: absolute;
  top: 54rpx;
  right: 62rpx;
  width: 114rpx;
  height: 114rpx;
  border-radius: 50%;
  background: $color-warm;
  box-shadow: 0 14rpx 26rpx rgba(255, 214, 107, 0.3);
}

.reader-art__book {
  position: absolute;
  top: 18%;
  left: 50%;
  width: 360rpx;
  min-height: 280rpx;
  padding: 44rpx 38rpx;
  border: 8rpx solid rgba(255, 255, 255, 0.78);
  border-radius: 34rpx 22rpx 22rpx 34rpx;
  background: linear-gradient(155deg, $color-coral 0%, #ffbd9f 100%);
  box-shadow: 0 20rpx 38rpx rgba(255, 159, 122, 0.2);
  transform: translateX(-50%) rotate(-4deg);
}

.reader-art__book-title {
  display: block;
  font-size: 44rpx;
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  letter-spacing: 0;
  line-height: 1.18;
}

.reader-art__book-page {
  display: block;
  margin-top: 46rpx;
  font-size: 26rpx;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  letter-spacing: 0;
}

.reader-art__ground {
  position: absolute;
  right: -30rpx;
  bottom: -70rpx;
  left: -30rpx;
  height: 180rpx;
  border-radius: 50% 50% 0 0;
  background: rgba(145, 216, 168, 0.38);
}

.reader-hotspots {
  position: absolute;
  right: 260rpx;
  bottom: 24rpx;
  left: 24rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.reader-hotspot {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  min-height: 62rpx;
  padding: 0 20rpx;
  border-radius: $radius-pill;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10rpx 20rpx rgba(47, 58, 74, 0.08);
}

.reader-hotspot__word {
  font-size: 27rpx;
  font-weight: 900;
  color: $color-primary-dark;
  letter-spacing: 0;
}

.reader-hotspot__cn {
  font-size: 23rpx;
  color: $color-muted;
  letter-spacing: 0;
}

.reader-illustration__audio {
  position: absolute;
  right: 24rpx;
  bottom: 22rpx;
}

.reader-sentence {
  margin-top: 26rpx;
  padding: 28rpx 30rpx;
  text-align: center;
}

.reader-sentence__en {
  display: block;
  font-size: 46rpx;
  font-weight: 900;
  color: $color-primary-dark;
  letter-spacing: 0;
  line-height: 1.22;
}

.reader-sentence__cn {
  display: block;
  margin-top: 14rpx;
  font-size: 27rpx;
  color: $color-muted;
  letter-spacing: 0;
  line-height: 1.5;
}

.completion-card {
  margin-top: 24rpx;
  padding: 30rpx;
  text-align: center;
  background:
    radial-gradient(circle at 12% 12%, rgba(255, 214, 107, 0.28), transparent 34%),
    #ffffff;
}

.completion-card__en {
  display: block;
  font-size: 40rpx;
  font-weight: 900;
  color: $color-primary-dark;
  letter-spacing: 0;
  line-height: 1.24;
}

.completion-card__cn {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  color: $color-muted;
  letter-spacing: 0;
  line-height: 1.5;
}

.completion-card__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 26rpx;
}

.reader-actions {
  position: fixed;
  bottom: 0;
  left: 50%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12rpx;
  width: 100%;
  max-width: 900px;
  padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid rgba(107, 175, 232, 0.16);
  background: rgba(255, 248, 236, 0.94);
  backdrop-filter: blur(14rpx);
  transform: translateX(-50%);
}
</style>
