<template>
  <view class="word-chip" :class="{ 'word-chip--active': props.active }">
    <text class="word-chip__word">{{ props.word }}</text>
    <text v-if="props.meaning" class="word-chip__meaning">{{ props.meaning }}</text>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    word: string;
    meaning?: string;
    active?: boolean;
  }>(),
  {
    meaning: "",
    active: false
  }
);
</script>

<style scoped lang="scss">
.word-chip {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  min-height: 62rpx;
  padding: 0 20rpx;
  border: 1rpx solid rgba(38, 61, 89, 0.12);
  border-radius: $radius-pill;
  background: #eef2ef;
  box-shadow: 0 8rpx 18rpx rgba(47, 58, 74, 0.04);
}

.word-chip--active {
  border-color: rgba(196, 138, 40, 0.34);
  background: #f2e5c8;
}

.word-chip__word {
  font-size: 28rpx;
  font-weight: 800;
  color: $color-primary-dark;
  letter-spacing: 0;
}

.word-chip__meaning {
  font-size: 23rpx;
  color: $color-muted;
  letter-spacing: 0;
}
</style>
