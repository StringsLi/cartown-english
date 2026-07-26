<template>
  <view class="vehicle-story-art" :class="[`vehicle-story-art--${props.storyId}`, `vehicle-story-art--page-${safePage}`]">
    <view v-if="props.storyId === 'red-car'" class="vehicle-story-art__red-car" :class="`vehicle-story-art__cell--${safePage}`" />
    <template v-else>
      <view class="vehicle-story-art__sun" />
      <view class="vehicle-story-art__cloud vehicle-story-art__cloud--one" />
      <view class="vehicle-story-art__cloud vehicle-story-art__cloud--two" />
      <view class="vehicle-story-art__hill" />
      <view class="vehicle-story-art__road" />
      <view v-if="props.storyId === 'digger'" class="story-context story-context--digger">
        <view v-if="safePage === 2" class="story-context__hole" />
        <view v-if="safePage === 3" class="story-context__rocks"><view /><view /><view /></view>
        <view v-if="safePage === 4" class="story-context__flat-ground" />
        <view v-if="safePage === 5" class="story-context__park"><view /><view /><view /></view>
      </view>
      <view v-if="props.storyId === 'fire-truck'" class="story-context story-context--fire-truck">
        <view v-if="safePage === 2" class="story-context__alarm"><view /><view /></view>
        <view v-if="safePage === 4" class="story-context__ladder"><view v-for="step in 6" :key="step" /></view>
        <view v-if="safePage === 5" class="story-context__cat"><view /><view /></view>
      </view>
      <view v-if="props.storyId === 'city-bus'" class="story-context story-context--city-bus">
        <view v-if="safePage === 2" class="story-context__school"><view /><view /><view /></view>
        <view v-if="safePage === 3" class="story-context__bridge"><view /><view /><view /></view>
        <view v-if="safePage === 4" class="story-context__home"><view /><view /></view>
        <view v-if="safePage === 5" class="story-context__moon"><view /><view /><view /></view>
      </view>
      <view class="vehicle-story-art__machine" :class="`vehicle-story-art__machine--${props.storyId}`" />
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { VehicleStoryId } from "@/types/book";

const props = withDefaults(
  defineProps<{
    storyId: VehicleStoryId;
    pageIndex?: number;
  }>(),
  {
    pageIndex: 0
  }
);

const safePage = computed(() => Math.min(Math.max(Math.round(props.pageIndex), 0), 5));
</script>

<style scoped lang="scss">
.vehicle-story-art {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 180rpx;
  overflow: hidden;
  background: #edf1e8;
}

.vehicle-story-art__red-car {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  padding-top: 100%;
  background-image: url("/static/books/vehicles/red-car-storyboard.png");
  background-repeat: no-repeat;
  background-size: 300% 200%;
  transform: translate(-50%, -50%);
}

.vehicle-story-art__cell--0 { background-position: 0 0; }
.vehicle-story-art__cell--1 { background-position: 50% 0; }
.vehicle-story-art__cell--2 { background-position: 100% 0; }
.vehicle-story-art__cell--3 { background-position: 0 100%; }
.vehicle-story-art__cell--4 { background-position: 50% 100%; }
.vehicle-story-art__cell--5 { background-position: 100% 100%; }

.vehicle-story-art__machine {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  width: 76%;
  padding-top: 76%;
  border-radius: $radius-small;
  background-image: url("/static/ui/vehicle-atlas-premium.png");
  background-repeat: no-repeat;
  background-size: 300% 200%;
  box-shadow: 0 14rpx 30rpx rgba(38, 61, 89, 0.1);
  transform: translate(-50%, -49%);
}

.vehicle-story-art__machine--fire-truck { background-position: 50% 0; }
.vehicle-story-art__machine--digger { background-position: 100% 0; }
.vehicle-story-art__machine--city-bus { background-position: 0 100%; }

.vehicle-story-art__sun {
  position: absolute;
  top: 10%;
  right: 11%;
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  background: #dfa62d;
  box-shadow: 0 0 0 16rpx rgba(223, 166, 45, 0.11);
}

.vehicle-story-art__cloud {
  position: absolute;
  z-index: 1;
  width: 104rpx;
  height: 34rpx;
  border-radius: $radius-pill;
  background: rgba(255, 253, 249, 0.86);
}

