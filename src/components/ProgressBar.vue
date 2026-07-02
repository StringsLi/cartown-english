<template>
  <view class="progress-bar">
    <view class="progress-bar__top">
      <text class="progress-bar__label">{{ props.label }}</text>
      <text class="progress-bar__count">{{ props.current }} / {{ props.total }}</text>
    </view>
    <view class="progress-bar__track">
      <view class="progress-bar__fill" :style="{ width: percent + '%' }" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    current: number;
    total: number;
    label?: string;
  }>(),
  {
    label: "进度"
  }
);

const percent = computed(() => {
  if (props.total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((props.current / props.total) * 100));
});
</script>

<style scoped lang="scss">
.progress-bar {
  width: 100%;
}

.progress-bar__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.progress-bar__label,
.progress-bar__count {
  font-size: 24rpx;
  font-weight: 800;
  color: $color-muted;
  letter-spacing: 0;
}

.progress-bar__track {
  width: 100%;
  height: 16rpx;
  overflow: hidden;
  border-radius: $radius-pill;
  background: rgba(221, 240, 255, 0.72);
}

.progress-bar__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, $color-primary 0%, $color-mint 100%);
  transition: width 0.2s ease;
}
</style>
