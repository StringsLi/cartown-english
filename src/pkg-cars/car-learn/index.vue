<template>
  <view class="page car-page">
    <view class="ranking-header">
      <view class="ranking-header__copy">
        <text class="section-kicker">50 REAL CARS</text>
        <text class="page-title">真车声音卡</text>
        <text class="page-subtitle">看大图，听一听，一次认识一辆车。</text>
      </view>
      <view class="ranking-header__actions">
        <button
          class="map-shortcut"
          aria-label="切换到世界地图"
          hover-class="map-shortcut--pressed"
          @tap="goWorld"
        >
          <image
            class="map-shortcut__icon"
            :src="worldMapIcon"
            mode="aspectFit"
          />
        </button>
        <view class="ranking-header__count">
          <text class="ranking-header__current">{{ currentIndex + 1 }}</text>
          <text class="ranking-header__total">/ 50</text>
        </view>
        <text class="ranking-header__learned">已认识 {{ learnedCount }}</text>
      </view>
    </view>

    <view class="vehicle-stage" @tap="playVehicleName">
      <BestSellingCarPhoto :vehicle="vehicle" />
      <view class="vehicle-facts">
        <view class="vehicle-facts__name-row">
          <view class="vehicle-facts__name-copy">
            <text class="vehicle-facts__english">{{ vehicle.englishName }}</text>
            <text class="vehicle-facts__cn">{{ vehicle.brand }} · {{ vehicle.model }}</text>
          </view>
          <view class="vehicle-facts__pronunciation">
            <button class="vehicle-facts__pronounce" :aria-label="`播放 ${vehicle.englishName} 读音`" @tap.stop="playName">▶</button>
            <text>听一听</text>
          </view>
        </view>
        <text class="vehicle-facts__sentence">{{ vehicle.sentence }}</text>
        <view v-if="currentIsLearned" class="vehicle-learned">✓ 已认识</view>
      </view>
    </view>

    <view class="rank-progress" aria-label="车型学习进度">
      <view class="rank-progress__fill" :style="{ width: progressWidth }" />
    </view>

    <BigButton class="learn-listen" label="▶ 听车型名" @tap="playVehicleName" />
    <view class="learn-actions">
      <BigButton label="上一辆" variant="ghost" @tap="previousVehicle" />
      <BigButton label="下一辆" variant="warm" @tap="nextVehicle" />
    </view>

  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BigButton from "@/components/BigButton.vue";
import BestSellingCarPhoto from "@/pkg-cars/BestSellingCarPhoto.vue";
import { bestSellingCars } from "@/pkg-cars/bestSellingCars";
import { playAudio } from "@/services/audioService";
import { completeCartownVehicle, getCartownProgress, saveCartownProgress } from "@/services/cartownProgressService";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const worldMapIcon = "/pkg-cars/static/world-outline.png";
const savedProgress = getCartownProgress();
const currentIndex = ref(Math.min(savedProgress.learnedVehicleIndex, bestSellingCars.length - 1));
const learnedVehicleIds = ref<string[]>(savedProgress.learnedVehicleIds);
const vehicle = computed(() => bestSellingCars[currentIndex.value]);
const progressWidth = computed(() => `${((currentIndex.value + 1) / bestSellingCars.length) * 100}%`);
const learnedCount = computed(() => learnedVehicleIds.value.length);
const currentIsLearned = computed(() => learnedVehicleIds.value.includes(vehicle.value.id));

function playVehicleName() {
  playAudio(vehicle.value.audio, vehicle.value.englishName);
}

function playName() {
  playVehicleName();
}

function goWorld() {
  uni.navigateTo({ url: "/pkg-world/world/index" });
}

function nextVehicle() {
  const result = completeCartownVehicle(vehicle.value.id);
  learnedVehicleIds.value = result.progress.learnedVehicleIds;
  if (result.earned) {
    uni.showToast({ title: "获得 1 颗星", icon: "none" });
  }
  currentIndex.value = (currentIndex.value + 1) % bestSellingCars.length;
  saveCartownProgress({ learnedVehicleIndex: currentIndex.value });
  playVehicleName();
}

