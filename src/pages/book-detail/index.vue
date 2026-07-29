<template>
  <view class="page detail-page">
    <view class="detail-hero">
      <view class="detail-cover soft-card">
        <VehicleStoryArt
          v-if="book.vehicleStoryId"
          class="detail-cover__image"
          :story-id="book.vehicleStoryId"
          :page-index="0"
        />
        <CachedImage v-else-if="!coverFailed" class="detail-cover__image" :src="book.cover" mode="aspectFill" @error="coverFailed = true" />
        <view v-else class="detail-cover__fallback">
          <text class="detail-cover__fallback-label">Picture Book</text>
          <text class="detail-cover__fallback-title">{{ book.title }}</text>
        </view>
      </view>

      <view class="detail-intro">
        <text class="section-kicker">Parent-child reading</text>
        <text class="page-title">{{ book.title }}</text>
        <view class="detail-meta">
          <text class="detail-meta__item">Level {{ book.level }}</text>
          <text class="detail-meta__item">{{ themeLabel }}</text>
          <text class="detail-meta__item">{{ book.ageRange }} 岁</text>
        </view>
        <text class="detail-description">{{ book.description }}</text>
      </view>
    </view>

    <view class="goal-card soft-card">
      <text class="goal-card__label">今日学习目标</text>
      <text class="goal-card__sentence">{{ book.targetSentence }}</text>
      <text class="goal-card__hint">先听一遍，再和孩子一起慢慢读。</text>
    </view>

    <text class="section-title">核心单词</text>
    <view class="detail-words soft-card">
      <WordChip v-for="word in words" :key="word.id" :word="word.word" :meaning="word.meaning" />
    </view>

    <text class="section-title">陪读提示</text>
    <ParentTipCard class="detail-tip" :title="parentTip.title" :questions="parentTip.questions" :activity="parentTip.activity" compact />

    <view class="detail-footer">
      <BigButton :label="readingButtonLabel" @tap="startReading" />
      <BigButton label="家长陪读卡" variant="ghost" @tap="goParent" />
    </view>
  </view>
</template>

<script setup lang="ts">
import CachedImage from "@/components/CachedImage.vue";
import { computed, ref, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import BigButton from "@/components/BigButton.vue";
import ParentTipCard from "@/components/ParentTipCard.vue";
import VehicleStoryArt from "@/components/VehicleStoryArt.vue";
import WordChip from "@/components/WordChip.vue";
import { getBookById, getBookWords, getParentTip, getThemeLabel, getTodayBook } from "@/services/bookService";
import { getProgress } from "@/services/progressService";
import type { UserProgress } from "@/types/book";

const bookId = ref(getTodayBook().id);
const coverFailed = ref(false);
const book = computed(() => getBookById(bookId.value) ?? getTodayBook());
const words = computed(() => getBookWords(book.value.id));
const parentTip = computed(() => getParentTip(book.value.id));
const themeLabel = computed(() => getThemeLabel(book.value.theme));
const savedProgress = computed(() => getProgress(book.value.id) as UserProgress | undefined);
const resumePage = computed(() => savedProgress.value?.readStatus === "reading" ? savedProgress.value.currentPage : 1);
const readingButtonLabel = computed(() => resumePage.value > 1 ? `继续阅读 · 第 ${resumePage.value} 页` : "开始阅读");

onLoad((query) => {
  const params = query as Record<string, string | undefined>;
  bookId.value = params.bookId || getTodayBook().id;
});

watch(
  () => book.value.cover,
  () => {
    coverFailed.value = false;
  }
);

function startReading() {
  uni.navigateTo({
    url: `/pages/reader/index?bookId=${book.value.id}&pageIndex=${resumePage.value}`
  });
}

function goParent() {
  uni.navigateTo({
    url: `/pages/parent/index?bookId=${book.value.id}`
  });
}
</script>

<style scoped lang="scss">
.detail-page {
  padding-bottom: 184rpx;
}

.detail-hero {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.detail-cover {
  position: relative;
  height: 440rpx;
  overflow: hidden;
  background: #e4ebe5;
}

.detail-cover__image,
.detail-cover__fallback {
  width: 100%;
  height: 100%;
}

.detail-cover__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 42rpx;
}

.detail-cover__fallback-label {
  padding: 10rpx 18rpx;
  border-radius: $radius-pill;
  font-size: 22rpx;
  font-weight: 800;
  color: $color-primary-dark;
  background: rgba(255, 214, 107, 0.64);
}

.detail-cover__fallback-title {
  margin-top: 28rpx;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 52rpx;
  font-weight: 700;
  color: $color-primary-dark;
  text-align: center;
  letter-spacing: 0;
  line-height: 1.12;
}

.detail-intro {
  padding: 0 4rpx;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.detail-meta__item {
  padding: 10rpx 18rpx;
  border-radius: $radius-pill;
  font-size: 23rpx;
  font-weight: 800;
  color: $color-primary-dark;
  background: #eef2ef;
}

.detail-description {
  display: block;
  margin-top: 20rpx;
  font-size: 26rpx;
  color: $color-muted;
  letter-spacing: 0;
  line-height: 1.58;
}

.goal-card {
  margin-top: 34rpx;
  padding: 30rpx;
  background: #f7eee8;
}

.goal-card__label {
  display: block;
  font-size: 24rpx;
  font-weight: 800;
  color: $color-coral;
  letter-spacing: 0;
}

.goal-card__sentence {
  display: block;
  margin-top: 14rpx;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 40rpx;
  font-weight: 700;
  color: $color-primary-dark;
  letter-spacing: 0;
  line-height: 1.25;
}

.goal-card__hint {
  display: block;
  margin-top: 14rpx;
  font-size: 25rpx;
  color: $color-muted;
  letter-spacing: 0;
}

.detail-words {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 26rpx;
}

.detail-tip {
  margin-bottom: 10rpx;
}

.detail-footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 16rpx;
  width: 100%;
  max-width: 820px;
  padding: 22rpx 32rpx calc(22rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid $color-line;
  background: rgba(251, 247, 239, 0.96);
  backdrop-filter: blur(14rpx);
  transform: translateX(-50%);
}
</style>
