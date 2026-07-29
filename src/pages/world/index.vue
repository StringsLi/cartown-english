<template>
  <view class="page world-page screen-with-nav">
    <view class="world-head">
      <view>
        <text class="world-head__kicker">WORLD ROAD TRIP</text>
        <text class="page-title">车车看世界</text>
        <text class="page-subtitle">点一下国旗，听听这个国家的英文名字。</text>
      </view>
      <view class="world-progress">
        <text class="world-progress__value">{{ exploredIds.length }}/50</text>
        <text class="world-progress__label">已发现</text>
      </view>
    </view>

    <view class="world-hero">
      <CachedImage class="world-hero__image" :src="heroWorldIcon" mode="aspectFit" />
      <view class="world-hero__copy">
        <text class="world-hero__eyebrow">50-COUNTRY MAP</text>
        <text class="world-hero__title">Hello, world!</text>
        <text class="world-hero__desc">从亚洲出发，坐着车车认识五大区域。</text>
        <button class="world-hero__audio" @tap="playHeroSentence">▶ 听一听</button>
      </view>
    </view>

    <scroll-view class="region-scroll" scroll-x :show-scrollbar="false">
      <view class="region-tabs">
        <button
          v-for="filter in countryFilters"
          :key="filter.id"
          class="region-tab"
          :class="{ 'region-tab--active': activeGroup === filter.id }"
          @tap="activeGroup = filter.id"
        >
          {{ filter.label }}
          <text class="region-tab__count">{{ filter.count }}</text>
        </button>
      </view>
    </scroll-view>

    <view class="section-head">
      <text class="section-title">{{ activeGroupTitle }}</text>
      <text class="world-count">{{ visibleCountries.length }} 个国家</text>
    </view>

    <view class="country-grid">
      <button
        v-for="item in visibleCountries"
        :key="item.id"
        class="country-card"
        :class="{ 'country-card--explored': exploredIds.includes(item.id) }"
        @tap="playCountry(item)"
      >
        <view class="country-card__flag-wrap">
          <CachedImage class="country-card__flag" :src="item.image" mode="aspectFit" />
          <view v-if="exploredIds.includes(item.id)" class="country-card__check">✓</view>
        </view>
        <text class="country-card__cn">{{ item.meaning }}</text>
        <text class="country-card__en">{{ item.word }}</text>
        <view class="country-card__listen">
          <text class="country-card__play">▶</text>
          <text>点我听发音</text>
        </view>
      </button>
    </view>

    <view class="world-tip soft-card">
      <text class="world-tip__star">★</text>
      <view>
        <text class="world-tip__title">探索小目标</text>
        <text class="world-tip__desc">每次认识 3 个国家就很好，慢慢收集 50 面国旗。</text>
      </view>
    </view>

    <BottomNav active="learn" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BottomNav from "@/components/BottomNav.vue";
import CachedImage from "@/components/CachedImage.vue";
import { worldGroups } from "@/mock/topics";
import { mapIcon } from "@/mock/topicAssets";
import { speakEnglish } from "@/services/audioService";
import type { TopicWord } from "@/types/topic";

const EXPLORED_STORAGE_KEY = "cartown_explored_countries";
const heroWorldIcon = mapIcon("world");
const allCountries = worldGroups.flatMap((group) => group.words);
const activeGroup = ref("all");
const exploredIds = ref<string[]>(uni.getStorageSync(EXPLORED_STORAGE_KEY) || []);

const countryFilters = [
  { id: "all", label: "全部", count: allCountries.length },
  ...worldGroups.map((group) => ({ id: group.id, label: group.title, count: group.words.length }))
];

const visibleCountries = computed(() => {
  if (activeGroup.value === "all") return allCountries;
  return worldGroups.find((group) => group.id === activeGroup.value)?.words || [];
});

const activeGroupTitle = computed(() => (
  activeGroup.value === "all"
    ? "50 个国家"
    : countryFilters.find((filter) => filter.id === activeGroup.value)?.label || "国家"
));

function playHeroSentence() {
  speakEnglish("Hello, world!");
}

function playCountry(item: TopicWord) {
  if (!exploredIds.value.includes(item.id)) {
    exploredIds.value = [...exploredIds.value, item.id];
    uni.setStorageSync(EXPLORED_STORAGE_KEY, exploredIds.value);
  }
  speakEnglish(item.word + ". " + item.sentence);
}
</script>

<style scoped lang="scss">
.world-page {
  background:
    radial-gradient(circle at 90% 3%, rgba(78, 153, 184, 0.16), transparent 23%),
    $color-cream;
}

.world-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  padding: 3rpx 0 22rpx;
}