function previousVehicle() {
  currentIndex.value = (currentIndex.value - 1 + bestSellingCars.length) % bestSellingCars.length;
  saveCartownProgress({ learnedVehicleIndex: currentIndex.value });
  playVehicleName();
}
</script>

<style scoped lang="scss">
.car-page {
  padding-bottom: 56rpx;
  background: #f7f4ec;
}

.ranking-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  padding: 4rpx 0 24rpx;
}

.ranking-header__copy {
  min-width: 0;
}

.ranking-header__actions {
  display: flex;
  flex: 0 0 92rpx;
  flex-direction: column;
  gap: 10rpx;
}

.ranking-header__learned {
  display: block;
  font-size: 18rpx;
  font-weight: 800;
  color: #3c8066;
  text-align: center;
}

.map-shortcut {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92rpx;
  height: 62rpx;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: 1rpx solid rgba(36, 63, 80, 0.14);
  border-radius: 6rpx;
  background: #ffffff;
  line-height: 1;
  transition: background-color 120ms ease, transform 120ms ease;
}

.map-shortcut::after {
  border: 0;
}

.map-shortcut--pressed {
  background: #edf5f4;
  transform: translateY(1rpx);
}

.map-shortcut__icon {
  width: 62rpx;
  height: 38rpx;
}

.ranking-header__count {
  display: flex;
  align-items: baseline;
  justify-content: center;
  padding: 12rpx 16rpx;
  border: 1rpx solid rgba(36, 63, 80, 0.14);
  border-radius: 6rpx;
  color: #243f50;
  background: #ffffff;
}

.ranking-header__current {
  font-size: 31rpx;
  font-weight: 900;
}

.ranking-header__total {
  margin-left: 4rpx;
  font-size: 19rpx;
  font-weight: 800;
  color: #718087;
}

.vehicle-stage {
  overflow: hidden;
  border: 1rpx solid rgba(36, 63, 80, 0.13);
  border-radius: 8rpx;
  background: #ffffff;
  box-shadow: 0 18rpx 38rpx rgba(38, 58, 70, 0.12);
}

.vehicle-facts {
  padding: 25rpx 26rpx 28rpx;
}

.vehicle-facts__sentence {
  display: block;
}

.vehicle-facts__name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-top: 16rpx;
}

.vehicle-facts__english {
  display: block;
  min-width: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 35rpx;
  font-weight: 700;
  color: #243f50;
  line-height: 1.16;
}

.vehicle-facts__name-copy {
  min-width: 0;
}

.vehicle-facts__cn {
  display: block;
  margin-top: 9rpx;
  font-size: 22rpx;
  color: #718087;
}

.vehicle-facts__pronunciation {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  font-size: 17rpx;
  font-weight: 800;
  color: #718087;
}

.vehicle-facts__pronounce {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  border: 1rpx solid rgba(40, 123, 146, 0.26);
  border-radius: 50%;
  font-size: 26rpx;
  color: #ffffff;
  background: #287b92;
}

.vehicle-facts__sentence {
  margin-top: 18rpx;
  font-size: 23rpx;
  font-weight: 800;
  color: #426d61;
}

.vehicle-learned {
  width: max-content;
  margin-top: 16rpx;
  padding: 9rpx 15rpx;
  border-radius: 24rpx;
  font-size: 19rpx;
  font-weight: 900;
  color: #ffffff;
  background: #3c9b76;
}

.rank-progress {
  width: 100%;
  height: 9rpx;
  margin-top: 21rpx;
  overflow: hidden;
  border-radius: 5rpx;
  background: #dedbd2;
}

.rank-progress__fill {
  height: 100%;
  min-width: 2%;
  border-radius: inherit;
  background: #287b92;
  transition: width 180ms ease;
}

.learn-listen {
  margin-top: 22rpx;
}

.learn-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 14rpx;
}

</style>
