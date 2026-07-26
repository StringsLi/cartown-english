<template>
  <view class="page vehicles-page screen-with-nav">
    <view class="topic-header">
      <view>
        <text class="page-title">交通工具 Vehicles</text>
        <text class="page-subtitle">看图认识车辆，点一下听自然英文发音。</text>
      </view>
      <button class="header-audio" aria-label="播放示范句" @tap="playSentence">▶</button>
    </view>

    <view class="vehicle-hero soft-card">
      <view class="vehicle-hero__copy">
        <text class="vehicle-hero__eyebrow">认识交通工具</text>
        <text class="vehicle-hero__title">I see a car.</text>
        <text class="vehicle-hero__desc">我看见一辆小汽车。</text>
      </view>
      <view class="vehicle-hero__image vehicle-art vehicle-art--car" aria-label="红色小汽车插图" />
    </view>

    <scroll-view class="station-scroll" scroll-x>
      <view class="station-scroll__inner">
        <button v-for="station in stations" :key="station.path" class="station-tab" @tap="goStation(station.path)">
          <text class="station-tab__tag">{{ station.tag }}</text>
          <text class="station-tab__title">{{ station.title }}</text>
        </button>
      </view>
    </scroll-view>

    <view class="section-head">
      <text class="section-title">常用车辆</text>
      <text class="section-link" @tap="goStation('/pages/car-learn/index')">查看全部</text>
    </view>

    <view class="vehicle-grid">
      <button v-for="item in featuredWords" :key="item.id" class="vehicle-word soft-card" @tap="playWord(item)">
        <view class="vehicle-word__image-wrap">
          <view class="vehicle-word__image vehicle-art" :class="item.atlasClass" />
        </view>
        <text class="vehicle-word__cn">{{ item.meaning }}</text>
        <text class="vehicle-word__en">{{ item.word }}</text>
        <text class="vehicle-word__listen">▶ 听发音</text>
      </button>
    </view>

    <view class="brand-section soft-card" @tap="goStation('/pages/car-logos/index')">
      <view class="brand-section__head">
        <view>
          <text class="brand-section__eyebrow">品牌认知</text>
          <text class="brand-section__title">认识真实汽车品牌</text>
        </view>
        <text class="brand-section__more">50 个车标 ›</text>
      </view>
      <view class="brand-row">
        <CartownLogoBadge v-for="logo in featuredLogos" :key="logo.id" :logo="logo" size="small" :show-name="false" />
      </view>
    </view>

    <BottomNav active="learn" />
  </view>
</template>

<script setup lang="ts">
import BottomNav from "@/components/BottomNav.vue";
import CartownLogoBadge from "@/components/CartownLogoBadge.vue";
import { carLogos } from "@/mock/cartown";
import { vehicleGroups } from "@/mock/topics";
import { speakEnglish } from "@/services/audioService";
import type { TopicWord } from "@/types/topic";

const stationItems = [
  ["词卡", "车辆词汇", "/pages/car-learn/index"],
  ["车标", "品牌认知", "/pages/car-logos/index"],
  ["颜色", "听音选车", "/pages/car-colors/index"],
  ["数字", "1 到 5", "/pages/car-count/index"],
  ["动作", "红绿灯", "/pages/car-traffic/index"],
  ["故事", "汽车绘本", "/pages/car-stories/index"],
  ["奖励", "我的车库", "/pages/car-garage/index"]
] as const;

const stations = stationItems.map(([tag, title, path]) => ({ tag, title, path }));
const allVehicleWords = vehicleGroups.flatMap((group) => group.words);
const featuredVehicles = [
  ["vehicle_car", "vehicle-art--car"],
  ["vehicle_fire_truck", "vehicle-art--fire-truck"],
  ["vehicle_excavator", "vehicle-art--excavator"],
  ["vehicle_bus", "vehicle-art--bus"],
  ["vehicle_train", "vehicle-art--train"],
  ["vehicle_truck", "vehicle-art--truck"]
] as const;

const featuredWords = featuredVehicles.flatMap(([id, atlasClass]) => {
  const item = allVehicleWords.find((word) => word.id === id);
  return item ? [{ ...item, atlasClass }] : [];
});
const featuredLogos = carLogos.slice(0, 4);

