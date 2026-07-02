<template>
  <view class="page books-page">
    <view class="books-hero soft-card">
      <view>
        <text class="section-kicker">Picture Book Shelf</text>
        <text class="page-title">绘本馆</text>
        <text class="page-subtitle">每本 5 页，一次只读一点点，孩子更容易坚持。</text>
      </view>
      <view class="books-hero__badge">
        <text class="books-hero__value">{{ filteredBooks.length }}</text>
        <text class="books-hero__label">本可读</text>
      </view>
    </view>

    <view class="books-summary soft-card">
      <view class="books-summary__item">
        <text class="books-summary__value">{{ readBookIds.length }}</text>
        <text class="books-summary__label">已读绘本</text>
      </view>
      <view class="books-summary__item">
        <text class="books-summary__value">{{ allBooks.length }}</text>
        <text class="books-summary__label">馆内绘本</text>
      </view>
      <view class="books-summary__item">
        <text class="books-summary__value">5</text>
        <text class="books-summary__label">页/本</text>
      </view>
    </view>

    <scroll-view class="theme-scroll" scroll-x>
      <view class="theme-scroll__inner">
        <button
          v-for="theme in themeFilters"
          :key="theme.value"
          class="theme-chip"
          :class="{ 'theme-chip--active': activeTheme === theme.value }"
          @tap="activeTheme = theme.value"
        >
          {{ theme.label }}
        </button>
      </view>
    </scroll-view>

    <view class="book-grid">
      <BookCard v-for="book in filteredBooks" :key="book.id" :book="book" :is-read="readBookIds.includes(book.id)" @select="goBookDetail" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BookCard from "@/components/BookCard.vue";
import { getBooks, themeFilters } from "@/services/bookService";
import { getLearningState } from "@/services/progressService";
import type { Book } from "@/types/book";
import type { ThemeFilterValue } from "@/mock/books";

const activeTheme = ref<ThemeFilterValue>("All");
const readBookIds = getLearningState().readBookIds;
const allBooks = getBooks();
const filteredBooks = computed(() => getBooks({ theme: activeTheme.value }));

function goBookDetail(book: Book) {
  uni.navigateTo({
    url: `/pages/book-detail/index?bookId=${book.id}`
  });
}
</script>

<style scoped lang="scss">
.books-page {
  padding-bottom: 56rpx;
}

.books-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 28rpx;
  padding: 32rpx;
  background:
    radial-gradient(circle at 92% 20%, rgba(255, 214, 107, 0.34), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 58%, #fff0dd 100%);
}

.books-hero__badge {
  flex: 0 0 auto;
  width: 126rpx;
  height: 126rpx;
  padding-top: 22rpx;
  border-radius: 34rpx;
  text-align: center;
  background: rgba(255, 214, 107, 0.68);
}

.books-hero__value,
.books-hero__label {
  display: block;
  color: $color-primary-dark;
  letter-spacing: 0;
}

.books-hero__value {
  font-size: 42rpx;
  font-weight: 900;
}

.books-hero__label {
  margin-top: 4rpx;
  font-size: 22rpx;
  font-weight: 900;
}

.books-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 24rpx;
  padding: 18rpx;
}

.books-summary__item {
  min-height: 116rpx;
  padding: 18rpx 8rpx;
  border-radius: 24rpx;
  text-align: center;
  background: rgba(221, 240, 255, 0.52);
}

.books-summary__value {
  display: block;
  font-size: 42rpx;
  font-weight: 900;
  color: $color-primary;
}

.books-summary__label {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  font-weight: 800;
  color: $color-muted;
}

.theme-scroll {
  margin: 32rpx -32rpx 22rpx;
  white-space: nowrap;
}

.theme-scroll__inner {
  display: inline-flex;
  gap: 14rpx;
  padding: 0 32rpx 8rpx;
}

.theme-chip {
  min-height: 70rpx;
  padding: 0 28rpx;
  border-radius: $radius-pill;
  font-size: 26rpx;
  font-weight: 900;
  color: $color-primary-dark;
  background: rgba(221, 240, 255, 0.78);
}

.theme-chip--active {
  background: rgba(255, 214, 107, 0.82);
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22rpx;
}
</style>
