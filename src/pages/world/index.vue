<template>
  <view class="page world-page screen-with-nav">
    <view class="topic-header">
      <view>
        <text class="page-title">国家 Countries</text>
        <text class="page-subtitle">点国旗听发音，认识世界上的不同国家。</text>
      </view>
      <button class="header-audio" aria-label="播放示范句" @tap="playHeroSentence">▶</button>
    </view>

    <view class="world-hero soft-card">
      <view class="world-hero__copy">
        <text class="world-hero__eyebrow">认识世界国家</text>
        <text class="world-hero__title">Hello, world!</text>
        <text class="world-hero__desc">从熟悉的国旗开始，打开孩子的世界地图。</text>
      </view>
      <image class="world-hero__image" :src="heroWorldIcon" mode="aspectFit" />
    </view>

    <view class="section-head">
      <text class="section-title">常见国家</text>
      <text class="world-count">{{ countryWords.length }} 个国家</text>
    </view>

    <view class="country-grid">
      <button v-for="item in countryWords" :key="item.id" class="country-card soft-card" @tap="playCountry(item)">
        <view class="country-card__flag-wrap">
          <image class="country-card__flag" :src="item.image" mode="aspectFit" />
        </view>
        <text class="country-card__cn">{{ item.meaning }}</text>
        <text class="country-card__en">{{ item.word }}</text>
        <text class="country-card__listen">▶ 听发音</text>
      </button>
    </view>

    <view class="world-fact soft-card">
      <view class="world-fact__icon">i</view>
      <view>
        <text class="world-fact__title">趣味小知识</text>
        <text class="world-fact__desc">每个国家都有自己的文化和风景。听完英文，再和孩子聊聊它在哪里。</text>
      </view>
    </view>

    <BottomNav active="learn" />
  </view>
</template>

<script setup lang="ts">
import BottomNav from "@/components/BottomNav.vue";
import { worldGroups } from "@/mock/topics";
import { mapIcon } from "@/mock/topicAssets";
import { speakEnglish } from "@/services/audioService";
import type { TopicWord } from "@/types/topic";

const heroWorldIcon = mapIcon("world");
const countryWords = worldGroups.flatMap((group) => group.words);

function playHeroSentence() {
  speakEnglish("Hello, world!");
}

function playCountry(item: TopicWord) {
  speakEnglish(`${item.word}. ${item.sentence}`);
}
</script>

<style scoped lang="scss">
.topic-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  padding: 4rpx 0 20rpx;
}

.header-audio {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border: 1rpx solid rgba(185, 95, 61, 0.16);
  border-radius: 50%;
  font-size: 20rpx;
  color: $color-primary;
  background: #f8eee8;
}

.world-hero {
  position: relative;
  min-height: 222rpx;
  overflow: hidden;
  background: #d9e7df;
}

.world-hero__copy {
  position: relative;
  z-index: 1;
  width: 62%;
  padding: 30rpx;
}

.world-hero__eyebrow,
.world-hero__title,
.world-hero__desc {
  display: block;
}

.world-hero__eyebrow {
  font-size: 22rpx;
  font-weight: 800;
  color: #416e61;
}

.world-hero__title {
  margin-top: 12rpx;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 36rpx;
  font-weight: 700;
  color: $color-primary-dark;
}

.world-hero__desc {
  margin-top: 8rpx;
  font-size: 21rpx;
  color: $color-muted;
  line-height: 1.42;
}

.world-hero__image {
  position: absolute;
  right: 8rpx;
  bottom: 2rpx;
  width: 238rpx;
  height: 210rpx;
}

.world-count {
  font-size: 21rpx;
  color: $color-muted;
}

.country-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.country-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 274rpx;
  margin: 0;
  padding: 18rpx 14rpx;
  text-align: center;
}

.country-card__flag-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 132rpx;
  border: 1rpx solid rgba(38, 61, 89, 0.08);
  border-radius: $radius-small;
  background: #f7f5ef;
}

.country-card__flag {
  width: 90%;
  height: 116rpx;
}

.country-card__cn {
  margin-top: 14rpx;
  font-size: 25rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.country-card__en {
  display: block;
  width: 100%;
  margin-top: 3rpx;
  overflow: hidden;
  font-size: 20rpx;
  color: $color-muted;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.country-card__listen {
  margin-top: 9rpx;
  font-size: 19rpx;
  font-weight: 700;
  color: $color-primary;
}

.world-fact {
  display: grid;
  grid-template-columns: 54rpx 1fr;
  gap: 16rpx;
  align-items: flex-start;
  margin-top: 22rpx;
  padding: 24rpx;
  background: #edf2eb;
}

.world-fact__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  font-family: Georgia, serif;
  font-size: 28rpx;
  font-weight: 700;
  color: #ffffff;
  background: #729076;
}

.world-fact__title,
.world-fact__desc {
  display: block;
}

.world-fact__title {
  font-size: 24rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.world-fact__desc {
  margin-top: 6rpx;
  font-size: 21rpx;
  color: $color-muted;
  line-height: 1.48;
}

@media (min-width: 900px) {
  .country-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
