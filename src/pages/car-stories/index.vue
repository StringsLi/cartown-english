<template>
  <view class="page vehicle-books-page">
    <view class="vehicle-books-header">
      <view>
        <text class="section-kicker">VEHICLE STORIES</text>
        <text class="page-title">汽车工程车绘本</text>
        <text class="page-subtitle">从短句开始，跟着喜欢的车读一个完整故事。</text>
      </view>
      <text class="vehicle-books-count">{{ vehicleBooks.length }} 本</text>
    </view>

    <view class="vehicle-books-hero soft-card">
      <VehicleStoryArt class="vehicle-books-hero__art" story-id="red-car" :page-index="0" />
      <view class="vehicle-books-hero__copy">
        <text class="vehicle-books-hero__eyebrow">本周推荐</text>
        <text class="vehicle-books-hero__title">Red Car Comes Home</text>
        <text class="vehicle-books-hero__desc">认识 go、stop、slow，学习安全又温柔地开车。</text>
      </view>
    </view>

    <view class="vehicle-books-tags">
      <text class="vehicle-books-tag">小汽车</text>
      <text class="vehicle-books-tag">工程车</text>
      <text class="vehicle-books-tag">消防车</text>
      <text class="vehicle-books-tag">城市巴士</text>
    </view>

    <view class="section-head">
      <text class="section-title">选择一本故事</text>
      <text class="section-link" @tap="goLibrary">全部绘本</text>
    </view>

    <view class="vehicle-books-grid">
      <BookCard v-for="book in vehicleBooks" :key="book.id" :book="book" @select="goBookDetail" />
    </view>

    <view class="vehicle-books-tip soft-card">
      <text class="vehicle-books-tip__title">陪读小提示</text>
      <text class="vehicle-books-tip__desc">每页先听一遍，再让孩子指着车说关键词。五页读完就足够啦。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import BookCard from "@/components/BookCard.vue";
import VehicleStoryArt from "@/components/VehicleStoryArt.vue";
import { getBooks } from "@/services/bookService";
import type { Book } from "@/types/book";

const vehicleBooks = getBooks({ theme: "Vehicles" });

function goBookDetail(book: Book) {
  uni.navigateTo({ url: `/pages/book-detail/index?bookId=${book.id}` });
}

function goLibrary() {
  uni.navigateTo({ url: "/pages/books/index" });
}
</script>

<style scoped lang="scss">
.vehicle-books-page {
  padding-bottom: 56rpx;
}

.vehicle-books-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 22rpx;
}

.vehicle-books-count {
  flex: 0 0 auto;
  padding: 10rpx 17rpx;
  border: 1rpx solid $color-line;
  border-radius: $radius-pill;
  font-size: 21rpx;
  font-weight: 800;
  color: $color-primary;
  background: #fffdf9;
}

.vehicle-books-hero {
  position: relative;
  min-height: 242rpx;
  margin-top: 24rpx;
  overflow: hidden;
  background: #e6ece3;
}

.vehicle-books-hero__art {
  position: absolute;
  top: 0;
  right: 0;
  width: 48%;
  height: 100%;
}

.vehicle-books-hero__copy {
  position: relative;
  z-index: 1;
  width: 59%;
  min-height: 242rpx;
  padding: 28rpx;
  background: rgba(239, 243, 235, 0.94);
}

.vehicle-books-hero__eyebrow,
.vehicle-books-hero__title,
.vehicle-books-hero__desc {
  display: block;
}

.vehicle-books-hero__eyebrow {
  font-size: 20rpx;
  font-weight: 800;
  color: #5e7559;
}

.vehicle-books-hero__title {
  margin-top: 11rpx;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 30rpx;
  font-weight: 700;
  color: $color-primary-dark;
  line-height: 1.22;
}

.vehicle-books-hero__desc {
  margin-top: 10rpx;
  font-size: 21rpx;
  color: $color-muted;
  line-height: 1.48;
}

.vehicle-books-tags {
  display: flex;
  gap: 10rpx;
  margin-top: 18rpx;
  overflow: hidden;
}

.vehicle-books-tag {
  flex: 0 0 auto;
  padding: 9rpx 16rpx;
  border-radius: $radius-pill;
  font-size: 20rpx;
  font-weight: 700;
  color: $color-primary-dark;
  background: #eeeae2;
}

.vehicle-books-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.vehicle-books-grid :deep(.book-card__cover) {
  height: 220rpx;
}

.vehicle-books-grid :deep(.book-card__body) {
  padding: 18rpx;
}

.vehicle-books-grid :deep(.book-card__description) {
  min-height: 64rpx;
}

.vehicle-books-tip {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #f3ece5;
}

.vehicle-books-tip__title,
.vehicle-books-tip__desc {
  display: block;
}

.vehicle-books-tip__title {
  font-size: 24rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.vehicle-books-tip__desc {
  margin-top: 8rpx;
  font-size: 21rpx;
  color: $color-muted;
  line-height: 1.5;
}

@media (min-width: 900px) {
  .vehicle-books-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
