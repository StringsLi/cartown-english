<template>
  <view class="page legacy-entry"><text class="page-title">准备好一起出发</text><text class="legacy-entry__note">正在打开这个小世界。若加载稍慢，可以再试一次。</text><button class="primary-button" @tap="open">继续打开 ›</button><button class="legacy-entry__home" @tap="goHome">回到首页</button></view>
</template>
<script setup lang="ts">
import { useLegacyRoute } from "@/composables/useLegacyRoute";
const { open, goHome } = useLegacyRoute("/pkg-cars/car-traffic/index");
</script>
<style scoped>.legacy-entry { padding-top:80rpx; }.legacy-entry__note { display:block; margin:24rpx 0 40rpx; color:#8b8175; line-height:1.7; }.legacy-entry__home { min-height:44px; margin-top:20rpx; color:#527769; }</style>
