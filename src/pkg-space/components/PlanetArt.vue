<template>
  <view class="planet-art" :class="{ 'planet-art--sun': body.id === 'sun', 'planet-art--saturn': body.id === 'saturn' }">
    <view v-if="body.id === 'saturn'" class="planet-ring planet-ring--back" />
    <view class="planet-sphere" :style="{ backgroundColor: body.color }"><CachedImage :src="body.image" :alt="body.nameCn" mode="aspectFill" /><view class="planet-shade" /></view>
    <view v-if="body.id === 'saturn'" class="planet-ring planet-ring--front" />
  </view>
</template>
<script setup lang="ts">
import CachedImage from "@/components/CachedImage.vue";
import type { SpaceBody } from "@/mock/solarSystem";
defineOptions({ options: { virtualHost: true } });
defineProps<{ body: SpaceBody }>();
</script>
<style scoped>
.planet-art { position: relative; width: 100%; height: 100%; }.planet-sphere { position: absolute; left: 12%; top: 12%; width: 76%; height: 76%; border-radius: 50%; overflow: hidden; box-shadow: 0 0 26rpx rgba(165,193,236,.14); }.planet-sphere :deep(.cached-image) { width: 100%; height: 100%; }.planet-shade { position: absolute; top: 0; right: 0; bottom: 0; left: 0; border-radius: 50%; background: radial-gradient(circle at 30% 28%,rgba(255,255,255,.16),transparent 38%,rgba(0,0,0,.15) 60%,rgba(0,0,0,.8) 100%); pointer-events: none; }.planet-art--sun .planet-sphere { box-shadow: 0 0 35rpx rgba(255,176,60,.5); }.planet-art--sun .planet-shade { background: radial-gradient(circle at 36% 32%,rgba(255,231,141,.35),transparent 65%); }.planet-art--saturn .planet-sphere { left: 22%; top: 22%; width: 56%; height: 56%; }.planet-ring { position: absolute; left: 1%; top: 35%; width: 98%; height: 30%; box-sizing: border-box; border: 9rpx solid rgba(201,180,131,.65); border-radius: 50%; transform: rotate(-24deg); }.planet-ring--back { z-index: 0; }.planet-ring--front { z-index: 2; clip-path: inset(50% 0 0 0); pointer-events: none; }
</style>
