<template>
  <view class="page world-page ">
    <PageTopbar section="世界探索" fallback="/pages/vehicles/index" />
    <AudioFeedback />
    <view class="world-head">
      <view>
        <text class="world-head__kicker">WORLD ROAD TRIP</text>
        <text class="page-title">车车看世界</text>
        <text class="page-subtitle">国旗和地图一键切换，点一下听英文名字。</text>
      </view>
      <view class="world-progress">
        <text class="world-progress__value">{{ exploredIds.length }}/50</text>
        <text class="world-progress__label">已发现</text>
      </view>
    </view>

    <view class="world-hero">
      <CachedImage class="world-hero__image" :src="heroWorldImage" mode="aspectFill" />
      <view class="world-hero__copy">
        <view>
          <text class="world-hero__eyebrow">50-COUNTRY MAP</text>
          <text class="world-hero__title">Hello, world!</text>
          <text class="world-hero__desc">沿着路线出发，认识五大区域。</text>
        </view>
        <button role="button" class="world-hero__audio" @tap="playHeroSentence">▶ 听一听</button>
      </view>
    </view>

    <view class="world-daily soft-card"><text>今天的小耳朵 · {{ dailyDone }} / {{ DAILY_COUNTRY_COUNT }}</text><text>{{ dailyDone === DAILY_COUNTRY_COUNT ? "今天的小目标完成啦，去玩真实的小车吧。" : "听到国家的英语名字，才会记入今天的进度。" }}</text></view>

    <scroll-view class="region-scroll" scroll-x :show-scrollbar="false">
      <view class="region-tabs">
        <button role="button"
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

    <view class="section-head world-section-head">
      <view class="world-section-copy">
        <text class="section-title">{{ activeGroupTitle }}</text>
        <text class="world-count">{{ visibleCountries.length }} 个国家</text>
      </view>
      <view class="country-view-toggle" aria-label="国家图片显示方式">
        <button role="button"
          class="country-view-toggle__button"
          :class="{ 'country-view-toggle__button--active': countryView === 'flag' }"
          @tap="switchCountryView('flag')"
        >
          国旗
        </button>
        <button role="button"
          class="country-view-toggle__button"
          :class="{ 'country-view-toggle__button--active': countryView === 'map' }"
          @tap="switchCountryView('map')"
        >
          地图
        </button>
      </view>
    </view>

    <view class="country-grid">
      <button role="button"
        v-for="item in visibleCountries"
        :key="item.id"
        class="country-card"
        :class="{ 'country-card--learned': isCountryLearned(item) }"
        @tap="playCountry(item)"
      >
        <view v-if="isCountryLearned(item)" class="country-card__done">✓</view>
        <CachedImage
          class="country-card__visual"
          :class="`country-card__visual--${countryView}`"
          :src="countryImage(item)"
          mode="aspectFit"
        />
        <view class="country-card__name-row">
          <text class="country-card__en">{{ item.word }}</text>
          <view class="country-card__play" aria-hidden="true">▶</view>
        </view>
      </button>
    </view>

    <view class="world-tip soft-card">
      <text class="world-tip__star">★</text>
      <view>
        <text class="world-tip__title">探索小目标</text>
        <text class="world-tip__desc">每次认识 3 个国家就很好，国旗和地图可以换着看。</text>
      </view>
    </view>


  </view>
</template>

<script setup lang="ts">
import AudioFeedback from "@/components/AudioFeedback.vue";
import PageTopbar from "@/components/PageTopbar.vue";
import { onShow } from "@dcloudio/uni-app";
import { getCountryProgress, recordCountryListening } from "@/services/worldProgressService";
import { computed, ref } from "vue";

import CachedImage from "@/components/CachedImage.vue";
import { worldGroups } from "@/mock/topics";
import { speakEnglish } from "@/services/audioService";
import type { TopicWord } from "@/types/topic";
import { usePageShare } from "@/composables/usePageShare";
import { todayKey } from "@/utils/date";

usePageShare();

const COUNTRY_VIEW_STORAGE_KEY = "cartown_country_view";
const heroWorldImage = "/static/ui/world-road-trip.jpg";
const allCountries = worldGroups.flatMap((group) => group.words);
const DAILY_COUNTRY_COUNT = 3;
const activeGroup = ref("today");
const validIds = allCountries.map(country => country.id);
const progress = getCountryProgress(validIds);
const exploredIds = ref(progress.explored);
const todayIds = ref(progress.today);
const currentDate = ref(todayKey());
onShow(() => { currentDate.value = todayKey(); const value = getCountryProgress(validIds); exploredIds.value = value.explored; todayIds.value = value.today; });
type CountryView = "flag" | "map";
const savedCountryView = uni.getStorageSync(COUNTRY_VIEW_STORAGE_KEY);
const countryView = ref<CountryView>(savedCountryView === "map" ? "map" : "flag");

const dailyCountries = computed(() => dailyCountrySelection(allCountries, currentDate.value, DAILY_COUNTRY_COUNT));
const dailyDone = computed(() => dailyCountries.value.filter(country => todayIds.value.includes(country.id)).length);
const countryFilters = [
  { id: "today", label: "今日任务", count: DAILY_COUNTRY_COUNT },
  { id: "all", label: "全部", count: allCountries.length },
  ...worldGroups.map((group) => ({ id: group.id, label: group.title, count: group.words.length }))
];

const visibleCountries = computed(() => {
  if (activeGroup.value === "today") return dailyCountries.value;
  if (activeGroup.value === "all") return allCountries;
  return worldGroups.find((group) => group.id === activeGroup.value)?.words || [];
});

