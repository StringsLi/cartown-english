<template>
  <view class="page reader-page">
    <view class="reader-header">
      <view>
        <text class="reader-header__eyebrow">NOW READING</text>
        <text class="reader-header__title">{{ book.title }}</text>
      </view>
      <text class="reader-header__page">第 {{ currentPageNumber }} / {{ totalPages }} 页</text>
    </view>

    <view class="reader-illustration soft-card">
      <CachedImage
        v-if="currentPage && !imageFailed"
        class="reader-illustration__image"
        :src="currentPage.image"
        mode="aspectFill"
        @error="imageFailed = true"
      />
      <VehicleStoryArt
        v-else-if="currentPage?.vehicleStoryId"
        class="reader-illustration__image"
        :story-id="currentPage.vehicleStoryId"
        :page-index="currentPage.pageIndex"
      />
      <view v-else class="reader-art">
        <text class="reader-art__title">{{ book.title }}</text>
        <text class="reader-art__page">Page {{ currentPageNumber }}</text>
      </view>

      <button class="page-arrow page-arrow--left" :disabled="isFirstPage" aria-label="上一页" @tap="previousPage">‹</button>
      <button class="page-arrow page-arrow--right" aria-label="下一页" @tap="nextPage">›</button>

      <view v-if="currentPage?.hotspots.length" class="reader-hotspots">
        <button v-for="hotspot in currentPage.hotspots" :key="hotspot.word" class="reader-hotspot" @tap="playHotspot(hotspot)">
          <text class="reader-hotspot__word">{{ hotspot.word }}</text>
          <text class="reader-hotspot__cn">{{ hotspot.wordCn }}</text>
        </button>
      </view>
    </view>

    <view v-if="currentPage" class="reader-copy">
      <text class="reader-copy__en">{{ currentPage.sentence }}</text>
      <text class="reader-copy__cn">{{ currentPage.sentenceCn }}</text>
    </view>

    <view class="reader-tools">
      <button class="reader-tool" @tap="goRepeat">
        <text class="reader-tool__icon">●</text>
        <text class="reader-tool__label">跟读</text>
      </button>
      <button class="reader-tool reader-tool--play" @tap="playCurrentPage">
        <text class="reader-tool__play">▶</text>
      </button>
      <button class="reader-tool" @tap="goPointRead">
        <text class="reader-tool__icon">♫</text>
        <text class="reader-tool__label">听原声</text>
      </button>
    </view>

    <view class="page-dots">
      <button
        v-for="(_, index) in pages"
        :key="index"
        class="page-dot"
        :class="{ 'page-dot--active': index === activePageIndex }"
        :aria-label="`第 ${index + 1} 页`"
        @tap="goPage(index)"
      />
    </view>

    <view v-if="showCompletion" class="completion-card soft-card">
      <text class="completion-card__en">You did it!</text>
      <text class="completion-card__cn">今天的绘本读完啦，已经记录到成长报告。</text>
      <view class="completion-card__actions">
        <BigButton label="再读一遍" variant="warm" @tap="restartReading" />
        <BigButton label="返回详情" variant="ghost" @tap="goDetail" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { onHide, onLoad, onShow, onUnload } from "@dcloudio/uni-app";
import BigButton from "@/components/BigButton.vue";
import CachedImage from "@/components/CachedImage.vue";
import VehicleStoryArt from "@/components/VehicleStoryArt.vue";
import { playAudio, speakEnglish } from "@/services/audioService";
import { getBookById, getBookPages, getTodayBook } from "@/services/bookService";
import { addReadingDuration, completeBook, getProgress, saveProgress } from "@/services/progressService";
import type { Hotspot, UserProgress } from "@/types/book";

const bookId = ref(getTodayBook().id);
const activePageIndex = ref(0);
const imageFailed = ref(false);
const showCompletion = ref(false);
let readingSessionStartedAt = 0;

const book = computed(() => getBookById(bookId.value) ?? getTodayBook());
const pages = computed(() => getBookPages(book.value.id));
const totalPages = computed(() => Math.max(pages.value.length, 1));
const currentPage = computed(() => pages.value[activePageIndex.value] ?? pages.value[0]);
const currentPageNumber = computed(() => Math.min(activePageIndex.value + 1, totalPages.value));
const isFirstPage = computed(() => activePageIndex.value <= 0);
const isLastPage = computed(() => activePageIndex.value >= totalPages.value - 1);

onLoad((query) => {
  const params = query as Record<string, string | undefined>;
  bookId.value = params.bookId || getTodayBook().id;
  const storedProgress = getProgress(bookId.value) as UserProgress | undefined;
  const pageIndex = params.pageIndex || String(storedProgress?.currentPage ?? 1);
  activePageIndex.value = normalizePageIndex(pageIndex);
  persistCurrentPage();
});

onShow(() => {
  readingSessionStartedAt = Date.now();
});

onHide(flushReadingDuration);
onUnload(flushReadingDuration);

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
  return Number.isFinite(parsed) && parsed >= 1 ? parsed - 1 : 0;
}

function previousPage() {
  if (isFirstPage.value) return;
  showCompletion.value = false;
  activePageIndex.value -= 1;
  persistCurrentPage();
}

function nextPage() {
  if (isLastPage.value) {
    if (!showCompletion.value) completeBook(book.value.id);
    showCompletion.value = true;
    return;
  }
  showCompletion.value = false;
  activePageIndex.value += 1;
  persistCurrentPage();
}

