<template>
  <view class="page home-page screen-with-nav">
    <view class="brand-row">
      <view class="brand-copy">
        <text class="brand-kicker">CAR EXPLORER</text>
        <text class="brand-title">车车探索小助手</text>
        <text class="brand-greeting">{{ childName }}，今天想开哪辆车出发？</text>
      </view>
      <button class="star-pill" aria-label="查看奖励车库" @tap="goGarage">
        <text class="star-pill__star">★</text>
        <text>{{ earnedStars }}</text>
      </button>
    </view>

    <view class="explore-hero" @tap="goBookDetail(explorerBook)">
      <CachedImage class="explore-hero__art" :src="explorerBook.cover" mode="aspectFill" />
      <view class="explore-hero__shade" />
      <view class="explore-hero__copy">
        <text class="explore-hero__eyebrow">TODAY'S TRIP</text>
        <text class="explore-hero__title">和红车车一起探索</text>
        <text class="explore-hero__desc">听一听、点一点，完成今天的三站小旅程。</text>
        <button class="explore-hero__listen" @tap.stop="playExplore">
          <text class="explore-hero__play">▶</text>
          <text>Let's explore!</text>
        </button>
      </view>
      <view class="explore-hero__route">{{ completedStops }}/3 站</view>
    </view>

    <view class="route-strip">
      <view v-for="(stop, index) in routeStops" :key="stop.label" class="route-stop">
        <view class="route-stop__marker" :class="{ 'route-stop__marker--done': index < completedStops }">
          {{ index < completedStops ? "✓" : index + 1 }}
        </view>
        <text class="route-stop__label">{{ stop.label }}</text>
      </view>
      <view class="route-strip__road" />
    </view>

    <view class="section-head">
      <view>
        <text class="section-kicker">CHOOSE A MISSION</text>
        <text class="section-title">探索任务</text>
      </view>
      <text class="section-link" @tap="goGarage">我的车库</text>
    </view>

    <view class="mission-grid">
      <button class="mission-card mission-card--story" @tap="goBooks">
        <CachedImage class="mission-card__art" :src="explorerBook.cover" mode="aspectFill" />
        <view class="mission-card__shade" />
        <view class="mission-card__copy">
          <text class="mission-card__count">9 本</text>
          <text class="mission-card__title">车车绘本</text>
          <text class="mission-card__desc">听故事去旅行</text>
        </view>
      </button>

      <button class="mission-card mission-card--vehicle" @tap="goVehicles">
        <CachedImage class="mission-card__art mission-card__art--contain" :src="vehicleMissionImage" mode="aspectFit" />
        <view class="mission-card__copy">
          <text class="mission-card__count">22 辆</text>
          <text class="mission-card__title">认识车辆</text>
          <text class="mission-card__desc">点车辆听发音</text>
        </view>
      </button>

      <button class="mission-card mission-card--world" @tap="goWorld">
        <CachedImage class="mission-card__art mission-card__art--contain" :src="worldMissionImage" mode="aspectFit" />
        <view class="mission-card__copy">
          <text class="mission-card__count">50 国</text>
          <text class="mission-card__title">世界地图</text>
          <text class="mission-card__desc">坐车车看世界</text>
        </view>
      </button>

      <button class="mission-card mission-card--logo" @tap="goLogos">
        <CachedImage class="mission-card__art mission-card__art--logo" :src="logoMissionImage" mode="aspectFit" />
        <view class="mission-card__copy">
          <text class="mission-card__count">50 个</text>
          <text class="mission-card__title">车标发现</text>
          <text class="mission-card__desc">认一认汽车标志</text>
        </view>
      </button>
    </view>

    <view class="explorer-progress soft-card">
      <view class="explorer-progress__badge">★</view>
      <view class="explorer-progress__copy">
        <text class="explorer-progress__title">本周探索足迹</text>
        <text class="explorer-progress__desc">已读 {{ stats.readBookCount }} 本 · 认识 {{ stats.learnedWordCount }} 个词</text>
        <view class="explorer-progress__track">
          <view class="explorer-progress__fill" :style="{ width: weeklyProgress + '%' }" />
        </view>
      </view>
      <button class="explorer-progress__link" @tap="goParent">家长查看</button>
    </view>

    <BottomNav active="home" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import BottomNav from "@/components/BottomNav.vue";
