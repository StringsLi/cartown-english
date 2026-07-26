<template>
  <view class="page car-page">
    <view class="car-hero soft-card">
      <view>
        <text class="section-kicker">Learn Cars</text>
        <text class="page-title">认识车辆</text>
        <text class="page-subtitle">点车辆图标，听英文。来自 CarTown English 的车辆词卡。</text>
      </view>
      <text class="car-hero__count">{{ currentIndex + 1 }} / {{ vehicles.length }}</text>
    </view>

    <view class="learn-card soft-card" @tap="playVehicle">
      <CartownVehicle :color="vehicle.color" :accent="vehicle.accent" :kind="vehicle.kind" />
      <text class="learn-card__word">{{ vehicle.word }}</text>
      <text class="learn-card__zh">{{ vehicle.zh }}</text>
      <text class="learn-card__sentence">{{ vehicle.sentence }}</text>
    </view>

    <view class="learn-actions">
      <BigButton label="听一听" @tap="playVehicle" />
      <BigButton label="下一辆" variant="warm" @tap="nextVehicle" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BigButton from "@/components/BigButton.vue";
import CartownVehicle from "@/components/CartownVehicle.vue";
import { vehicles } from "@/mock/cartown";
import { speakEnglish } from "@/services/audioService";
import { addCartownStar, getCartownProgress, saveCartownProgress } from "@/services/cartownProgressService";

const currentIndex = ref(Math.min(getCartownProgress().learnedVehicleIndex, vehicles.length - 1));
const vehicle = computed(() => vehicles[currentIndex.value]);

function playVehicle() {
  speakEnglish(`${vehicle.value.word}. ${vehicle.value.sentence}`);
}

function nextVehicle() {
  currentIndex.value = (currentIndex.value + 1) % vehicles.length;
  saveCartownProgress({ learnedVehicleIndex: currentIndex.value });
  addCartownStar();
  playVehicle();
}
</script>

<style scoped lang="scss">
.car-page {
  padding-bottom: 56rpx;
}

.car-hero {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 32rpx;
  background:
    radial-gradient(circle at 92% 20%, rgba(255, 214, 107, 0.34), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 58%, #fff0dd 100%);
}

.car-hero__count {
  flex: 0 0 auto;
  align-self: flex-start;
  padding: 12rpx 18rpx;
  border-radius: $radius-pill;
  font-size: 23rpx;
  font-weight: 900;
  color: $color-primary-dark;
  background: rgba(255, 214, 107, 0.72);
}

.learn-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 28rpx;
  padding: 38rpx 30rpx;
  text-align: center;
}

.learn-card .cartown-vehicle {
  max-width: 560rpx;
  height: 250rpx;
}

.learn-card__word {
  display: block;
  margin-top: 18rpx;
  font-size: 64rpx;
  font-weight: 900;
  color: $color-primary-dark;
  line-height: 1.05;
}

.learn-card__zh {
  display: block;
  margin-top: 12rpx;
  font-size: 32rpx;
  font-weight: 900;
  color: $color-muted;
}

.learn-card__sentence {
  display: block;
  margin-top: 14rpx;
  font-size: 32rpx;
  font-weight: 900;
  color: $color-primary;
}

.learn-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 28rpx;
}
</style>
