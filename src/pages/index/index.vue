<template>
  <view class="page home-page">
    <view class="home-hero">
      <view class="home-hero__copy">
        <text class="section-kicker">今天一起读一本</text>
        <text class="home-hero__title">Hello, little reader!</text>
        <text class="home-hero__desc">和孩子一起听一句、指一个词、读完一小页。</text>
      </view>
      <view class="home-hero__scene" aria-hidden="true">
        <view class="home-hero__sun" />
        <view class="home-hero__book">
          <text class="home-hero__book-mark">ABC</text>
          <text class="home-hero__book-line">story time</text>
        </view>
      </view>
    </view>

    <view class="home-section-head">
      <view>
        <text class="section-kicker">Today Book</text>
        <text class="section-title home-section-title">今日绘本</text>
      </view>
      <text class="home-section-head__hint">约 {{ todayBook.pageCount }} 页</text>
    </view>

    <BookCard :book="todayBook" :is-read="isTodayBookRead" @select="goBookDetail" />

    <view class="home-page__main-action">
      <BigButton label="开始今天的绘本" @tap="goBookDetail(todayBook)" />
    </view>

    <view class="home-words soft-card">
      <view class="home-words__head">
        <view>
          <text class="section-kicker">3 Words</text>
          <text class="home-words__title">先认识这 3 个词</text>
        </view>
        <text class="home-words__badge">轻松跟读</text>
      </view>
      <view class="home-words__chips">
        <WordChip v-for="word in todayWords" :key="word.id" :word="word.word" :meaning="word.meaning" />
      </view>
      <text class="home-words__sentence">{{ todayBook.targetSentence }}</text>
    </view>

    <view class="home-stats soft-card">
      <view class="home-stat">
        <text class="home-stat__value">{{ stats.streakDays }}</text>
        <text class="home-stat__label">连续天数</text>
      </view>
      <view class="home-stat">
        <text class="home-stat__value">{{ stats.readBookCount }}</text>
        <text class="home-stat__label">已读绘本</text>
      </view>
      <view class="home-stat">
        <text class="home-stat__value">{{ stats.learnedWordCount }}</text>
        <text class="home-stat__label">已学单词</text>
      </view>
    </view>

    <text class="section-title">继续探索</text>
    <view class="topic-entry-grid">
      <view class="topic-entry topic-entry--vehicles soft-card" @tap="goVehicles">
        <text class="topic-entry__eyebrow">Vehicles</text>
        <text class="topic-entry__title">车车英语</text>
        <text class="topic-entry__desc">工程车、小汽车、救援车</text>
      </view>
      <view class="topic-entry topic-entry--world soft-card" @tap="goWorld">
        <text class="topic-entry__eyebrow">World Map</text>
        <text class="topic-entry__title">地图和国家</text>
        <text class="topic-entry__desc">map、flag、China、Canada</text>
      </view>
    </view>

    <view class="home-nav">
      <BigButton label="绘本馆" variant="ghost" @tap="goBooks" />
      <BigButton label="小游戏" variant="warm" @tap="goGame" />
      <BigButton label="家长中心" variant="ghost" @tap="goParent" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BigButton from "@/components/BigButton.vue";
import BookCard from "@/components/BookCard.vue";
import WordChip from "@/components/WordChip.vue";
import { getTodayBook, getTodayWords } from "@/services/bookService";
import { getHomeStats } from "@/services/progressService";
import type { Book } from "@/types/book";

const todayBook = getTodayBook();
const todayWords = getTodayWords();
const stats = computed(() => getHomeStats());
const isTodayBookRead = computed(() => stats.value.readBookCount > 0);

function goBookDetail(book: Book) {
  uni.navigateTo({
    url: `/pages/book-detail/index?bookId=${book.id}`
  });
}

function goBooks() {
  uni.navigateTo({ url: "/pages/books/index" });
}

function goGame() {
  uni.navigateTo({ url: `/pages/game/index?bookId=${todayBook.id}` });
}

function goParent() {
  uni.navigateTo({ url: `/pages/parent/index?bookId=${todayBook.id}` });
}

function goVehicles() {
  uni.navigateTo({ url: "/pages/vehicles/index" });
}

function goWorld() {
  uni.navigateTo({ url: "/pages/world/index" });
}
</script>

<style scoped lang="scss">
.home-page {
  padding-bottom: 56rpx;
}

