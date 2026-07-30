<template>
  <view class="cartown-vehicle" :class="`cartown-vehicle--${props.kind}`" :style="vehicleStyle">
    <view class="cartown-vehicle__shadow" />
    <view class="cartown-vehicle__body">
      <view class="cartown-vehicle__roof" />
      <view class="cartown-vehicle__window cartown-vehicle__window--one" />
      <view class="cartown-vehicle__window cartown-vehicle__window--two" />
      <view class="cartown-vehicle__beltline" />
      <view class="cartown-vehicle__tail-light" />
      <view class="cartown-vehicle__headlight" />
      <view class="cartown-vehicle__grille" />
      <view v-if="isService" class="cartown-vehicle__light" />
      <view v-if="props.kind === 'taxi'" class="cartown-vehicle__taxi">TAXI</view>
      <view v-if="props.kind === 'ambulance'" class="cartown-vehicle__cross">+</view>
      <view v-if="props.kind === 'race-car'" class="cartown-vehicle__number">1</view>
    </view>
    <view v-if="props.kind === 'scooter'" class="cartown-vehicle__handlebar" />
    <view class="cartown-vehicle__wheel cartown-vehicle__wheel--front">
      <view class="cartown-vehicle__wheel-core" />
    </view>
    <view class="cartown-vehicle__wheel cartown-vehicle__wheel--back">
      <view class="cartown-vehicle__wheel-core" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Vehicle } from "@/mock/cartown";

const props = withDefaults(
  defineProps<{
    color: string;
    accent?: string;
    kind?: Vehicle["kind"] | "color-car";
  }>(),
  {
    accent: "#d8b45a",
    kind: "car"
  }
);

const vehicleStyle = computed(() => ({
  "--vehicle-color": props.color,
  "--vehicle-accent": props.accent,
  "--vehicle-color-soft": `${props.color}33`
}));

const isService = computed(() => ["police-car", "ambulance", "fire-truck"].includes(props.kind));
</script>

<style scoped lang="scss">
.cartown-vehicle {
  position: relative;
  width: 100%;
  min-width: 160rpx;
  height: 150rpx;
  color: #1f2c3d;
}

.cartown-vehicle__shadow {
  position: absolute;
  right: 22rpx;
  bottom: 12rpx;
  left: 22rpx;
  height: 18rpx;
  border-radius: $radius-pill;
  background: radial-gradient(ellipse at center, rgba(28, 38, 52, 0.24) 0%, rgba(28, 38, 52, 0.04) 72%, transparent 100%);
  filter: blur(1rpx);
}

.cartown-vehicle__body {
  position: absolute;
  right: 20rpx;
  bottom: 42rpx;
  left: 20rpx;
  height: 74rpx;
  border: 1rpx solid rgba(31, 44, 61, 0.16);
  border-radius: 42rpx 54rpx 26rpx 28rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0) 45%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(17, 24, 39, 0.18) 100%),
    var(--vehicle-color);
  box-shadow:
    inset 0 10rpx 16rpx rgba(255, 255, 255, 0.22),
    inset 0 -12rpx 18rpx rgba(17, 24, 39, 0.16),
    0 14rpx 24rpx rgba(31, 44, 61, 0.12);
}

.cartown-vehicle__body::before {
  position: absolute;
  top: 10rpx;
  right: 32rpx;
  left: 28rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.28);
  content: "";
}

.cartown-vehicle--bus .cartown-vehicle__body,
.cartown-vehicle--school-bus .cartown-vehicle__body,
.cartown-vehicle--train .cartown-vehicle__body {
  height: 88rpx;
  border-radius: 24rpx 32rpx 26rpx 24rpx;
}

.cartown-vehicle--truck .cartown-vehicle__body,
.cartown-vehicle--fire-truck .cartown-vehicle__body,
.cartown-vehicle--van .cartown-vehicle__body {
  right: 10rpx;
  left: 10rpx;
  border-radius: 22rpx 34rpx 24rpx 24rpx;
}

.cartown-vehicle--race-car .cartown-vehicle__body {
  height: 58rpx;
  border-radius: 58rpx 72rpx 22rpx 24rpx;
}

.cartown-vehicle--scooter .cartown-vehicle__body {
  right: 48rpx;
  bottom: 46rpx;
  left: 72rpx;
  height: 30rpx;
  border-radius: 999rpx;
}

.cartown-vehicle__roof {
  position: absolute;
  top: -42rpx;
  left: 54rpx;
  width: 120rpx;
  height: 54rpx;
  border: 1rpx solid rgba(31, 44, 61, 0.14);
  border-bottom: 0;
  border-radius: 42rpx 54rpx 8rpx 8rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 56%),
    var(--vehicle-color);
  box-shadow: inset 0 8rpx 12rpx rgba(255, 255, 255, 0.18);
}

.cartown-vehicle--bus .cartown-vehicle__roof,
.cartown-vehicle--school-bus .cartown-vehicle__roof,
.cartown-vehicle--train .cartown-vehicle__roof,
.cartown-vehicle--truck .cartown-vehicle__roof,
.cartown-vehicle--fire-truck .cartown-vehicle__roof,
.cartown-vehicle--van .cartown-vehicle__roof,
.cartown-vehicle--scooter .cartown-vehicle__roof {
  display: none;
}