import CachedImage from "@/components/CachedImage.vue";
import { mapIcon, vehicleIcon } from "@/mock/topicAssets";
import { getBookById, getTodayBook } from "@/services/bookService";
import { getHomeStats, getLearningState } from "@/services/progressService";
import { highResolutionAsset } from "@/services/assetService";
import { speakEnglish } from "@/services/audioService";
import type { Book } from "@/types/book";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const explorerBook = getBookById("book_red_car_001") ?? getTodayBook();
const stats = ref(getHomeStats());
const learningState = ref(getLearningState());
const routeStops = [
  { label: "听一个词" },
  { label: "读车车故事" },
  { label: "发现一个国家" }
];

const childName = computed(() => learningState.value.childNickname || "小小探索家");
const earnedStars = computed(() => Math.min(99, stats.value.readBookCount + stats.value.learnedWordCount));
const completedStops = computed(() => stats.value.todayCompleted ? 3 : Math.min(2, stats.value.readBookCount % 3));
const weeklyProgress = computed(() => Math.min(100, Math.round(stats.value.weeklyReadingSeconds / 18)));
const vehicleMissionImage = vehicleIcon("fire-truck");
const worldMissionImage = mapIcon("world");
const logoMissionImage = highResolutionAsset("/static/cartown-logos/toyota.webp");

onShow(() => {
  stats.value = getHomeStats();
  learningState.value = getLearningState();
});

function playExplore() {
  speakEnglish("Let's explore!");
}

function goBookDetail(book: Book) {
  uni.navigateTo({ url: "/pages/book-detail/index?bookId=" + book.id });
}

function goBooks() {
  uni.reLaunch({ url: "/pages/books/index" });
}

function goParent() {
  uni.reLaunch({ url: "/pages/parent/index?bookId=" + explorerBook.id });
}

function goVehicles() {
  uni.reLaunch({ url: "/pages/vehicles/index" });
}

function goWorld() {
  uni.navigateTo({ url: "/pages/world/index" });
}

function goLogos() {
  uni.navigateTo({ url: "/pages/car-logos/index" });
}

function goGarage() {
  uni.navigateTo({ url: "/pages/car-garage/index" });
}
</script>

<style scoped lang="scss">
.home-page {
  background:
    radial-gradient(circle at 94% 2%, rgba(89, 159, 185, 0.15), transparent 25%),
    $color-cream;
}

.brand-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 22rpx;
  padding: 4rpx 0 24rpx;
}

.brand-copy,
.brand-title,
.brand-greeting {
  display: block;
}

.brand-kicker {
  font-size: 18rpx;
  font-weight: 900;
  color: #287b92;
  letter-spacing: 2rpx;
}

.brand-title {
  margin-top: 5rpx;
  font-size: 39rpx;
  font-weight: 900;
  color: #243f50;
  line-height: 1.12;
}

.brand-greeting {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #65727a;
}

.star-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7rpx;
  min-width: 94rpx;
  height: 58rpx;
  padding: 0 18rpx;
  border: 2rpx solid rgba(214, 155, 38, 0.28);
  border-radius: 29rpx;
  font-size: 23rpx;
  font-weight: 900;
  color: #77520c;
  background: #fff4cc;
  box-shadow: 0 8rpx 18rpx rgba(123, 86, 19, 0.08);
}

.star-pill__star {
  color: #eba91d;
}

.explore-hero {
  position: relative;
  height: 380rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: #b9d6df;
  box-shadow: 0 18rpx 38rpx rgba(45, 74, 86, 0.16);
}

.explore-hero__art,
.explore-hero__shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.explore-hero__shade {
  background: linear-gradient(90deg, rgba(23, 48, 61, 0.88) 0%, rgba(23, 48, 61, 0.6) 52%, rgba(23, 48, 61, 0.04) 82%);
}

.explore-hero__copy {
  position: relative;
  z-index: 2;
  width: 64%;
  padding: 38rpx 30rpx;
}

.explore-hero__eyebrow,
.explore-hero__title,
.explore-hero__desc {
  display: block;
}

.explore-hero__eyebrow {
  font-size: 18rpx;
  font-weight: 900;
  color: #ffd96e;
  letter-spacing: 2rpx;
}

.explore-hero__title {
  margin-top: 12rpx;
  font-size: 38rpx;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.17;
}

.explore-hero__desc {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.45;
}

