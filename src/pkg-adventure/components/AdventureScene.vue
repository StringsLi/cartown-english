<template>
  <view class="scene" :class="`scene--${destination}`" aria-hidden="true">
    <view class="scene__sun" /><view class="scene__cloud scene__cloud--one" /><view class="scene__cloud scene__cloud--two" />
    <view class="landmark">
      <view v-if="destination === 'park'" class="park"><view class="tree tree--one" /><view class="tree tree--two" /><view class="bench" /></view>
      <view v-else-if="destination === 'zoo'" class="zoo"><view class="zoo__gate"><text>ZOO</text><image :src="lionArt" mode="aspectFit" /></view><view class="tree tree--zoo" /></view>
      <view v-else class="garden"><view v-for="n in 3" :key="n" class="flower" :class="`flower--${n}`"><view /><text>✿</text></view></view>
    </view>
    <view class="scene__hill" /><view class="scene__road" />
    <view class="van" :class="{ 'van--arrived': arrived }"><view class="van__body" :style="{ backgroundColor: carColors[car] }"><text>ENGLISH</text><view class="van__parcel">♡</view></view><view class="van__cab" :style="{ backgroundColor: carColors[car] }"><view class="van__window" /></view><view class="van__wheel van__wheel--rear" /><view class="van__wheel van__wheel--front" /></view>
  </view>
</template>
<script setup lang="ts">
import type { CarId, DestinationId } from "@/mock/adventures";
withDefaults(defineProps<{ destination?: DestinationId; car?: CarId; arrived?: boolean }>(), { destination: "park", car: "red", arrived: false });
const lionArt = "/pkg-adventure/static/art/animals-lion.png";
const carColors = { red: "#d67b63", blue: "#86afc4", yellow: "#e3ba64" };
</script>
<style scoped lang="scss">
.scene { position: relative; width: 100%; height: 260rpx; overflow: hidden; border-radius: 28rpx; background: #e6eef0; }
.scene--zoo { background: #f8edd4; }.scene--garden { background: #f3e6eb; }
.scene__sun { position: absolute; left: 44rpx; top: 28rpx; width: 42rpx; height: 42rpx; border-radius: 50%; background: #eacb7d; }
.scene__cloud { position: absolute; width: 64rpx; height: 18rpx; border-radius: 25rpx; background: #ffffffa1; }.scene__cloud::before { content: ""; position: absolute; left: 12rpx; bottom: 3rpx; width: 32rpx; height: 26rpx; border-radius: 50%; background: inherit; }.scene__cloud--one { top: 50rpx; left: 135rpx; }.scene__cloud--two { top: 32rpx; right: 45rpx; }
.scene__hill { position: absolute; left: -10%; bottom: 48rpx; width: 120%; height: 64rpx; border-radius: 50% 50% 0 0; background: #b9caaa; }.scene__road { position: absolute; bottom: 0; width: 100%; height: 60rpx; background: #e1d5c2; }.scene__road::after { content: ""; position: absolute; top: 30rpx; width: 100%; height: 3rpx; background: repeating-linear-gradient(90deg,transparent 0,transparent 26rpx,#fff9e8 26rpx,#fff9e8 50rpx); }
.landmark { position: absolute; z-index: 1; right: 48rpx; bottom: 71rpx; width: 170rpx; height: 116rpx; }
.tree { position: absolute; bottom: 0; width: 12rpx; height: 48rpx; background: #a88b6b; }.tree::before { content: ""; position: absolute; bottom: 20rpx; left: -27rpx; width: 66rpx; height: 75rpx; border-radius: 45% 45% 40% 40%; background: #92ad86; }.tree--one { left: 15rpx; }.tree--two { right: 10rpx; transform: scale(.85); }.bench { position: absolute; bottom: 1rpx; left: 56rpx; width: 65rpx; height: 30rpx; border-top: 12rpx solid #b89976; border-bottom: 8rpx solid #b89976; }.bench::after { content: ""; position: absolute; left: 5rpx; bottom: -14rpx; width: 56rpx; height: 12rpx; border-left: 7rpx solid #94795e; border-right: 7rpx solid #94795e; }
.zoo__gate { position: absolute; bottom: 0; width: 119rpx; height: 98rpx; border: 12rpx solid #d6b985; border-radius: 55rpx 55rpx 0 0; background: #fff5df; text-align: center; }.zoo__gate text { display: block; margin-top: 1rpx; font-size: 18rpx; font-weight: 900; color: #92754e; }.zoo__gate image { position: absolute; left: 14rpx; bottom: -8rpx; width: 68rpx; height: 56rpx; }.tree--zoo { right: 0; transform: scale(.7); }
.flower { position: absolute; bottom: 0; width: 34rpx; height: 80rpx; }.flower view { position: absolute; bottom: 0; left: 18rpx; height: 62rpx; width: 5rpx; background: #95ae84; }.flower text { position: absolute; top: -9rpx; left: -7rpx; color: #d38e9e; font-size: 67rpx; line-height: 1; }.flower--1 { left: 5rpx; transform: scale(.85); }.flower--2 { left: 58rpx; }.flower--3 { left: 117rpx; transform: scale(.75); }.flower--2 text { color: #dbb965; }
.van { position: absolute; z-index: 2; bottom: 33rpx; left: 42rpx; width: 186rpx; height: 90rpx; transition: left .5s ease; }.van--arrived { left: calc(100% - 225rpx); }.van__body { position: absolute; left: 0; bottom: 12rpx; width: 123rpx; height: 80rpx; border-radius: 14rpx 14rpx 4rpx 8rpx; }.van__body text { display: block; margin-top: 13rpx; margin-left: 13rpx; font-size: 12rpx; font-weight: 800; letter-spacing: 1rpx; color: #fff5e9; }.van__parcel { width: 33rpx; height: 27rpx; margin: 10rpx 0 0 42rpx; border-radius: 5rpx; background: #ead0a1; font-size: 22rpx; text-align: center; color: #b48f58; }.van__cab { position: absolute; left: 118rpx; bottom: 12rpx; width: 66rpx; height: 62rpx; border-radius: 4rpx 26rpx 10rpx 0; }.van__window { position: absolute; top: 9rpx; left: 10rpx; width: 34rpx; height: 25rpx; border-radius: 4rpx 15rpx 3rpx 3rpx; background: #d4e6ea; }.van__wheel { position: absolute; bottom: 0; width: 33rpx; height: 33rpx; border: 8rpx solid #4f6065; border-radius: 50%; background: #dcd6c7; }.van__wheel--rear { left: 24rpx; }.van__wheel--front { right: 17rpx; }
@media (prefers-reduced-motion: reduce) { .van { transition: none; } }
</style>