.cartown-vehicle__window {
  position: absolute;
  top: -28rpx;
  width: 42rpx;
  height: 32rpx;
  border: 1rpx solid rgba(31, 44, 61, 0.12);
  border-radius: 12rpx 16rpx 10rpx 10rpx;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(226, 243, 255, 0.74) 36%, rgba(107, 151, 184, 0.58) 100%);
  box-shadow: inset 0 4rpx 8rpx rgba(255, 255, 255, 0.35);
}

.cartown-vehicle__window--one {
  left: 76rpx;
}

.cartown-vehicle__window--two {
  left: 128rpx;
}

.cartown-vehicle--bus .cartown-vehicle__window,
.cartown-vehicle--school-bus .cartown-vehicle__window,
.cartown-vehicle--train .cartown-vehicle__window {
  top: 16rpx;
  width: 38rpx;
  height: 30rpx;
}

.cartown-vehicle--truck .cartown-vehicle__window,
.cartown-vehicle--fire-truck .cartown-vehicle__window,
.cartown-vehicle--van .cartown-vehicle__window {
  top: 14rpx;
  right: 30rpx;
  left: auto;
  width: 48rpx;
}

.cartown-vehicle--truck .cartown-vehicle__window--two,
.cartown-vehicle--fire-truck .cartown-vehicle__window--two,
.cartown-vehicle--van .cartown-vehicle__window--two,
.cartown-vehicle--scooter .cartown-vehicle__window {
  display: none;
}

.cartown-vehicle__beltline {
  position: absolute;
  right: 30rpx;
  bottom: 24rpx;
  left: 32rpx;
  height: 3rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.42);
}

.cartown-vehicle__headlight,
.cartown-vehicle__tail-light {
  position: absolute;
  bottom: 22rpx;
  width: 14rpx;
  height: 12rpx;
  border-radius: 999rpx;
}

.cartown-vehicle__headlight {
  right: 10rpx;
  background: #fff4b8;
  box-shadow: 6rpx 0 18rpx rgba(255, 228, 130, 0.42);
}

.cartown-vehicle__tail-light {
  left: 10rpx;
  background: #ff7b7b;
}

.cartown-vehicle__grille {
  position: absolute;
  right: 32rpx;
  bottom: 16rpx;
  width: 42rpx;
  height: 5rpx;
  border-radius: 999rpx;
  background: rgba(31, 44, 61, 0.24);
}

.cartown-vehicle__wheel {
  position: absolute;
  bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, #d9e3ee 0 25%, #536477 26% 42%, #172231 43% 100%);
  box-shadow:
    inset 0 3rpx 7rpx rgba(255, 255, 255, 0.24),
    0 6rpx 12rpx rgba(17, 24, 39, 0.18);
}

.cartown-vehicle__wheel-core {
  width: 15rpx;
  height: 15rpx;
  border-radius: 50%;
  background: #f8fafc;
  box-shadow: 0 0 0 4rpx rgba(255, 255, 255, 0.18);
}

.cartown-vehicle__wheel--front {
  right: 54rpx;
}

.cartown-vehicle__wheel--back {
  left: 54rpx;
}

.cartown-vehicle--scooter .cartown-vehicle__wheel {
  bottom: 22rpx;
  width: 42rpx;
  height: 42rpx;
}

.cartown-vehicle--scooter .cartown-vehicle__wheel--front {
  right: 48rpx;
}

.cartown-vehicle--scooter .cartown-vehicle__wheel--back {
  left: 70rpx;
}

.cartown-vehicle__handlebar {
  position: absolute;
  right: 54rpx;
  bottom: 70rpx;
  width: 34rpx;
  height: 62rpx;
  border-top: 5rpx solid #1f2c3d;
  border-right: 5rpx solid #1f2c3d;
  border-radius: 0 18rpx 0 0;
}

.cartown-vehicle__light,
.cartown-vehicle__taxi,
.cartown-vehicle__cross,
.cartown-vehicle__number {
  position: absolute;
  font-weight: 900;
  color: #1f2c3d;
  background: var(--vehicle-accent);
}

.cartown-vehicle__light {
  top: -58rpx;
  left: 50%;
  width: 54rpx;
  height: 22rpx;
  border: 1rpx solid rgba(31, 44, 61, 0.18);
  border-radius: 14rpx;
  background: linear-gradient(90deg, #ef4444 0 48%, #2563eb 52% 100%);
  box-shadow: 0 6rpx 12rpx rgba(31, 44, 61, 0.14);
  transform: translateX(-50%);
}

.cartown-vehicle__taxi {
  top: -64rpx;
  left: 50%;
  padding: 5rpx 13rpx;
  border: 1rpx solid rgba(31, 44, 61, 0.18);
  border-radius: 999rpx;
  font-size: 17rpx;
  letter-spacing: 1rpx;
  box-shadow: 0 6rpx 12rpx rgba(31, 44, 61, 0.12);
  transform: translateX(-50%);
}

.cartown-vehicle__cross {
  top: 12rpx;
  left: 50%;
  width: 48rpx;
  height: 48rpx;
  border-radius: 16rpx;
  color: #ef4444;
  font-size: 40rpx;
  line-height: 44rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.86);
  transform: translateX(-50%);
}

.cartown-vehicle__number {
  top: 14rpx;
  left: 50%;
  width: 42rpx;
  height: 42rpx;
  border: 1rpx solid rgba(31, 44, 61, 0.18);
  border-radius: 50%;
  color: #1f2c3d;
  font-size: 28rpx;
  line-height: 40rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  transform: translateX(-50%);
}
</style>
