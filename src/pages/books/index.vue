<template>
  <view class="page books-page screen-with-nav">
    <view class="books-header">
      <view>
        <text class="page-title">绘本馆</text>
        <text class="page-subtitle">按兴趣和阅读等级，选一本刚刚好的故事。</text>
      </view>
      <button role="button" class="search-button" aria-label="搜索绘本" @tap="showSearchHint">⌕</button>
    </view>

    <view v-if="searchOpen" class="search-panel soft-card">
      <input v-model="searchQuery" class="search-input" type="text" confirm-type="search" placeholder="搜索书名、简介或单词" />
      <button role="button" v-if="searchQuery" class="search-clear" aria-label="清除搜索" @tap="searchQuery = ''">×</button>
    </view>

    <scroll-view class="theme-scroll" scroll-x>
      <view class="theme-scroll__inner">
        <button role="button"
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

    <button role="button" v-if="recentBook && recent" class="resume-book soft-card" @tap="navigate({ url: `/pkg-reading/reader/index?bookId=${recentBook.id}&pageIndex=${recent.currentPage}` })"><view><text>接着上次的故事</text><text>{{ recentBook.title }} · 第 {{ recent.currentPage }} 页</text></view><text>继续读 ›</text></button>

    <view class="reading-system soft-card">
      <view class="reading-system__image"><CachedImage :src="'/static/first-books/bear/cover.jpg'" mode="aspectFill" /></view>
      <view class="reading-system__copy">
        <text class="reading-system__eyebrow">短句 · 听读 · 陪伴</text>
        <text class="reading-system__title">从一本喜欢的故事开始</text>
        <text class="reading-system__desc">从短句和高频词开始，每天稳稳读一点。</text>
      </view>
    </view>

    <view class="library-toolbar">
      <picker :range="levelOptions" range-key="label" :value="levelIndex" @change="changeLevel">
        <view class="library-toolbar__filter">
          <text>{{ levelOptions[levelIndex].label }}</text>
          <text class="library-toolbar__arrow">⌄</text>
        </view>
      </picker>
      <view class="library-toolbar__meta">
        <text>{{ filteredBooks.length }} 本绘本</text>
        <picker :range="sortOptions" range-key="label" :value="sortIndex" @change="changeSort">
          <text class="library-toolbar__sort">{{ sortOptions[sortIndex].label }}⌄</text>
        </picker>
      </view>
    </view>

    <view class="book-list">
      <BookCard
        v-for="book in filteredBooks"
        :key="book.id"
        :book="book"
        :is-read="readBookIds.includes(book.id)"
        variant="horizontal"
        @select="goBookDetail"
      />
    </view>

    <view v-if="!filteredBooks.length" class="empty-library soft-card">
      <text class="empty-library__title">没有找到合适的绘本</text>
      <text class="empty-library__desc">换个关键词或筛选条件试试。</text>
      <button role="button" class="empty-library__reset" @tap="resetFilters">查看全部绘本</button>
    </view>

    <BottomNav active="books" />
  </view>
</template>

<script setup lang="ts">
import { navigate } from "@/services/navigationService";
import CachedImage from "@/components/CachedImage.vue";
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import BookCard from "@/components/BookCard.vue";
import BottomNav from "@/components/BottomNav.vue";
import { getBookById, getBooks, themeFilters } from "@/services/bookService";
import { getLearningState, getRecentProgress } from "@/services/progressService";
import { highResolutionAsset } from "@/services/assetService";
import type { Book, BookLevel } from "@/types/book";
import type { ThemeFilterValue } from "@/mock/books";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const recent = ref(getRecentProgress().find(p => p.readStatus === "reading"));
const recentBook = computed(() => recent.value ? getBookById(recent.value.bookId) : undefined);
const activeTheme = ref<ThemeFilterValue>("All");
const readBookIds = ref(getLearningState().readBookIds);
const searchOpen = ref(false);
const searchQuery = ref("");
const activeLevel = ref<BookLevel | "All">("All");
const activeSort = ref<"recommended" | "title" | "newest">("recommended");
const levelOptions: Array<{ label: string; value: BookLevel | "All" }> = [
  { label: "全部级别", value: "All" },
  { label: "Level A", value: "A" },
  { label: "Level B", value: "B" },
  { label: "Level C", value: "C" }
];
const sortOptions = [
  { label: "推荐排序", value: "recommended" as const },
  { label: "名称排序", value: "title" as const },
  { label: "最新添加", value: "newest" as const }
];
const levelIndex = computed(() => Math.max(0, levelOptions.findIndex((item) => item.value === activeLevel.value)));
const sortIndex = computed(() => Math.max(0, sortOptions.findIndex((item) => item.value === activeSort.value)));
const filteredBooks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const books = getBooks({ theme: activeTheme.value, level: activeLevel.value })
    .filter((book) => {
      if (!query) return true;
      return [book.title, book.description, ...book.keywords].some((value) => value.toLowerCase().includes(query));
    });

  if (activeSort.value === "title") return books.sort((first, second) => first.title.localeCompare(second.title));
  if (activeSort.value === "newest") return books.sort((first, second) => second.sort - first.sort);
  return books;
});