.vehicle-story-art__cloud::before,
.vehicle-story-art__cloud::after {
  position: absolute;
  bottom: 0;
  border-radius: 50%;
  background: inherit;
  content: "";
}

.vehicle-story-art__cloud::before {
  left: 18rpx;
  width: 48rpx;
  height: 48rpx;
}

.vehicle-story-art__cloud::after {
  right: 16rpx;
  width: 38rpx;
  height: 38rpx;
}

.vehicle-story-art__cloud--one { top: 16%; left: 8%; }
.vehicle-story-art__cloud--two { top: 28%; right: 4%; transform: scale(0.72); }

.vehicle-story-art__hill {
  position: absolute;
  right: -12%;
  bottom: 13%;
  left: -12%;
  height: 34%;
  border-radius: 50% 50% 0 0;
  background: #a8b89a;
}

.vehicle-story-art__road {
  position: absolute;
  right: -8%;
  bottom: -7%;
  left: -8%;
  height: 35%;
  border-top: 8rpx solid rgba(255, 255, 255, 0.55);
  background: #c8b9a7;
  transform: skewY(-3deg);
}

.vehicle-story-art--digger { background: #f3ead2; }
.vehicle-story-art--fire-truck { background: #dce8e8; }
.vehicle-story-art--city-bus { background: #e5eadc; }
.vehicle-story-art--page-3 .vehicle-story-art__hill { background: #c6aa7d; }
.vehicle-story-art--page-4 { background: #d8e1e2; }
.vehicle-story-art--page-4 .vehicle-story-art__sun { opacity: 0.28; }
.vehicle-story-art--page-5 { background: #eed6bb; }
.vehicle-story-art--page-5 .vehicle-story-art__sun { top: 18%; background: #c75f3b; }

.story-context,
.story-context > view {
  position: absolute;
}

.story-context {
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.story-context__hole {
  right: 8%;
  bottom: 8%;
  width: 42%;
  height: 17%;
  border: 10rpx solid #b58a5e;
  border-radius: 50%;
  background: #6f4e37;
  box-shadow: inset 0 12rpx 18rpx rgba(47, 31, 20, 0.28);
}

.story-context__rocks {
  right: 5%;
  bottom: 8%;
  width: 36%;
  height: 25%;
}

.story-context__rocks > view {
  position: absolute;
  bottom: 0;
  width: 38%;
  height: 52%;
  border-radius: 48% 52% 42% 58%;
  background: #7f8584;
  box-shadow: inset 8rpx 8rpx 0 rgba(255, 255, 255, 0.2);
}

.story-context__rocks > view:nth-child(1) { left: 0; }
.story-context__rocks > view:nth-child(2) { left: 30%; bottom: 17%; transform: scale(0.8); }
.story-context__rocks > view:nth-child(3) { right: 0; transform: scale(0.72); }

.story-context__flat-ground {
  right: 0;
  bottom: 0;
  left: 0;
  height: 18%;
  border-top: 6rpx dashed rgba(255, 255, 255, 0.65);
  background: #cbb99c;
}

.story-context__park {
  right: 4%;
  bottom: 10%;
  width: 36%;
  height: 43%;
}

.story-context__park > view:nth-child(1),
.story-context__park > view:nth-child(2) {
  position: absolute;
  bottom: 0;
  width: 18rpx;
  height: 70%;
  border-radius: 8rpx;
  background: #8c6746;
}

.story-context__park > view:nth-child(1) { left: 12%; }
.story-context__park > view:nth-child(2) { right: 14%; height: 58%; }
.story-context__park > view:nth-child(1)::before,
.story-context__park > view:nth-child(2)::before {
  position: absolute;
  top: -28rpx;
  left: 50%;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #6f9674;
  content: "";
  transform: translateX(-50%);
}

.story-context__park > view:nth-child(3) {
  position: absolute;
  right: 25%;
  bottom: 0;
  width: 86rpx;
  height: 62rpx;
  border: 7rpx solid #c96f50;
  border-top: 0;
  transform: skewX(-18deg);
}

.story-context__alarm {
  top: 8%;
  left: 50%;
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  background: rgba(187, 63, 57, 0.28);
  transform: translateX(-50%);
}

.story-context__alarm > view {
  position: absolute;
  inset: 16rpx;
  border: 6rpx solid #bb3f39;
  border-radius: 50%;
}

.story-context__alarm > view:nth-child(2) { inset: -18rpx; opacity: 0.45; }

.story-context__ladder {
  top: 7%;
  right: 7%;
  width: 48%;
  height: 18rpx;
  border-top: 8rpx solid #b9b5aa;
  border-bottom: 8rpx solid #b9b5aa;
  transform: rotate(-32deg);
  transform-origin: right center;
}

.story-context__ladder > view {
  display: inline-block;
  width: 5rpx;
  height: 32rpx;
  margin: -8rpx 13rpx 0;
  background: #8d8a83;
}

.story-context__cat {
  top: 17%;
  right: 8%;
  width: 72rpx;
  height: 66rpx;
  border-radius: 48% 48% 44% 44%;
  background: #535454;
  box-shadow: 0 0 0 14rpx rgba(255, 255, 255, 0.72);
}

.story-context__cat::before,
.story-context__cat::after {
  position: absolute;
  top: -18rpx;
  width: 32rpx;
  height: 34rpx;
  background: #535454;
  content: "";
  transform: rotate(45deg);
}

.story-context__cat::before { left: 3rpx; }
.story-context__cat::after { right: 3rpx; }

.story-context__cat > view {
  position: absolute;
  top: 28rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #e1b948;
}

.story-context__cat > view:first-child { left: 20rpx; }
.story-context__cat > view:last-child { right: 20rpx; }

.story-context__school,
.story-context__home {
  right: 4%;
  bottom: 18%;
  width: 34%;
  height: 32%;
  border-radius: 8rpx 8rpx 0 0;
  background: #e9ddc7;
  box-shadow: inset 0 0 0 5rpx rgba(97, 87, 73, 0.12);
}

.story-context__school::before,
.story-context__home::before {
  position: absolute;
  top: -34%;
  right: -8%;
  left: -8%;
  height: 40%;
  background: #a85d48;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  content: "";
}

.story-context__school > view,
.story-context__home > view {
  position: absolute;
  bottom: 14%;
  width: 24%;
  height: 42%;
  border-radius: 4rpx;
  background: #7ca0aa;
}

.story-context__school > view:nth-child(1), .story-context__home > view:nth-child(1) { left: 9%; }
.story-context__school > view:nth-child(2), .story-context__home > view:nth-child(2) { right: 9%; }
.story-context__school > view:nth-child(3) { left: 38%; height: 58%; background: #81664d; }

.story-context__bridge {
  right: -5%;
  bottom: 8%;
  left: -5%;
  height: 26%;
  border-top: 18rpx solid #9e876c;
  border-radius: 50% 50% 0 0;
}

.story-context__bridge > view {
  position: absolute;
  bottom: 0;
  width: 12rpx;
  height: 85%;
  background: #87715b;
}

.story-context__bridge > view:nth-child(1) { left: 22%; }
.story-context__bridge > view:nth-child(2) { left: 50%; }
.story-context__bridge > view:nth-child(3) { right: 22%; }

.story-context__moon {
  top: 9%;
  right: 10%;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #f2d27b;
  box-shadow: 0 0 0 14rpx rgba(242, 210, 123, 0.12);
}

.story-context__moon::after {
  position: absolute;
  top: -6rpx;
  left: -13rpx;
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  background: #465b68;
  content: "";
}

.story-context__moon > view {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #fff9d8;
}

.story-context__moon > view:nth-child(1) { left: -80rpx; top: 10rpx; }
.story-context__moon > view:nth-child(2) { left: -34rpx; top: 78rpx; }
.story-context__moon > view:nth-child(3) { right: -24rpx; top: 94rpx; }

.vehicle-story-art--city-bus.vehicle-story-art--page-5 { background: #465b68; }
.vehicle-story-art--city-bus.vehicle-story-art--page-5 .vehicle-story-art__sun,
.vehicle-story-art--city-bus.vehicle-story-art--page-5 .vehicle-story-art__cloud { display: none; }
</style>