const activeGroupTitle = computed(() => (
  activeGroup.value === "today"
    ? "今天认识 3 个国家"
    : activeGroup.value === "all"
    ? "50 个国家"
    : countryFilters.find((filter) => filter.id === activeGroup.value)?.label || "国家"
));

function playHeroSentence() {
  speakEnglish("Hello, world!");
}

function switchCountryView(view: CountryView) {
  countryView.value = view;
  uni.setStorageSync(COUNTRY_VIEW_STORAGE_KEY, view);
}

function countryImage(item: TopicWord): string {
  return countryView.value === "map"
    ? item.mapImage || item.image
    : item.flagImage || item.image;
}

function playCountry(item: TopicWord) {
  const date = todayKey();
  const previousDone = dailyDone.value;
  speakEnglish(item.word + ". " + item.sentence, () => {
    const progress = recordCountryListening(item.id, validIds, date);
    exploredIds.value = progress.explored;
    if (date === todayKey()) { currentDate.value = date; todayIds.value = progress.today; }
    if (previousDone < DAILY_COUNTRY_COUNT && dailyDone.value === DAILY_COUNTRY_COUNT) uni.showToast({ title: "今日 3 国听完啦！", icon: "none" });
  });
}

function isCountryLearned(item: TopicWord): boolean {
  return exploredIds.value.includes(item.id);
}

function dailyCountrySelection(countries: TopicWord[], dateKey: string, count: number): TopicWord[] {
  const seed = [...dateKey].reduce((value, character) => value + character.charCodeAt(0), 0);
  return Array.from({ length: Math.min(count, countries.length) }, (_, offset) => (
    countries[(seed + offset * 17) % countries.length]
  ));
}
</script>

<style scoped lang="scss">
.world-daily { display:flex; flex-direction:column; gap:10rpx; margin-top:20rpx; padding:24rpx; background:#e8efe6; font-size:24rpx; font-weight:800; color:#527769; } .world-daily text + text { font-size:22rpx; font-weight:400; line-height:1.5; }
.world-page {
  background: $color-cream;
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1rpx solid rgba(20, 63, 81, 0.18);
  border-radius: 8rpx;
  background: #143f51;
  box-shadow: 0 12rpx 26rpx rgba(27, 57, 70, 0.12);
}

.world-hero__image {
  display: block;
  width: 100%;
  height: 252rpx;
  background: #0e7298;
}

.world-hero__copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 19rpx 22rpx 21rpx;
}

.world-hero__eyebrow,
.world-hero__title,
.world-hero__desc {
  display: block;
}

.world-hero__eyebrow {
  font-size: 17rpx;
  font-weight: 900;
  color: #8fd4df;
  letter-spacing: 1rpx;
}

.world-hero__title {
  margin-top: 4rpx;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 30rpx;
  font-weight: 700;
  color: #ffffff;
}

.world-hero__desc {
  margin-top: 4rpx;
  font-size: 18rpx;
  color: #d6e8ec;
  line-height: 1.42;
}

.world-hero__audio {
  flex: 0 0 auto;
  min-height: 50rpx;
  padding: 0 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.42);
  border-radius: 25rpx;
  font-size: 19rpx;
  font-weight: 900;
  color: #143f51;
  background: #f4cc62;
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
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: $color-muted;
}

.world-section-head {
  align-items: center;
  gap: 18rpx;
}

.world-section-copy {
  min-width: 0;
}

.country-view-toggle {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  flex: 0 0 auto;
  padding: 4rpx;
  border: 1rpx solid #cfd9d8;
  border-radius: 30rpx;
  background: #edf3f2;
}

.country-view-toggle__button {
  min-width: 82rpx;
  min-height: 50rpx;
  padding: 0 15rpx;
  border: 0;
  border-radius: 25rpx;
  font-size: 19rpx;
  font-weight: 900;
  color: #637377;
  line-height: 50rpx;
  background: transparent;
}

.country-view-toggle__button::after {
  border: 0;
}

.country-view-toggle__button--active {
  color: #ffffff;
  background: #2c8098;
  box-shadow: 0 4rpx 10rpx rgba(44, 128, 152, 0.2);
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
  width: 100%;
  min-width: 0;
  min-height: 244rpx;
  padding: 10rpx 8rpx 14rpx;
  text-align: center;
  background: transparent;
}

.country-card--learned {
  background: rgba(224, 243, 235, 0.55);
}

.country-card__done {
  position: absolute;
  top: 14rpx;
  right: 14rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42rpx;
  height: 42rpx;
  border: 3rpx solid #ffffff;
  border-radius: 50%;
  font-size: 22rpx;
  font-weight: 900;
  color: #ffffff;
  background: #3c9b76;
  box-shadow: 0 5rpx 12rpx rgba(35, 91, 70, 0.2);
}

.country-card__visual {
  display: block;
  width: 100%;
  height: 176rpx;
}

.country-card__visual--flag {
  width: 100%;
  background: transparent;
}

.country-card__name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9rpx;
  width: 100%;
  margin-top: 4rpx;
}

.country-card__en {
  display: block;
  max-width: calc(100% - 38rpx);
  font-size: 21rpx;
  font-weight: 900;
  color: #263f4b;
  line-height: 1.22;
  overflow-wrap: anywhere;
}

.country-card__play {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28rpx;
  height: 28rpx;
  flex: 0 0 28rpx;
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
