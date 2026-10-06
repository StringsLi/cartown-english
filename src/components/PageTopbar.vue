<template>
  <view class="page-topbar">
    <button role="button" class="page-topbar__back" :aria-label="`返回${backLabel}`" @tap="backTo(props.fallback)"><text class="native-pagetopbar-text">‹</text>{{ backLabel }}</button>
    <text class="page-topbar__section native-pagetopbar-text">{{ section }}</text>
    <button role="button" class="page-topbar__home" aria-label="返回首页" @tap="navigate({ url: '/pages/index/index' }, 'reLaunch')">⌂</button>
  </view>
</template>
<script setup lang="ts">
import { backTo, navigate } from "@/services/navigationService";
const props = withDefaults(defineProps<{ section: string; fallback?: string; backLabel?: string }>(), { fallback: "/pages/index/index", backLabel: "上一页" });
</script>
<style scoped lang="scss">
.page-topbar { display: flex; align-items: center; gap: 16rpx; margin: 0 0 24rpx; padding-bottom: 14rpx; border-bottom: 1rpx solid $color-line; }
.page-topbar__back { display: flex; align-items: center; gap: 10rpx; min-height: 44px; padding: 0 14rpx 0 0; font-size: 24rpx; font-weight: 700; color: $color-primary; }
.page-topbar__back .native-pagetopbar-text { font-size: 42rpx; line-height: 1; }
.page-topbar__section { flex: 1; text-align: center; font-size: 20rpx; letter-spacing: 2rpx; color: $color-muted; }
.page-topbar__home { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 24rpx; border: 1rpx solid $color-line; background: #fffdf9; font-size: 34rpx; color: $color-primary; }
</style>