.home-hero {
  position: relative;
  display: flex;
  min-height: 328rpx;
  padding: 36rpx 30rpx;
  overflow: hidden;
  border-radius: 36rpx;
  background:
    radial-gradient(circle at 84% 18%, rgba(255, 214, 107, 0.42), transparent 32%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 52%, #fff0dd 100%);
  box-shadow: $shadow-soft;
}

.home-hero__copy {
  position: relative;
  z-index: 2;
  width: 58%;
}

.home-hero__title {
  display: block;
  font-size: 54rpx;
  font-weight: 900;
  color: $color-primary-dark;
  letter-spacing: 0;
  line-height: 1.12;
}

.home-hero__desc {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  color: $color-muted;
  letter-spacing: 0;
  line-height: 1.5;
}

.home-hero__scene {
  position: absolute;
  right: 18rpx;
  bottom: 18rpx;
  width: 246rpx;
  height: 246rpx;
}

.home-hero__sun {
  position: absolute;
  top: 4rpx;
  right: 8rpx;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: $color-warm;
  box-shadow: 0 10rpx 24rpx rgba(255, 214, 107, 0.32);
}

.home-hero__book {
  position: absolute;
  right: 24rpx;
  bottom: 18rpx;
  width: 156rpx;
  height: 184rpx;
  padding: 26rpx 22rpx;
  border-radius: 26rpx 18rpx 18rpx 26rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.78);
  background: linear-gradient(160deg, $color-coral 0%, #ffbd9f 100%);
  box-shadow: 0 18rpx 32rpx rgba(255, 159, 122, 0.2);
  transform: rotate(-6deg);
}

.home-hero__book-mark,
.home-hero__book-line {
  display: block;
  color: #ffffff;
  letter-spacing: 0;
}

.home-hero__book-mark {
  font-size: 34rpx;
  font-weight: 900;
}

.home-hero__book-line {
  margin-top: 52rpx;
  font-size: 21rpx;
  font-weight: 800;
}

.home-section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 40rpx;
  margin-bottom: 18rpx;
}

.home-section-title {
  margin: 0;
}

.home-section-head__hint {
  padding: 10rpx 18rpx;
  border-radius: $radius-pill;
  font-size: 23rpx;
  font-weight: 900;
  color: $color-primary-dark;
  background: rgba(255, 214, 107, 0.58);
}

.home-page__main-action {
  margin-top: 22rpx;
}

.home-words {
  margin-top: 34rpx;
  padding: 28rpx;
}

.home-words__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.home-words__title {
  display: block;
  font-size: 32rpx;
  font-weight: 900;
  color: $color-primary-dark;
  letter-spacing: 0;
}

.home-words__badge {
  flex: 0 0 auto;
  padding: 10rpx 16rpx;
  border-radius: $radius-pill;
  font-size: 22rpx;
  font-weight: 900;
  color: $color-primary-dark;
  background: rgba(145, 216, 168, 0.42);
}

.home-words__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 24rpx;
}

.home-words__sentence {
  display: block;
  margin-top: 22rpx;
  padding: 20rpx 22rpx;
  border-radius: 22rpx;
  font-size: 32rpx;
  font-weight: 900;
  color: $color-primary-dark;
  letter-spacing: 0;
  background: rgba(255, 248, 236, 0.9);
}

.home-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 28rpx;
  padding: 18rpx;
}

.home-stat {
  min-height: 128rpx;
  padding: 18rpx 8rpx;
  border-radius: 24rpx;
  text-align: center;
  background: rgba(221, 240, 255, 0.5);
}

.home-stat__value {
  display: block;
  font-size: 48rpx;
  font-weight: 900;
  color: $color-primary;
  letter-spacing: 0;
}

.home-stat__label {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  font-weight: 800;
  color: $color-muted;
  letter-spacing: 0;
}

.topic-entry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.topic-entry {
  min-height: 212rpx;
  padding: 26rpx;
  overflow: hidden;
  transition: transform 0.16s ease;
}

.topic-entry:active {
  transform: scale(0.99);
}

.topic-entry--vehicles {
  background:
    radial-gradient(circle at 86% 20%, rgba(255, 159, 122, 0.28), transparent 32%),
    linear-gradient(135deg, #ffffff 0%, #fff3e8 100%);
}

.topic-entry--world {
  background:
    radial-gradient(circle at 82% 18%, rgba(107, 175, 232, 0.24), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 100%);
}

.topic-entry__eyebrow {
  display: block;
  font-size: 22rpx;
  font-weight: 900;
  color: $color-coral;
  letter-spacing: 0;
}

.topic-entry__title {
  display: block;
  margin-top: 20rpx;
  font-size: 34rpx;
  font-weight: 900;
  color: $color-primary-dark;
  letter-spacing: 0;
}

.topic-entry__desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: $color-muted;
  letter-spacing: 0;
  line-height: 1.45;
}

.home-nav {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 34rpx;
}
</style>
