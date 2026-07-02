<template>
  <view class="cartown-vehicle" :class="`cartown-vehicle--${props.kind}`" :style="vehicleStyle">
    <view class="cartown-vehicle__shadow" />
    <view class="cartown-vehicle__body">
      <view class="cartown-vehicle__roof" />
      <view class="cartown-vehicle__window cartown-vehicle__window--one" />
      <view class="cartown-vehicle__window cartown-vehicle__window--two" />
      <view v-if="isService" class="cartown-vehicle__light" />
      <view v-if="props.kind === 'taxi'" class="cartown-vehicle__taxi">TAXI</view>
      <view v-if="props.kind === 'ambulance'" class="cartown-vehicle__cross">+</view>
      <view v-if="props.kind === 'race-car'" class="cartown-vehicle__number">1</view>
    </view>
    <view class="cartown-vehicle__wheel cartown-vehicle__wheel--front" />
    <view class="cartown-vehicle__wheel cartown-vehicle__wheel--back" />
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
    accent: "#FFD66B",
    kind: "car"
  }
);

const vehicleStyle = computed(() => ({
  "--vehicle-color": props.color,
  "--vehicle-accent": props.accent
}));

const isService = computed(() => ["police-car", "ambulance", "fire-truck"].includes(props.kind));
</script>

<style scoped lang="scss">
.cartown-vehicle {
  position: relative;
  width: 100%;
  min-width: 160rpx;
  height: 150rpx;
}

.cartown-vehicle__shadow {
  position: absolute;
  right: 18rpx;
  bottom: 14rpx;
  left: 18rpx;
  height: 20rpx;
  border-radius: $radius-pill;
  background: rgba(47, 58, 74, 0.12);
}

.cartown-vehicle__body {
  position: absolute;
  right: 18rpx;
  bottom: 40rpx;
  left: 18rpx;
  height: 76rpx;
  border: 6rpx solid $color-primary-dark;
  border-radius: 38rpx 42rpx 28rpx 28rpx;
  background: var(--vehicle-color);
}

.cartown-vehicle--bus .cartown-vehicle__body,
.cartown-vehicle--school-bus .cartown-vehicle__body,
.cartown-vehicle--train .cartown-vehicle__body {
  height: 86rpx;
  border-radius: 30rpx;
}

.cartown-vehicle--truck .cartown-vehicle__body,
.cartown-vehicle--fire-truck .cartown-vehicle__body,
.cartown-vehicle--van .cartown-vehicle__body {
  right: 8rpx;
  left: 8rpx;
  border-radius: 26rpx;
}

.cartown-vehicle--race-car .cartown-vehicle__body {
  height: 64rpx;
  border-radius: 44rpx 54rpx 24rpx 24rpx;
}

.cartown-vehicle__roof {
  position: absolute;
  top: -44rpx;
  left: 54rpx;
  width: 112rpx;
  height: 56rpx;
  border: 6rpx solid $color-primary-dark;
  border-bottom: 0;
  border-radius: 36rpx 36rpx 0 0;
  background: var(--vehicle-color);
}

.cartown-vehicle--bus .cartown-vehicle__roof,
.cartown-vehicle--school-bus .cartown-vehicle__roof,
.cartown-vehicle--train .cartown-vehicle__roof,
.cartown-vehicle--truck .cartown-vehicle__roof,
.cartown-vehicle--fire-truck .cartown-vehicle__roof,
.cartown-vehicle--van .cartown-vehicle__roof {
  display: none;
}

.cartown-vehicle__window {
  position: absolute;
  top: -26rpx;
  width: 44rpx;
  height: 34rpx;
  border: 5rpx solid $color-primary-dark;
  border-radius: 14rpx;
  background: #dff4ff;
}

.cartown-vehicle__window--one {
  left: 74rpx;
}

.cartown-vehicle__window--two {
  left: 126rpx;
}

.cartown-vehicle--bus .cartown-vehicle__window,
.cartown-vehicle--school-bus .cartown-vehicle__window,
.cartown-vehicle--train .cartown-vehicle__window {
  top: 14rpx;
}

.cartown-vehicle--truck .cartown-vehicle__window,
.cartown-vehicle--fire-truck .cartown-vehicle__window,
.cartown-vehicle--van .cartown-vehicle__window {
  top: 12rpx;
  right: 28rpx;
  left: auto;
}

.cartown-vehicle--truck .cartown-vehicle__window--two,
.cartown-vehicle--fire-truck .cartown-vehicle__window--two,
.cartown-vehicle--van .cartown-vehicle__window--two {
  display: none;
}

.cartown-vehicle__wheel {
  position: absolute;
  bottom: 20rpx;
  width: 44rpx;
  height: 44rpx;
  border: 8rpx solid $color-primary-dark;
  border-radius: 50%;
  background: #ffffff;
}

.cartown-vehicle__wheel--front {
  right: 54rpx;
}

.cartown-vehicle__wheel--back {
  left: 54rpx;
}

.cartown-vehicle__light,
.cartown-vehicle__taxi,
.cartown-vehicle__cross,
.cartown-vehicle__number {
  position: absolute;
  font-weight: 900;
  color: $color-primary-dark;
  background: var(--vehicle-accent);
}

.cartown-vehicle__light {
  top: -68rpx;
  left: 50%;
  width: 58rpx;
  height: 30rpx;
  border: 5rpx solid $color-primary-dark;
  border-radius: 14rpx;
  transform: translateX(-50%);
}

.cartown-vehicle__taxi {
  top: -70rpx;
  left: 50%;
  padding: 6rpx 12rpx;
  border: 4rpx solid $color-primary-dark;
  border-radius: 12rpx;
  font-size: 18rpx;
  transform: translateX(-50%);
}

.cartown-vehicle__cross {
  top: 8rpx;
  left: 50%;
  width: 54rpx;
  height: 54rpx;
  border-radius: 14rpx;
  font-size: 46rpx;
  line-height: 48rpx;
  text-align: center;
  transform: translateX(-50%);
}

.cartown-vehicle__number {
  top: 16rpx;
  left: 50%;
  width: 46rpx;
  height: 46rpx;
  border: 4rpx solid $color-primary-dark;
  border-radius: 50%;
  font-size: 30rpx;
  line-height: 38rpx;
  text-align: center;
  transform: translateX(-50%);
}
</style>
