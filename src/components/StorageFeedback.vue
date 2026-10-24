<template>
  <view v-if="unsavedStorageCount" class="storage-feedback" role="alert">
    <text class="storage-feedback__title">记录还没保存成功</text>
    <text class="storage-feedback__note">请保持小程序打开，检查设备存储空间后重新保存这次的改动。</text>
    <button class="storage-feedback__retry" role="button" @tap="retry">重新保存记录</button>
  </view>
</template>
<script setup lang="ts">
import { retryStorageWrites, unsavedStorageCount } from "@/utils/storage";
function retry() {
  const saved = retryStorageWrites();
  uni.showToast({ title: saved ? "记录已保存" : "还没保存成功，请检查存储空间后重试", icon: "none" });
}
</script>
<style scoped>
.storage-feedback { padding:20rpx; margin:18rpx 0; border-radius:20rpx; background:#fff0db; color:#805a31; font-size:24rpx; line-height:1.6; }
.storage-feedback__title, .storage-feedback__note { display:block; font-weight:700; }
.storage-feedback .storage-feedback__note { margin-top:8rpx; font-size:22rpx; font-weight:400; }
.storage-feedback .storage-feedback__retry { display:flex; align-items:center; justify-content:center; min-height:44px; padding:10rpx 20rpx; margin-top:12rpx; border-radius:14rpx; background:#fffdf8; color:#805a31; font-size:24rpx; font-weight:700; }
</style>