function playSentence() {
  speakEnglish("I see a car.");
}

function playWord(item: TopicWord) {
  speakEnglish(`${item.word}. ${item.sentence}`);
}

function goStation(path: string) {
  uni.navigateTo({ url: path });
}
</script>

<style scoped lang="scss">
.topic-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  padding: 4rpx 0 20rpx;
}

.header-audio {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border: 1rpx solid rgba(185, 95, 61, 0.16);
  border-radius: 50%;
  font-size: 20rpx;
  color: $color-primary;
  background: #f8eee8;
}

.vehicle-hero {
  position: relative;
  min-height: 202rpx;
  overflow: hidden;
  background: #dce8e3;
}

.vehicle-hero__copy {
  position: relative;
  z-index: 1;
  width: 60%;
  padding: 30rpx;
}

.vehicle-hero__eyebrow,
.vehicle-hero__title,
.vehicle-hero__desc {
  display: block;
}

.vehicle-hero__eyebrow {
  font-size: 22rpx;
  font-weight: 800;
  color: #426d61;
}

.vehicle-hero__title {
  margin-top: 12rpx;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 36rpx;
  font-weight: 700;
  color: $color-primary-dark;
}

.vehicle-hero__desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $color-muted;
}

.vehicle-hero__image {
  position: absolute;
  right: 2rpx;
  bottom: -8rpx;
  width: 220rpx;
  height: 220rpx;
}

.vehicle-art {
  background-image: url("/static/ui/vehicle-atlas-premium.png");
  background-repeat: no-repeat;
  background-size: 300% 200%;
}

.vehicle-art--car {
  background-position: 0 0;
}

.vehicle-art--fire-truck {
  background-position: 50% 0;
}

.vehicle-art--excavator {
  background-position: 100% 0;
}

.vehicle-art--bus {
  background-position: 0 100%;
}

.vehicle-art--train {
  background-size: 318% 212%;
  background-position: 50% 100%;
}

.vehicle-art--truck {
  background-position: 100% 100%;
}

.station-scroll {
  margin: 18rpx -28rpx 0;
  white-space: nowrap;
}

.station-scroll__inner {
  display: inline-flex;
  gap: 12rpx;
  padding: 0 28rpx 8rpx;
}

.station-tab {
  min-width: 136rpx;
  min-height: 80rpx;
  padding: 12rpx 18rpx;
  border: 1rpx solid $color-line;
  border-radius: $radius-small;
  text-align: left;
  background: #fffdf9;
}

.station-tab__tag,
.station-tab__title {
  display: block;
}

.station-tab__tag {
  font-size: 18rpx;
  font-weight: 800;
  color: $color-primary;
}

.station-tab__title {
  margin-top: 4rpx;
  font-size: 22rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.vehicle-word {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 302rpx;
  margin: 0;
  padding: 16rpx;
  text-align: center;
}

.vehicle-word__image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 170rpx;
  border-radius: $radius-small;
  background: #f2f0e9;
}

.vehicle-word__image {
  width: 164rpx;
  height: 164rpx;
}

.vehicle-word__cn {
  margin-top: 13rpx;
  font-size: 25rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.vehicle-word__en {
  margin-top: 3rpx;
  font-size: 21rpx;
  color: $color-muted;
  text-transform: capitalize;
}

.vehicle-word__listen {
  margin-top: 8rpx;
  font-size: 19rpx;
  font-weight: 700;
  color: $color-primary;
}

.brand-section {
  margin-top: 22rpx;
  padding: 24rpx;
}

.brand-section__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20rpx;
}

.brand-section__eyebrow,
.brand-section__title {
  display: block;
}

.brand-section__eyebrow {
  font-size: 19rpx;
  font-weight: 800;
  color: $color-primary;
}

.brand-section__title {
  margin-top: 5rpx;
  font-size: 27rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.brand-section__more {
  font-size: 20rpx;
  color: $color-muted;
}

.brand-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8rpx;
  margin-top: 18rpx;
}

@media (min-width: 900px) {
  .vehicle-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
