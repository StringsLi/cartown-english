<template><view class="page"><text class="page-title">英文演说小书架</text><text class="page-subtitle">十篇一分钟示范，听一听，再讲自己的故事。</text><button role="button" class="voice-back" @tap="open">进入小小演说家 ›</button></view></template>
<script setup lang="ts">
import { navigate } from '@/services/navigationService';
function open() { navigate({url:'/pkg-speech/index/index?lang=en'},'redirectTo'); }
</script>
<style scoped>.voice-back { min-height:44px; padding:20rpx; margin-top:30rpx; font-size:28rpx; color:#45694f; background:#e9eee1; border-radius:24rpx; }</style>
