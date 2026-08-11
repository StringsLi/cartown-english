<template>
  <view class="car-photo">
    <image class="car-photo__image" :src="vehicle.image" mode="aspectFill" :aria-label="`${vehicle.brand}${vehicle.model}真实车型照片`" />
    <view class="car-photo__shade" />
    <view class="car-photo__rank">
      <text class="car-photo__rank-label">2025 TOP</text>
      <text class="car-photo__rank-value">{{ String(vehicle.rank).padStart(2, "0") }}</text>
    </view>
    <view class="car-photo__caption">
      <text class="car-photo__brand">{{ vehicle.brand }}</text>
      <text class="car-photo__model">{{ vehicle.model }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { BestSellingCar } from "@/mock/bestSellingCars";

defineProps<{
  vehicle: BestSellingCar;
}>();
</script>

<style scoped lang="scss">
.car-photo {
  position: relative;
  width: 100%;
  height: 430rpx;
  overflow: hidden;
  background: #dfe5e7;
}

.car-photo__image,
.car-photo__shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.car-photo__shade {
  background: linear-gradient(180deg, rgba(17, 35, 43, 0.08) 38%, rgba(17, 35, 43, 0.82) 100%);
}

.car-photo__rank {
  position: absolute;
  top: 22rpx;
  left: 22rpx;
  display: flex;
  align-items: center;
  min-height: 56rpx;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.54);
  border-radius: 6rpx;
  color: #ffffff;
  background: rgba(24, 49, 59, 0.82);
  backdrop-filter: blur(10rpx);
}

.car-photo__rank-label,
.car-photo__rank-value {
  padding: 0 14rpx;
  font-weight: 900;
}

.car-photo__rank-label {
  font-size: 17rpx;
  letter-spacing: 2rpx;
}

.car-photo__rank-value {
  display: flex;
  align-items: center;
  align-self: stretch;
  font-size: 25rpx;
  color: #243f50;
  background: #ffd96e;
}

.car-photo__caption {
  position: absolute;
  right: 24rpx;
  bottom: 22rpx;
  left: 24rpx;
}

.car-photo__brand,
.car-photo__model {
  display: block;
  color: #ffffff;
}

.car-photo__brand {
  font-size: 19rpx;
  font-weight: 800;
}

.car-photo__model {
  margin-top: 4rpx;
  font-size: 43rpx;
  font-weight: 900;
  line-height: 1.08;
}
</style>
