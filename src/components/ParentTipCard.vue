<template>
  <view class="parent-tip soft-card" :class="{ 'parent-tip--compact': props.compact }">
    <text class="parent-tip__title">{{ props.title }}</text>
    <view class="parent-tip__questions">
      <view v-for="question in props.questions" :key="question.en" class="parent-tip__question">
        <text class="parent-tip__en">{{ question.en }}</text>
        <text class="parent-tip__cn">{{ question.cn }}</text>
      </view>
    </view>
    <text v-if="props.activity" class="parent-tip__activity">{{ props.activity }}</text>
  </view>
</template>

<script setup lang="ts">
import type { ParentQuestion } from "@/types/book";

const props = withDefaults(
  defineProps<{
    title: string;
    questions: ParentQuestion[];
    activity?: string;
    compact?: boolean;
  }>(),
  {
    activity: "",
    compact: false
  }
);
</script>

<style scoped lang="scss">
.parent-tip {
  padding: 30rpx;
  background:
    radial-gradient(circle at 92% 14%, rgba(255, 214, 107, 0.18), transparent 34%),
    rgba(255, 255, 255, 0.92);
}

.parent-tip--compact {
  padding: 24rpx;
}

.parent-tip__title {
  display: block;
  font-size: 31rpx;
  font-weight: 900;
  color: $color-primary-dark;
  letter-spacing: 0;
}

.parent-tip__questions {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 24rpx;
}

.parent-tip__question {
  padding: 20rpx;
  border-radius: 22rpx;
  background: rgba(255, 248, 236, 0.78);
}

.parent-tip__en {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: $color-primary-dark;
  letter-spacing: 0;
}

.parent-tip__cn {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $color-muted;
  letter-spacing: 0;
}

.parent-tip__activity {
  display: block;
  margin-top: 22rpx;
  font-size: 25rpx;
  color: $color-muted;
  line-height: 1.5;
}
</style>
