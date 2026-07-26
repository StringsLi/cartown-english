<template>
  <view class="page garage-page">
    <view class="garage-hero soft-card">
      <view>
        <text class="section-kicker">Premium Garage</text>
        <text class="page-title">奖励车库</text>
        <text class="page-subtitle">每 2 颗星星解锁一辆收藏车。</text>
      </view>
      <view class="garage-hero__stars">
        <text class="garage-hero__value">{{ progress.stars }}</text>
        <text class="garage-hero__label">stars</text>
      </view>
    </view>

    <view class="garage-grid">
      <view v-for="(vehicle, index) in vehicles" :key="vehicle.id" class="garage-card soft-card" :class="{ 'garage-card--locked': index >= unlockedCount }" @tap="playVehicle(vehicle, index)">
        <view v-if="index >= unlockedCount" class="garage-card__lock">★ {{ index * 2 }}</view>
        <CartownVehicle :color="vehicle.color" :accent="vehicle.accent" :kind="vehicle.kind" />
        <text class="garage-card__word">{{ vehicle.word }}</text>
        <text class="garage-card__zh">{{ vehicle.zh }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import CartownVehicle from "@/components/CartownVehicle.vue";
import { vehicles, type Vehicle } from "@/mock/cartown";
import { speakEnglish } from "@/services/audioService";
import { getCartownProgress } from "@/services/cartownProgressService";

const progress = ref(getCartownProgress());
const unlockedCount = computed(() => Math.max(1, Math.min(vehicles.length, Math.floor(progress.value.stars / 2) + 1)));

function playVehicle(vehicle: Vehicle, index: number) {
  if (index >= unlockedCount.value) {
    uni.showToast({ title: "多收集星星再解锁", icon: "none" });
    return;
  }

  speakEnglish(`${vehicle.word}. ${vehicle.sentence}`);
}
</script>

<style scoped lang="scss">
.garage-page {
  padding-bottom: 56rpx;
}

.garage-hero {
  display: flex;
  justify-content: space-between;
  gap: 28rpx;
  padding: 32rpx;
  background:
    radial-gradient(circle at 92% 20%, rgba(255, 214, 107, 0.34), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 58%, #fff0dd 100%);
}

.garage-hero__stars {
  flex: 0 0 auto;
  width: 126rpx;
  min-height: 126rpx;
  padding: 22rpx 8rpx;
  border-radius: 34rpx;
  text-align: center;
  background: rgba(255, 214, 107, 0.72);
}

.garage-hero__value,
.garage-hero__label {
  display: block;
  color: $color-primary-dark;
}

.garage-hero__value {
  font-size: 42rpx;
  font-weight: 900;
}

.garage-hero__label {
  margin-top: 4rpx;
  font-size: 22rpx;
  font-weight: 900;
}

.garage-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 28rpx;
}

.garage-card {
  position: relative;
  min-height: 280rpx;
  padding: 18rpx 12rpx;
  text-align: center;
  overflow: hidden;
}

.garage-card--locked {
  filter: grayscale(1);
  opacity: 0.62;
}

.garage-card__lock {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  font-weight: 900;
  color: $color-primary-dark;
  background: rgba(255, 255, 255, 0.56);
}

.garage-card__word {
  display: block;
  margin-top: 8rpx;
  font-size: 28rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.garage-card__zh {
  display: block;
  margin-top: 6rpx;
  font-size: 23rpx;
  color: $color-muted;
}
</style>
