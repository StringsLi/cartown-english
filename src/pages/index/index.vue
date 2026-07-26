<template>
  <view class="page home-page screen-with-nav">
    <view class="home-header">
      <view class="child-profile">
        <view class="child-profile__avatar">{{ childInitial }}</view>
        <view>
          <text class="child-profile__name">{{ childName }}</text>
          <text class="child-profile__age">3-6 岁亲子阅读</text>
        </view>
      </view>
      <view class="home-header__actions">
        <view class="header-action">
          <text class="header-action__icon">✓</text>
          <text>打卡</text>
        </view>
        <view class="header-action">
          <text class="header-action__icon">•</text>
          <text>消息</text>
        </view>
      </view>
    </view>

    <view class="daily-card soft-card">
      <image class="daily-card__art" :src="todayBook.cover" mode="aspectFill" />
      <view class="daily-card__shade" />
      <view class="daily-card__copy">
        <view class="daily-card__label-row">
          <text class="daily-card__label">每日一句</text>
          <button class="daily-card__audio" aria-label="播放每日一句" @tap="playDailySentence">▶</button>
        </view>
        <text class="daily-card__en">You are so brave!</text>
        <text class="daily-card__cn">你真勇敢！</text>
      </view>
    </view>

    <view class="section-head">
      <text class="section-title">今日绘本</text>
      <text class="section-link" @tap="goBooks">全部绘本</text>
    </view>

    <view class="today-book soft-card" @tap="goBookDetail(todayBook)">
      <image class="today-book__cover" :src="todayBook.cover" mode="aspectFill" />
      <view class="today-book__content">
        <view class="today-book__meta-row">
          <text class="today-book__eyebrow">TODAY'S STORY</text>
          <text class="today-book__level">L{{ todayBook.level }}</text>
        </view>
        <text class="today-book__title">{{ todayBook.title }}</text>
        <text class="today-book__subtitle">{{ todayBook.description }}</text>
        <button class="today-book__button" @tap.stop="goBookDetail(todayBook)">开始阅读</button>
      </view>
    </view>

    <view class="star-card soft-card">
      <view>
        <text class="star-card__title">学习之星</text>
        <text class="star-card__desc">今天再完成一本，就能点亮一颗星</text>
      </view>
      <view class="star-card__progress">
        <text v-for="star in stars" :key="star" class="star-card__star" :class="{ 'star-card__star--on': star <= earnedStars }">★</text>
        <text class="star-card__count">{{ earnedStars }}/5</text>
      </view>
    </view>

    <view class="module-grid">
      <view class="module-item" @tap="goBooks">
        <view class="module-item__icon module-item__icon--book">▤</view>
        <text class="module-item__title">绘本馆</text>
        <text class="module-item__desc">丰富绘本</text>
      </view>
      <view class="module-item" @tap="goVehicles">
        <view class="module-item__icon module-item__icon--learn">ABC</view>
        <text class="module-item__title">主题学习</text>
        <text class="module-item__desc">词汇分类</text>
      </view>
      <view class="module-item" @tap="goWorld">
        <view class="module-item__icon module-item__icon--world">◎</view>
        <text class="module-item__title">国家英语</text>
        <text class="module-item__desc">认识世界</text>
      </view>
      <view class="module-item" @tap="goParent">
        <view class="module-item__icon module-item__icon--parent">⌂</view>
        <text class="module-item__title">家长中心</text>
        <text class="module-item__desc">成长报告</text>
      </view>
    </view>

    <BottomNav active="home" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import BottomNav from "@/components/BottomNav.vue";
import { getTodayBook } from "@/services/bookService";
import { getHomeStats, getLearningState } from "@/services/progressService";
import { speakEnglish } from "@/services/audioService";
import type { Book } from "@/types/book";

const todayBook = getTodayBook();
const stats = ref(getHomeStats());
const learningState = ref(getLearningState());
const childName = computed(() => learningState.value.childNickname || "宝贝");
const childInitial = computed(() => childName.value.slice(0, 1).toUpperCase());
const stars = [1, 2, 3, 4, 5];
const earnedStars = computed(() => Math.min(5, stats.value.readBookCount));

onShow(() => {
  stats.value = getHomeStats();
  learningState.value = getLearningState();
});

function playDailySentence() {
  speakEnglish("You are so brave!");
}

function goBookDetail(book: Book) {
  uni.navigateTo({ url: `/pages/book-detail/index?bookId=${book.id}` });
}

function goBooks() {
  uni.reLaunch({ url: "/pages/books/index" });
}