onShow(() => {
  recent.value = getRecentProgress().find(p => p.readStatus === "reading");
  readBookIds.value = getLearningState().readBookIds;
});

function goBookDetail(book: Book) {
  navigate({ url: `/pkg-reading/book-detail/index?bookId=${book.id}` });
}

function showSearchHint() {
  searchOpen.value = !searchOpen.value;
  if (!searchOpen.value) searchQuery.value = "";
}

function changeLevel(event: { detail: { value: string | number } }) {
  activeLevel.value = levelOptions[Number(event.detail.value)]?.value ?? "All";
}

function changeSort(event: { detail: { value: string | number } }) {
  activeSort.value = sortOptions[Number(event.detail.value)]?.value ?? "recommended";
}

function resetFilters() {
  activeTheme.value = "All";
  activeLevel.value = "All";
  activeSort.value = "recommended";
  searchQuery.value = "";
}
</script>

<style scoped lang="scss">
.resume-book { display:flex; width:100%; align-items:center; justify-content:space-between; gap:20rpx; padding:24rpx; margin-bottom:20rpx; background:#f7ead9; text-align:left; font-size:24rpx; color:$color-primary; } .resume-book view { min-width:0; } .resume-book view text { display:block; line-height:1.5; } .resume-book view text:first-child { font-size:20rpx; color:$color-muted; } .resume-book > text { flex:none; }
.books-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  padding: 4rpx 0 16rpx;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border: 1rpx solid $color-line;
  border-radius: 50%;
  font-size: 36rpx;
  color: $color-primary-dark;
  background: #fffdf9;
}

.search-panel {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin: 4rpx 0 18rpx;
  padding: 10rpx 16rpx 10rpx 24rpx;
}

.search-input {
  flex: 1;
  height: 66rpx;
  font-size: 25rpx;
  color: $color-primary-dark;
}

.search-clear {
  width: 58rpx;
  height: 58rpx;
  border-radius: 50%;
  font-size: 32rpx;
  color: $color-muted;
  background: #f2ede5;
}

.theme-scroll {
  margin: 8rpx -28rpx 20rpx;
  white-space: nowrap;
}

.theme-scroll__inner {
  display: inline-flex;
  gap: 12rpx;
  padding: 0 28rpx 8rpx;
}

.theme-chip {
  min-height: 62rpx;
  padding: 0 24rpx;
  border: 1rpx solid rgba(38, 61, 89, 0.09);
  border-radius: $radius-pill;
  font-size: 23rpx;
  font-weight: 700;
  color: #5f5a54;
  background: #f2ede5;
}

.theme-chip--active {
  color: #ffffff;
  border-color: $color-primary;
  background: $color-primary;
}

.reading-system {
  position: relative;
  min-height: 206rpx;
  overflow: hidden;
  background: #dfe8dd;
}

.reading-system__image {
  position: absolute;
  top: 0;
  right: 0;
  width: 42%;
  bottom: 0;
  opacity: 0.88;
}

.reading-system__copy {
  position: relative;
  z-index: 1;
  width: 66%;
  min-height: 206rpx;
  padding: 26rpx;
  background: rgba(239, 244, 235, 0.93);
}

.reading-system__eyebrow,
.reading-system__title,
.reading-system__desc {
  display: block;
}

.reading-system__eyebrow {
  font-size: 21rpx;
  font-weight: 800;
  color: #557050;
}

.reading-system__title {
  margin-top: 12rpx;
  font-size: 30rpx;
  font-weight: 800;
  color: $color-primary-dark;
  line-height: 1.3;
}

.reading-system__desc {
  margin-top: 9rpx;
  font-size: 21rpx;
  color: $color-muted;
  line-height: 1.45;
}

.library-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin: 26rpx 0 16rpx;
}

.library-toolbar__filter,
.library-toolbar__meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 21rpx;
  color: $color-muted;
}

.library-toolbar__filter {
  font-weight: 800;
  color: $color-primary-dark;
}

.library-toolbar__sort {
  font-weight: 700;
  color: $color-muted;
}

.library-toolbar__arrow {
  font-size: 25rpx;
}

.book-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.empty-library {
  padding: 46rpx 28rpx;
  text-align: center;
}

.empty-library__title,
.empty-library__desc {
  display: block;
}

.empty-library__title {
  font-size: 29rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.empty-library__desc {
  margin-top: 10rpx;
  font-size: 23rpx;
  color: $color-muted;
}

.empty-library__reset {
  margin: 24rpx auto 0;
  padding: 0 26rpx;
  min-height: 62rpx;
  border-radius: $radius-pill;
  font-size: 23rpx;
  font-weight: 800;
  color: #fff;
  background: $color-primary;
}
</style>
