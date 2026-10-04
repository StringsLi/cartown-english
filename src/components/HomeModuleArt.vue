<template>
  <view class="module-art" :class="'module-art--' + kind" aria-hidden="true">
    <view v-if="kind === 'learn'" class="letter-art"><text class="letter-art__a">A</text><text class="letter-art__b">B</text></view>
    <view v-else-if="kind === 'book'" class="book-art"><view class="book-art__left" /><view class="book-art__right" /><view class="book-art__spine" /></view>
    <view v-else-if="kind === 'world'" class="globe-art"><view class="globe-art__land globe-art__land--one" /><view class="globe-art__land globe-art__land--two" /><view class="globe-art__meridian" /><view class="globe-art__equator" /></view>
    <view v-else-if="kind === 'logo'" class="badge-art"><text class="badge-art__star">★</text><view class="badge-art__line" /></view>
    <image v-else-if="kind === 'town'" class="town-art" src="/static/ui/home-red-car.png" mode="aspectFit" />
    <view v-else class="planet-art"><view class="planet-art__ring" /><view class="planet-art__sphere" /><view class="planet-art__dot" /></view>
  </view>
</template>
<script setup lang="ts">
defineOptions({ options: { virtualHost: true } });
defineProps<{ kind: "learn" | "book" | "world" | "logo" | "town" | "space" }>();
</script>
<style scoped lang="scss">
.module-art { position: relative; display: flex; justify-content: center; align-items: center; width: 98rpx; height: 86rpx; flex: none; }
.letter-art { position: relative; width: 82rpx; height: 72rpx; }
.letter-art__a,.letter-art__b { position: absolute; display: flex; justify-content: center; align-items: center; width: 52rpx; height: 56rpx; border-radius: 15rpx; font-size: 35rpx; font-weight: 900; line-height: 1; }
.letter-art__a { top: 0; left: 0; color: #7558a0; background: #e2d5f0; transform: rotate(-9deg); }.letter-art__b { right: 0; bottom: 0; color: #ad753e; background: #fae2b8; transform: rotate(8deg); }
.book-art { position: relative; width: 76rpx; height: 58rpx; }.book-art__left,.book-art__right { position: absolute; top: 0; width: 37rpx; height: 58rpx; border: 3rpx solid #c59669; background: #fffaf0; box-shadow: 0 5rpx 0 #e4cbb0; }.book-art__left { left: 0; border-radius: 8rpx 2rpx 2rpx 8rpx; transform: skewY(9deg); }.book-art__right { right: 0; border-radius: 2rpx 8rpx 8rpx 2rpx; transform: skewY(-9deg); }.book-art__spine { position: absolute; top: 8rpx; left: 37rpx; width: 2rpx; height: 45rpx; background: #ae8157; }
.globe-art { position: relative; overflow: hidden; width: 70rpx; height: 70rpx; border-radius: 50%; background: #85bdd0; border: 3rpx solid #77aaba; }.globe-art__land { position: absolute; background: #e0dba2; }.globe-art__land--one { top: 8rpx; left: 3rpx; width: 33rpx; height: 29rpx; border-radius: 35% 60% 30% 40%; transform: rotate(-24deg); }.globe-art__land--two { right: 2rpx; bottom: 8rpx; width: 25rpx; height: 34rpx; border-radius: 40% 30% 50% 65%; }.globe-art__meridian { position: absolute; top: -1rpx; left: 18rpx; width: 28rpx; height: 70rpx; border: 2rpx solid #fff9; border-radius: 50%; }.globe-art__equator { position: absolute; top: 31rpx; left: 0; width: 100%; height: 2rpx; background: #fff8; }
.badge-art { position: relative; display: flex; flex-direction: column; align-items: center; width: 60rpx; height: 72rpx; border: 3rpx solid #97ad85; border-radius: 14rpx 14rpx 28rpx 28rpx; background: #dae5cd; }.badge-art__star { margin-top: 8rpx; font-size: 36rpx; line-height: 1; color: #728b61; }.badge-art__line { width: 24rpx; height: 3rpx; border-radius: 3rpx; margin-top: 6rpx; background: #97ad85; }
.town-art { width: 105rpx; height: 80rpx; }
.planet-art { position: relative; width: 96rpx; height: 76rpx; }.planet-art__sphere { position: absolute; width: 53rpx; height: 53rpx; top: 12rpx; left: 21rpx; border-radius: 50%; background: linear-gradient(145deg,#eed5a0,#b18b5d); box-shadow: inset -8rpx -4rpx 0 #9b794a25; }.planet-art__ring { position: absolute; top: 22rpx; left: 1rpx; width: 93rpx; height: 31rpx; border: 5rpx solid #ae9ac6; border-radius: 50%; transform: rotate(-25deg); }.planet-art__dot { position: absolute; top: 0; right: 1rpx; width: 7rpx; height: 7rpx; border-radius: 50%; background: #ae9ac6; }
</style>
