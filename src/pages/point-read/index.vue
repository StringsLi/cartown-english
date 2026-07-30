<template>
  <view class="page point-page">
    <view class="point-top soft-card">
      <view>
        <text class="section-kicker">Tap and Listen</text>
        <text class="point-top__title">{{ book.title }}</text>
      </view>
      <text class="point-top__page">Page {{ currentPageNumber }}</text>
    </view>

    <view v-if="currentPage" class="point-scene soft-card">
      <CachedImage
        v-if="!imageFailed"
        class="point-scene__image"
        :src="currentPage.image"
        mode="aspectFill"
        @error="imageFailed = true"
      />
      <VehicleStoryArt
        v-else-if="currentPage.vehicleStoryId"
        class="point-scene__image"
        :story-id="currentPage.vehicleStoryId"
        :page-index="currentPage.pageIndex"
      />
      <view v-else class="point-art">
        <view class="point-art__sun" />
        <view class="point-art__card">
          <text class="point-art__title">{{ currentPage.sentence }}</text>
          <text class="point-art__hint">点一点下面的词</text>
        </view>
        <view class="point-art__ground" />
      </view>

      <button
        v-for="hotspot in currentPage.hotspots"
        :key="hotspot.word"
        class="point-hotspot"
        :class="{ 'point-hotspot--active': selectedHotspot?.word === hotspot.word }"
        :style="hotspotStyle(hotspot)"
        @tap="selectHotspot(hotspot)"
      >
        <text class="point-hotspot__word">{{ hotspot.word }}</text>
        <text class="point-hotspot__cn">{{ hotspot.wordCn }}</text>
      </button>
    </view>

    <view v-if="selectedHotspot" class="word-card soft-card">
      <text class="word-card__label">你点到了</text>
      <text class="word-card__word">{{ selectedHotspot.word }}</text>
      <text class="word-card__phonetic">{{ selectedHotspot.phonetic }}</text>
      <text class="word-card__meaning">{{ selectedHotspot.wordCn }}</text>
      <AudioButton label="再听一次" :src="selectedHotspot.audio" :fallback-text="selectedHotspot.word" size="large" />
    </view>

    <view v-if="currentPage" class="sentence-card soft-card">
      <text class="sentence-card__en">{{ currentPage.sentence }}</text>
      <text class="sentence-card__cn">{{ currentPage.sentenceCn }}</text>
    </view>

    <view class="point-actions">
      <BigButton label="上一页" variant="ghost" :disabled="isFirstPage" @tap="previousPage" />
      <BigButton label="回阅读页" variant="warm" @tap="goReader" />
      <BigButton label="下一页" :disabled="isLastPage" @tap="nextPage" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AudioButton from "@/components/AudioButton.vue";
import BigButton from "@/components/BigButton.vue";
import CachedImage from "@/components/CachedImage.vue";
import VehicleStoryArt from "@/components/VehicleStoryArt.vue";
import { playAudio } from "@/services/audioService";
import { getBookById, getBookPages, getTodayBook } from "@/services/bookService";
import type { Hotspot } from "@/types/book";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const bookId = ref(getTodayBook().id);
const activePageIndex = ref(0);
const imageFailed = ref(false);
const selectedHotspot = ref<Hotspot | null>(null);

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
  activePageIndex.value = normalizePageIndex(params.pageIndex);
});

watch(
  () => currentPage.value?.id,
  () => {
    imageFailed.value = false;
    selectedHotspot.value = currentPage.value?.hotspots[0] ?? null;
  },
  { immediate: true }
);

function normalizePageIndex(pageIndex?: string): number {
  const parsed = Number(pageIndex);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 0;
  }

  return parsed - 1;
}

function hotspotStyle(hotspot: Hotspot) {
  return {
    left: `${hotspot.x}%`,
    top: `${hotspot.y}%`,
    width: `${Math.max(hotspot.width, 26)}%`
  };
}

function selectHotspot(hotspot: Hotspot) {
  selectedHotspot.value = hotspot;
  playAudio(hotspot.audio, hotspot.word);
}

function previousPage() {
  if (!isFirstPage.value) {
    activePageIndex.value -= 1;
  }
}

function nextPage() {
  if (!isLastPage.value) {
    activePageIndex.value += 1;
  }
}

function goReader() {
  uni.redirectTo({
    url: `/pages/reader/index?bookId=${book.value.id}&pageIndex=${currentPageNumber.value}`
  });
}
</script>

<style scoped lang="scss">
.point-page {
  padding-bottom: 166rpx;
}

.point-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  padding: 26rpx;
}

.point-top__title {
  display: block;
  font-size: 36rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.point-top__page {
  padding: 10rpx 18rpx;
  border-radius: $radius-pill;
  font-size: 23rpx;
  font-weight: 900;
  color: $color-primary-dark;
  background: rgba(255, 214, 107, 0.62);
}

.point-scene {
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

.point-scene__image {
  width: 100%;
  height: 100%;
}

.point-art {
  position: relative;
  width: 100%;
  height: 100%;
}

.point-art__sun {
  position: absolute;
  top: 54rpx;
  right: 62rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: $color-warm;
}

.point-art__card {
  position: absolute;
  top: 22%;
  left: 50%;
  width: 380rpx;
  min-height: 230rpx;
  padding: 42rpx 34rpx;
  border: 8rpx solid rgba(255, 255, 255, 0.78);
  border-radius: 34rpx 22rpx 22rpx 34rpx;
  background: linear-gradient(155deg, $color-coral 0%, #ffbd9f 100%);
  box-shadow: 0 20rpx 38rpx rgba(255, 159, 122, 0.2);
  transform: translateX(-50%) rotate(-4deg);
}

.point-art__title {
  display: block;
  font-size: 36rpx;
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  line-height: 1.2;
}

.point-art__hint {
  display: block;
  margin-top: 30rpx;
  font-size: 24rpx;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.88);
  text-align: center;
}

.point-art__ground {
  position: absolute;
  right: -30rpx;
  bottom: -70rpx;
  left: -30rpx;
  height: 180rpx;
  border-radius: 50% 50% 0 0;
  background: rgba(145, 216, 168, 0.38);
}

.point-hotspot {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  min-height: 64rpx;
  padding: 0 16rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.72);
  border-radius: $radius-pill;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 10rpx 20rpx rgba(47, 58, 74, 0.08);
}

.point-hotspot--active {
  background: rgba(255, 214, 107, 0.9);
}

.point-hotspot__word {
  font-size: 27rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.point-hotspot__cn {
  font-size: 23rpx;
  color: $color-muted;
}

.word-card,
.sentence-card {
  margin-top: 24rpx;
  padding: 30rpx;
  text-align: center;
}

.word-card__label,
.word-card__phonetic,
.word-card__meaning,
.sentence-card__cn {
  display: block;
  color: $color-muted;
}

.word-card__label {
  font-size: 24rpx;
  font-weight: 900;
  color: $color-coral;
}

.word-card__word {
  display: block;
  margin-top: 8rpx;
  font-size: 54rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.word-card__phonetic {
  margin-top: 8rpx;
  font-size: 26rpx;
}

.word-card__meaning {
  margin: 8rpx 0 24rpx;
  font-size: 28rpx;
}

.sentence-card__en {
  display: block;
  font-size: 40rpx;
  font-weight: 900;
  color: $color-primary-dark;
  line-height: 1.24;
}

.sentence-card__cn {
  margin-top: 12rpx;
  font-size: 26rpx;
}

.point-actions {
  position: fixed;
  bottom: 0;
  left: 50%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
