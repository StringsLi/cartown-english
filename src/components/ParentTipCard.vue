<template>
  <view class="parent-tip soft-card" :class="{ 'parent-tip--compact': props.compact }">
    <text class="parent-tip__title">{{ props.title }}</text>
    <view class="parent-tip__questions">
      <view v-for="question in props.questions" :key="question.en" class="parent-tip__question">
        <text class="parent-tip__en">{{ question.en }}</text>
        <text class="parent-tip__cn">{{ question.cn }}</text>
        <ReadAlongLink v-if="props.returnUrl" :source-key="'parent-question-' + (props.bookId || 'book') + '-' + phraseHash(question.en)" :title="props.title" :text="question.en" :text-cn="question.cn" :audio="parentQuestionAudio(question.en)" :listen="true" :book-id="props.bookId" :return-url="props.returnUrl" />
      </view>
    </view>
    <text v-if="props.activity" class="parent-tip__activity">{{ props.activity }}</text>
  </view>
</template>

<script setup lang="ts">
import ReadAlongLink from "@/components/ReadAlongLink.vue";
import { parentQuestionAudio } from "@/services/readAlongService";
import { phraseHash } from "@/services/audioCatalog";
import type { ParentQuestion } from "@/types/book";

const props = withDefaults(
  defineProps<{
    title: string;
    questions: ParentQuestion[];
    activity?: string;
    compact?: boolean;
    bookId?: string;
    returnUrl?: string;
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
  background: #fffdf9;
}

.parent-tip--compact {
  padding: 24rpx;
}

.parent-tip__title {
  display: block;
  font-size: 31rpx;
  font-weight: 800;
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
  border-radius: $radius-small;
  background: #f5f1ea;
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
