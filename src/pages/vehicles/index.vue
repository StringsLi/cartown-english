<template>
  <view class="page topic-page">
    <view class="topic-hero soft-card">
      <view>
        <text class="section-kicker">CarTown English</text>
        <text class="page-title">小汽车英语小镇</text>
        <text class="page-subtitle">听一听，点一点，开车学英语。CarTown 的玩法已经合到这里。</text>
      </view>
      <view class="topic-hero__stars">
        <text class="topic-hero__star-value">{{ progress.stars }}</text>
        <text class="topic-hero__star-label">stars</text>
      </view>
    </view>

    <view class="sentence-card soft-card">
      <text class="sentence-card__label">今天先会说</text>
      <text class="sentence-card__en">I see a car.</text>
      <text class="sentence-card__cn">我看见一辆小汽车。</text>
      <BigButton class="sentence-card__audio" label="听句子" variant="warm" @tap="playSentence" />
    </view>

    <view class="station-grid">
      <view v-for="station in stations" :key="station.path" class="station-card soft-card" @tap="goStation(station.path)">
        <view class="station-card__visual">
          <CartownVehicle :color="station.color" :accent="station.accent" :kind="station.kind" />
        </view>
        <text class="station-card__tag">{{ station.tag }}</text>
        <text class="station-card__title">{{ station.title }}</text>
        <text class="station-card__desc">{{ station.desc }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BigButton from "@/components/BigButton.vue";
import CartownVehicle from "@/components/CartownVehicle.vue";
import { getCartownProgress } from "@/services/cartownProgressService";
import { speakEnglish } from "@/services/audioService";
import type { Vehicle } from "@/mock/cartown";

const progress = computed(() => getCartownProgress());

const stations: Array<{
  title: string;
  desc: string;
  tag: string;
  path: string;
  color: string;
  accent: string;
  kind: Vehicle["kind"] | "color-car";
}> = [
  {
    title: "车辆词卡",
    desc: "小汽车、工程车、帮忙的车",
    tag: "Words",
    path: "/pages/car-learn/index",
    color: "#f95757",
    accent: "#ffd166",
    kind: "car"
  },
  {
    title: "Brand Badges",
    desc: "50 个车标认知",
    tag: "Logos",
    path: "/pages/car-logos/index",
    color: "#49a6ff",
    accent: "#ffd447",
    kind: "race-car"
  },
  {
    title: "Color Cars",
    desc: "听颜色选小车",
    tag: "Listen",
    path: "/pages/car-colors/index",
    color: "#3aa6ff",
    accent: "#ffd447",
    kind: "color-car"
  },
  {
    title: "Count Cars",
    desc: "1 到 5 数车车",
    tag: "1-5",
    path: "/pages/car-count/index",
    color: "#49a6ff",
    accent: "#ffe66d",
    kind: "truck"
  },
  {
    title: "Traffic Light",
    desc: "红黄绿动作游戏",
    tag: "Go",
    path: "/pages/car-traffic/index",
    color: "#43c66b",
    accent: "#ffd447",
    kind: "race-car"
  },
  {
    title: "Car Story",
    desc: "两本车车小绘本",
    tag: "Books",
    path: "/pages/car-stories/index",
    color: "#ffd447",
    accent: "#f95757",
    kind: "bus"
  },
  {
    title: "Garage",
    desc: "星星奖励车库",
    tag: "Stars",
    path: "/pages/car-garage/index",
    color: "#ff7a1a",
    accent: "#ffffff",
    kind: "van"
  }
];

function playSentence() {
  speakEnglish("I see a car.");
}

function goStation(path: string) {
  uni.navigateTo({ url: path });
}
</script>

<style scoped lang="scss">
.topic-page {
  padding-bottom: 48rpx;
}

.topic-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 28rpx;
  padding: 34rpx 30rpx;
  background:
    radial-gradient(circle at 88% 18%, rgba(255, 214, 107, 0.36), transparent 32%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 58%, #fff0dd 100%);
}

.topic-hero__stars {
  flex: 0 0 auto;
  width: 126rpx;
  min-height: 126rpx;
  padding: 22rpx 8rpx;
  border-radius: 34rpx;
  text-align: center;
  background: rgba(255, 214, 107, 0.72);
}

.topic-hero__star-value {
  display: block;
  font-size: 42rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.topic-hero__star-label {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  font-weight: 900;
  color: $color-muted;
}

.sentence-card {
  margin-top: 28rpx;
  padding: 30rpx;
}

.sentence-card__label {
  display: block;
  font-size: 24rpx;
  color: $color-muted;
}

.sentence-card__en {
  display: block;
  margin-top: 12rpx;
  font-size: 40rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.sentence-card__cn {
  display: block;
  margin-top: 10rpx;
  font-size: 25rpx;
  color: $color-muted;
}

.sentence-card__audio {
  margin-top: 20rpx;
}

.station-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 28rpx;
}

.station-card {
  position: relative;
  min-height: 330rpx;
  padding: 20rpx;
  overflow: hidden;
  transition: transform 0.16s ease;
}

.station-card:active {
  transform: scale(0.98);
}

.station-card__visual {
  height: 150rpx;
  margin: 16rpx 0 10rpx;
}

.station-card__tag {
  position: absolute;
  top: 18rpx;
  right: 18rpx;
  padding: 8rpx 14rpx;
  border-radius: $radius-pill;
  font-size: 21rpx;
  font-weight: 900;
  color: $color-primary-dark;
  background: rgba(255, 214, 107, 0.7);
}

.station-card__title {
  display: block;
  font-size: 31rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.station-card__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  color: $color-muted;
  line-height: 1.35;
}
</style>