.explore-hero__listen {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  min-height: 62rpx;
  margin-top: 23rpx;
  padding: 0 23rpx;
  border-radius: 31rpx;
  font-size: 22rpx;
  font-weight: 900;
  color: #243f50;
  background: #ffd96e;
}

.explore-hero__play {
  font-size: 18rpx;
}

.explore-hero__route {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  z-index: 2;
  padding: 9rpx 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.42);
  border-radius: 24rpx;
  font-size: 19rpx;
  font-weight: 800;
  color: #ffffff;
  background: rgba(17, 45, 58, 0.42);
}

.route-strip {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
  margin-top: 24rpx;
  padding: 0 12rpx;
}

.route-strip__road {
  position: absolute;
  top: 25rpx;
  right: 17%;
  left: 17%;
  z-index: 0;
  border-top: 4rpx dashed #b9b5a9;
}

.route-stop {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.route-stop__marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  border: 4rpx solid $color-cream;
  border-radius: 50%;
  font-size: 20rpx;
  font-weight: 900;
  color: #7a7770;
  background: #dedbd2;
}

.route-stop__marker--done {
  color: #ffffff;
  background: #3c9b76;
}

.route-stop__label {
  font-size: 19rpx;
  font-weight: 800;
  color: #5d666a;
}

.section-head .section-kicker,
.section-head .section-title {
  margin: 0;
}

.section-head .section-title {
  margin-top: 4rpx;
}

.mission-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.mission-card {
  position: relative;
  width: 100%;
  height: 248rpx;
  overflow: hidden;
  border: 1rpx solid rgba(39, 62, 73, 0.1);
  border-radius: 8rpx;
  text-align: left;
  box-shadow: 0 10rpx 24rpx rgba(47, 58, 74, 0.07);
}

.mission-card__art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.mission-card__art--contain {
  top: -12rpx;
  left: 39%;
  width: 66%;
  height: 66%;
}

.mission-card__art--logo {
  top: 12rpx;
  right: 10rpx;
  left: auto;
  width: 47%;
  height: 47%;
}

.mission-card__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(24, 47, 57, 0.88) 0%, rgba(24, 47, 57, 0.08) 78%);
}

.mission-card__copy {
  position: absolute;
  right: 18rpx;
  bottom: 17rpx;
  left: 18rpx;
  z-index: 2;
}

.mission-card__count,
.mission-card__title,
.mission-card__desc {
  display: block;
}

.mission-card__count {
  width: max-content;
  padding: 5rpx 10rpx;
  border-radius: 18rpx;
  font-size: 17rpx;
  font-weight: 900;
  color: #315768;
  background: rgba(255, 255, 255, 0.82);
}

.mission-card__title {
  margin-top: 8rpx;
  font-size: 28rpx;
  font-weight: 900;
  color: #263f4b;
}

.mission-card__desc {
  margin-top: 4rpx;
  font-size: 19rpx;
  color: #68757b;
}

.mission-card--story .mission-card__title,
.mission-card--story .mission-card__desc {
  color: #ffffff;
}

.mission-card--vehicle { background: #dff0ed; }
.mission-card--world { background: #e6eef8; }
.mission-card--logo { background: #fff0d7; }

.explorer-progress {
  display: grid;
  grid-template-columns: 62rpx 1fr auto;
  gap: 16rpx;
  align-items: center;
  margin-top: 24rpx;
  padding: 22rpx;
}

.explorer-progress__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  font-size: 30rpx;
  color: #ffffff;
  background: #e1a832;
}

.explorer-progress__title,
.explorer-progress__desc {
  display: block;
}

.explorer-progress__title {
  font-size: 23rpx;
  font-weight: 900;
  color: #243f50;
}

.explorer-progress__desc {
  margin-top: 5rpx;
  font-size: 18rpx;
  color: #718087;
}

.explorer-progress__track {
  width: 100%;
  height: 9rpx;
  margin-top: 11rpx;
  overflow: hidden;
  border-radius: 5rpx;
  background: #e4e1d8;
}

.explorer-progress__fill {
  height: 100%;
  min-width: 7%;
  border-radius: inherit;
  background: #3c9b76;
}

.explorer-progress__link {
  padding: 16rpx 10rpx;
  font-size: 19rpx;
  font-weight: 800;
  color: #287b92;
}

@media (min-width: 900px) {
  .explore-hero {
    height: 440rpx;
  }

  .mission-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>