function goParent() {
  uni.reLaunch({ url: `/pages/parent/index?bookId=${todayBook.id}` });
}

function goVehicles() {
  uni.reLaunch({ url: "/pages/vehicles/index" });
}

function goWorld() {
  uni.navigateTo({ url: "/pages/world/index" });
}
</script>

<style scoped lang="scss">
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 2rpx 0 22rpx;
}

.child-profile {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.child-profile__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 66rpx;
  height: 66rpx;
  border: 2rpx solid #dfc8ad;
  border-radius: 50%;
  font-size: 27rpx;
  font-weight: 800;
  color: #6f472f;
  background: #f1dcc4;
}

.child-profile__name,
.child-profile__age {
  display: block;
}

.child-profile__name {
  font-size: 28rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.child-profile__age {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: $color-muted;
}

.home-header__actions {
  display: flex;
  gap: 18rpx;
}

.header-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
  font-size: 19rpx;
  color: $color-muted;
}

.header-action__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  border: 1rpx solid $color-line;
  border-radius: 50%;
  font-size: 19rpx;
  color: $color-primary;
  background: #fffdf9;
}

.daily-card {
  position: relative;
  height: 246rpx;
  overflow: hidden;
  background: #dce7df;
}

.daily-card__art,
.daily-card__shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.daily-card__art {
  opacity: 0.62;
}

.daily-card__shade {
  background: linear-gradient(90deg, rgba(255, 253, 249, 0.98) 0%, rgba(255, 253, 249, 0.82) 50%, rgba(255, 253, 249, 0.05) 100%);
}

.daily-card__copy {
  position: relative;
  z-index: 1;
  width: 68%;
  padding: 30rpx;
}

.daily-card__label-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.daily-card__label {
  font-size: 23rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.daily-card__audio {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  font-size: 16rpx;
  color: $color-primary;
  background: #f7e6d8;
}

.daily-card__en {
  display: block;
  margin-top: 18rpx;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 38rpx;
  font-weight: 700;
  color: #1f2f43;
  line-height: 1.18;
}

.daily-card__cn {
  display: block;
  margin-top: 12rpx;
  font-size: 25rpx;
  color: #5e5952;
}

.today-book {
  overflow: hidden;
}

.today-book__cover {
  width: 100%;
  height: 300rpx;
}

.today-book__content {
  padding: 24rpx 26rpx 26rpx;
}

.today-book__meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.today-book__eyebrow {
  font-size: 19rpx;
  font-weight: 800;
  color: $color-primary;
}

.today-book__level {
  padding: 5rpx 11rpx;
  border-radius: $radius-pill;
  font-size: 19rpx;
  font-weight: 800;
  color: #587258;
  background: #e5ecdf;
}

.today-book__title {
  display: block;
  margin-top: 8rpx;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 36rpx;
  font-weight: 700;
  color: $color-primary-dark;
}

.today-book__subtitle {
  display: block;
  margin-top: 6rpx;
  font-size: 23rpx;
  color: $color-muted;
}

.today-book__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 66rpx;
  margin-top: 20rpx;
  padding: 0 28rpx;
  border-radius: $radius-pill;
  font-size: 24rpx;
  font-weight: 800;
  color: #ffffff;
  background: $color-primary;
}

.star-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  margin-top: 22rpx;
  padding: 24rpx 26rpx;
}

.star-card__title,
.star-card__desc {
  display: block;
}

.star-card__title {
  font-size: 27rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.star-card__desc {
  margin-top: 5rpx;
  font-size: 20rpx;
  color: $color-muted;
}

.star-card__progress {
  display: flex;
  align-items: center;
  gap: 3rpx;
  white-space: nowrap;
}

.star-card__star {
  font-size: 30rpx;
  color: #d8d4cc;
}

.star-card__star--on {
  color: $color-warm;
}

.star-card__count {
  margin-left: 8rpx;
  font-size: 19rpx;
  color: $color-muted;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 24rpx;
}

.module-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 14rpx 4rpx;
  text-align: center;
}

.module-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border-radius: 14rpx;
  font-size: 22rpx;
  font-weight: 800;
  color: #ffffff;
}

.module-item__icon--book { background: #7f9b76; }
.module-item__icon--learn { background: #9a75a1; }
.module-item__icon--world { background: #668aa3; }
.module-item__icon--parent { background: #be9140; }

.module-item__title {
  margin-top: 10rpx;
  font-size: 22rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.module-item__desc {
  margin-top: 3rpx;
  font-size: 18rpx;
  color: $color-muted;
}
</style>