function goPage(index: number) {
  showCompletion.value = false;
  activePageIndex.value = index;
  persistCurrentPage();
}

function restartReading() {
  showCompletion.value = false;
  activePageIndex.value = 0;
  persistCurrentPage();
}

function persistCurrentPage() {
  saveProgress({ bookId: book.value.id, currentPage: currentPageNumber.value });
}

function flushReadingDuration() {
  if (!readingSessionStartedAt) return;
  addReadingDuration((Date.now() - readingSessionStartedAt) / 1000);
  readingSessionStartedAt = 0;
}

function playCurrentPage() {
  if (currentPage.value) speakEnglish(currentPage.value.sentence);
}

function playHotspot(hotspot: Hotspot) {
  playAudio(hotspot.audio, hotspot.word);
}

function goPointRead() {
  uni.navigateTo({ url: `/pages/point-read/index?bookId=${book.value.id}&pageIndex=${currentPageNumber.value}` });
}

function goRepeat() {
  const sentence = encodeURIComponent(currentPage.value?.sentence ?? book.value.targetSentence);
  uni.navigateTo({ url: `/pages/repeat/index?bookId=${book.value.id}&sentence=${sentence}` });
}

function goDetail() {
  uni.redirectTo({ url: `/pages/book-detail/index?bookId=${book.value.id}` });
}
</script>

<style scoped lang="scss">
.reader-page {
  min-height: 100vh;
  padding-bottom: 60rpx;
}

.reader-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding: 2rpx 0 22rpx;
}

.reader-header__eyebrow,
.reader-header__title {
  display: block;
}

.reader-header__eyebrow {
  font-size: 18rpx;
  font-weight: 800;
  color: $color-primary;
}

.reader-header__title {
  margin-top: 5rpx;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 28rpx;
  font-weight: 700;
  color: $color-primary-dark;
}

.reader-header__page {
  padding: 9rpx 16rpx;
  border: 1rpx solid $color-line;
  border-radius: $radius-pill;
  font-size: 20rpx;
  color: $color-muted;
  background: #fffdf9;
}

.reader-illustration {
  position: relative;
  height: 57vh;
  min-height: 560rpx;
  max-height: 820rpx;
  overflow: hidden;
  background: #e4e9e2;
}

.reader-illustration__image {
  width: 100%;
  height: 100%;
}

.reader-art {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 40rpx;
  text-align: center;
  background: #dfe8df;
}

.reader-art__title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 46rpx;
  font-weight: 700;
  color: $color-primary-dark;
}

.reader-art__page {
  margin-top: 18rpx;
  font-size: 24rpx;
  color: $color-muted;
}

.page-arrow {
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58rpx;
  height: 74rpx;
  border-radius: $radius-pill;
  font-size: 48rpx;
  color: $color-primary-dark;
  background: rgba(255, 253, 249, 0.86);
  box-shadow: 0 8rpx 20rpx rgba(38, 43, 48, 0.1);
  transform: translateY(-50%);
}

.page-arrow--left { left: 18rpx; }
.page-arrow--right { right: 18rpx; }
.page-arrow[disabled] { opacity: 0.35; }

.reader-hotspots {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  left: 20rpx;
  display: flex;
  justify-content: center;
}

.reader-hotspot {
  display: inline-flex;
  align-items: center;
  gap: 9rpx;
  min-height: 58rpx;
  padding: 0 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.64);
  border-radius: $radius-pill;
  background: rgba(255, 253, 249, 0.9);
  box-shadow: 0 8rpx 18rpx rgba(38, 43, 48, 0.09);
}

.reader-hotspot__word {
  font-size: 24rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.reader-hotspot__cn {
  font-size: 21rpx;
  color: $color-muted;
}

.reader-copy {
  padding: 28rpx 10rpx 12rpx;
  text-align: center;
}

.reader-copy__en {
  display: block;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 42rpx;
  font-weight: 700;
  color: #1f2f43;
  line-height: 1.32;
}

.reader-copy__cn {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: $color-muted;
}

.reader-tools {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 52rpx;
  margin-top: 20rpx;
}

.reader-tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7rpx;
  min-width: 86rpx;
  color: $color-primary-dark;
}

.reader-tool__icon,
.reader-tool--play {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 78rpx;
  height: 78rpx;
  border: 1rpx solid rgba(38, 61, 89, 0.14);
  border-radius: 50%;
  font-size: 31rpx;
  color: #4e675d;
  background: #fffdf9;
}

.reader-tool--play {
  width: 98rpx;
  height: 98rpx;
  color: #ffffff;
  background: $color-primary;
  box-shadow: $shadow-button;
}

.reader-tool__play {
  padding-left: 5rpx;
  font-size: 34rpx;
}

.reader-tool__label {
  font-size: 20rpx;
  font-weight: 700;
  color: $color-muted;
}

.page-dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-top: 22rpx;
}

.page-dot {
  width: 11rpx;
  height: 11rpx;
  border-radius: 50%;
  background: #d8d2c9;
}

.page-dot--active {
  width: 28rpx;
  border-radius: $radius-pill;
  background: $color-primary;
}

.completion-card {
  margin-top: 26rpx;
  padding: 28rpx;
  text-align: center;
}

.completion-card__en {
  display: block;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 38rpx;
  font-weight: 700;
  color: $color-primary-dark;
}

.completion-card__cn {
  display: block;
  margin-top: 9rpx;
  font-size: 23rpx;
  color: $color-muted;
}

.completion-card__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 22rpx;
}
</style>
