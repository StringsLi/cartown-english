<template>
  <view class="page story-page">
    <view class="story-hero soft-card">
      <text class="section-kicker">Car Story</text>
      <text class="page-title">小汽车故事</text>
      <text class="page-subtitle">两本来自 CarTown 的车主题小绘本。</text>
    </view>

    <view v-if="choosing" class="story-book-grid">
      <view v-for="(book, index) in storyBooks" :key="book.id" class="story-book soft-card" @tap="chooseBook(index)">
        <CartownVehicle :color="index === 0 ? '#f95757' : '#ffd447'" :accent="index === 0 ? '#FFD66B' : '#48cae4'" :kind="index === 0 ? 'car' : 'bus'" />
        <text class="story-book__title">{{ book.title }}</text>
        <text class="story-book__zh">{{ book.zh }}</text>
      </view>
    </view>

    <view v-else>
      <view class="story-card soft-card">
        <view class="story-card__scene">
          <CartownVehicle :color="book.id === 'little-red-car' ? '#f95757' : '#ffd447'" :accent="book.id === 'little-red-car' ? '#FFD66B' : '#48cae4'" :kind="book.id === 'little-red-car' ? 'car' : 'bus'" />
        </view>
        <text class="story-card__page">Page {{ page.id }} / {{ book.pages.length }}</text>
        <text class="story-card__sentence">{{ page.sentence }}</text>
        <text class="story-card__zh">{{ page.zh }}</text>
      </view>

      <view class="story-actions">
        <BigButton label="选书" variant="ghost" @tap="choosing = true" />
        <BigButton label="听一听" @tap="playPage" />
        <BigButton label="下一页" variant="warm" @tap="nextPage" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BigButton from "@/components/BigButton.vue";
import CartownVehicle from "@/components/CartownVehicle.vue";
import { storyBooks } from "@/mock/cartown";
import { speakEnglish } from "@/services/audioService";
import { getCartownProgress, saveCartownProgress } from "@/services/cartownProgressService";

const progress = getCartownProgress();
const choosing = ref(true);
const bookIndex = ref(Math.min(progress.storyBookIndex, storyBooks.length - 1));
const pageIndex = ref(Math.min(progress.storyPageIndex, storyBooks[0].pages.length - 1));
const book = computed(() => storyBooks[bookIndex.value]);
const page = computed(() => book.value.pages[pageIndex.value] ?? book.value.pages[0]);

function chooseBook(index: number) {
  bookIndex.value = index;
  pageIndex.value = 0;
  choosing.value = false;
  saveCartownProgress({ storyBookIndex: index, storyPageIndex: 0 });
  playPage();
}

function playPage() {
  speakEnglish(page.value.sentence);
}

function nextPage() {
  pageIndex.value = (pageIndex.value + 1) % book.value.pages.length;
  saveCartownProgress({ storyBookIndex: bookIndex.value, storyPageIndex: pageIndex.value });
  playPage();
}
</script>

<style scoped lang="scss">
.story-page {
  padding-bottom: 56rpx;
}

.story-hero {
  padding: 32rpx;
  background:
    radial-gradient(circle at 92% 20%, rgba(255, 214, 107, 0.34), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 58%, #fff0dd 100%);
}

.story-book-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 28rpx;
}

.story-book {
  min-height: 330rpx;
  padding: 22rpx;
  text-align: center;
}

.story-book__title,
.story-card__sentence {
  display: block;
  font-size: 36rpx;
  font-weight: 900;
  color: $color-primary-dark;
  line-height: 1.2;
}

.story-book__zh,
.story-card__zh {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: $color-muted;
}

.story-card {
  margin-top: 28rpx;
  padding: 30rpx;
  text-align: center;
}

.story-card__scene {
  height: 260rpx;
}

.story-card__page {
  display: inline-block;
  margin: 8rpx 0 20rpx;
  padding: 10rpx 18rpx;
  border-radius: $radius-pill;
  font-size: 23rpx;
  font-weight: 900;
  color: $color-primary-dark;
  background: rgba(255, 214, 107, 0.72);
}

.story-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 24rpx;
}
</style>
