<template>
  <view class="book-card soft-card" @tap="emit('select', props.book)">
    <view class="book-card__cover" :class="`book-card__cover--${props.book.theme.toLowerCase().replace(' ', '-')}`">
      <image v-if="!imageFailed" class="book-card__image" :src="props.book.cover" mode="aspectFill" @error="imageFailed = true" />
      <view v-else class="book-card__fallback">
        <text class="book-card__fallback-title">{{ props.book.title }}</text>
      </view>
      <text v-if="props.isRead" class="book-card__read">已读</text>
    </view>

    <view class="book-card__body">
      <text class="book-card__title">{{ props.book.title }}</text>
      <text class="book-card__meta">Level {{ props.book.level }} · {{ themeLabel }}</text>
      <view class="book-card__words">
        <text v-for="word in props.book.keywords" :key="word" class="book-card__word">{{ word }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getThemeLabel } from "@/services/bookService";
import type { Book } from "@/types/book";

const props = withDefaults(
  defineProps<{
    book: Book;
    isRead?: boolean;
  }>(),
  {
    isRead: false
  }
);

const emit = defineEmits<{
  (event: "select", book: Book): void;
}>();

const imageFailed = ref(false);
const themeLabel = computed(() => getThemeLabel(props.book.theme));

watch(
  () => props.book.cover,
  () => {
    imageFailed.value = false;
  }
);
</script>

<style scoped lang="scss">
.book-card {
  overflow: hidden;
  transition: transform 0.16s ease;
}

.book-card:active {
  transform: scale(0.99);
}

.book-card__cover {
  position: relative;
  height: 246rpx;
  overflow: hidden;
  border-radius: $radius-card $radius-card 0 0;
  background:
    radial-gradient(circle at 84% 20%, rgba(255, 214, 107, 0.36), transparent 34%),
    linear-gradient(135deg, $color-sky-soft 0%, #ffffff 58%, #fff0d8 100%);
}

.book-card__image {
  width: 100%;
  height: 100%;
}

.book-card__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 24rpx;
}

.book-card__fallback-title {
  font-size: 36rpx;
  font-weight: 900;
  color: $color-primary-dark;
  text-align: center;
  letter-spacing: 0;
  line-height: 1.25;
}

.book-card__read {
  position: absolute;
  top: 18rpx;
  right: 18rpx;
  padding: 8rpx 16rpx;
  border-radius: $radius-pill;
  font-size: 22rpx;
  font-weight: 900;
  color: $color-primary-dark;
  background: rgba(255, 255, 255, 0.92);
}

.book-card__body {
  padding: 24rpx;
}

.book-card__title {
  display: block;
  font-size: 33rpx;
  font-weight: 900;
  color: $color-primary-dark;
  letter-spacing: 0;
}

.book-card__meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $color-muted;
  letter-spacing: 0;
}

.book-card__words {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 18rpx;
}

.book-card__word {
  padding: 8rpx 14rpx;
  border-radius: $radius-pill;
  font-size: 22rpx;
  font-weight: 800;
  color: $color-primary-dark;
  background: rgba(221, 240, 255, 0.72);
}
</style>