.world-head__kicker {
  display: block;
  margin-bottom: 6rpx;
  font-size: 18rpx;
  font-weight: 900;
  color: #2c8098;
  letter-spacing: 2rpx;
}

.world-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 96rpx;
  padding: 13rpx 12rpx;
  border-radius: 8rpx;
  color: #31566a;
  background: #e4f1f4;
}

.world-progress__value {
  font-size: 25rpx;
  font-weight: 900;
}

.world-progress__label {
  margin-top: 3rpx;
  font-size: 17rpx;
}

.world-hero {
  position: relative;
  height: 258rpx;
  overflow: hidden;
  border: 1rpx solid rgba(42, 93, 111, 0.1);
  border-radius: 8rpx;
  background: #dfeff1;
}

.world-hero__image {
  position: absolute;
  right: -12rpx;
  bottom: -8rpx;
  width: 292rpx;
  height: 240rpx;
}

.world-hero__copy {
  position: relative;
  z-index: 1;
  width: 62%;
  padding: 29rpx;
}

.world-hero__eyebrow,
.world-hero__title,
.world-hero__desc {
  display: block;
}

.world-hero__eyebrow {
  font-size: 17rpx;
  font-weight: 900;
  color: #2c8098;
  letter-spacing: 1rpx;
}

.world-hero__title {
  margin-top: 8rpx;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 36rpx;
  font-weight: 700;
  color: #243f50;
}

.world-hero__desc {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #61747c;
  line-height: 1.42;
}

.world-hero__audio {
  min-height: 50rpx;
  margin-top: 15rpx;
  padding: 0 18rpx;
  border-radius: 25rpx;
  font-size: 19rpx;
  font-weight: 900;
  color: #ffffff;
  background: #2c8098;
}

.region-scroll {
  width: calc(100% + 56rpx);
  margin: 24rpx -28rpx 0;
  white-space: nowrap;
}

.region-tabs {
  display: inline-flex;
  gap: 12rpx;
  padding: 0 28rpx 6rpx;
}

.region-tab {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  min-height: 58rpx;
  padding: 0 19rpx;
  border: 1rpx solid #d6d1c8;
  border-radius: 29rpx;
  font-size: 21rpx;
  font-weight: 800;
  color: #5f696d;
  background: #fffdf9;
}

.region-tab--active {
  border-color: #2c8098;
  color: #ffffff;
  background: #2c8098;
}

.region-tab__count {
  opacity: 0.72;
  font-size: 17rpx;
}

.world-count {
  font-size: 20rpx;
  color: $color-muted;
}

.country-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15rpx;
}

.country-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  min-height: 280rpx;
  padding: 16rpx;
  border: 1rpx solid rgba(47, 74, 85, 0.1);
  border-radius: 8rpx;
  text-align: center;
  background: #fffdf9;
  box-shadow: 0 9rpx 22rpx rgba(47, 58, 74, 0.06);
}

.country-card--explored {
  border-color: rgba(60, 155, 118, 0.34);
  background: #f7fcf8;
}

.country-card__flag-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 132rpx;
  overflow: hidden;
  border-radius: 6rpx;
  background: #f0eee8;
}

.country-card__flag {
  width: 90%;
  height: 116rpx;
}

.country-card__check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  border: 4rpx solid #ffffff;
  border-radius: 50%;
  font-size: 17rpx;
  font-weight: 900;
  color: #ffffff;
  background: #3c9b76;
}

.country-card__cn {
  margin-top: 13rpx;
  font-size: 25rpx;
  font-weight: 900;
  color: #263f4b;
}

.country-card__en {
  display: block;
  width: 100%;
  min-height: 42rpx;
  margin-top: 3rpx;
  overflow: hidden;
  font-size: 19rpx;
  color: #68757b;
  line-height: 1.18;
  text-overflow: ellipsis;
}

.country-card__listen {
  display: flex;
  align-items: center;
  gap: 7rpx;
  margin-top: 6rpx;
  font-size: 18rpx;
  font-weight: 800;
  color: #2c8098;
}

.country-card__play {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  font-size: 11rpx;
  color: #ffffff;
  background: #2c8098;
}

.world-tip {
  display: grid;
  grid-template-columns: 54rpx 1fr;
  gap: 15rpx;
  align-items: center;
  margin-top: 24rpx;
  padding: 22rpx;
}

.world-tip__star {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  color: #ffffff;
  background: #e1a832;
}

.world-tip__title,
.world-tip__desc {
  display: block;
}

.world-tip__title {
  font-size: 23rpx;
  font-weight: 900;
  color: #263f4b;
}

.world-tip__desc {
  margin-top: 5rpx;
  font-size: 20rpx;
  color: #6d787d;
  line-height: 1.42;
}

@media (min-width: 900px) {
  .country-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>