<template>
  <view class="page topic-page">
    <view class="topic-hero">
      <text class="topic-hero__eyebrow">World Map</text>
      <text class="page-title">地图和国家英语</text>
      <text class="page-subtitle">从 map、country、flag 开始，看见世界的一小角。</text>
    </view>

    <view class="map-card soft-card">
      <image class="map-card__image" :src="heroMapImage" mode="aspectFit" />
      <view class="map-card__copy">
        <text class="map-card__label">今天先会说</text>
        <text class="map-card__en">This is a map.</text>
        <text class="map-card__cn">这是一张地图。</text>
      </view>
    </view>

    <view v-for="group in worldGroups" :key="group.id" class="topic-section">
      <text class="section-title">{{ group.title }}</text>
      <text class="topic-section__subtitle">{{ group.subtitle }}</text>
      <view class="word-list">
        <view v-for="item in group.words" :key="item.id" class="world-word soft-card" @tap="playTopicWord(item.audio)">
          <view class="world-word__pin">
            <image class="world-word__image" :src="item.image" mode="aspectFit" />
          </view>
          <view class="world-word__content">
            <text class="world-word__word">{{ item.word }}</text>
            <text class="world-word__phonetic">{{ item.phonetic }}</text>
            <text class="world-word__meaning">{{ item.meaning }}</text>
            <text class="world-word__sentence">{{ item.sentence }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { worldGroups } from "@/mock/topics";
import { mapIcon } from "@/mock/topicAssets";
import { playAudio } from "@/services/audioService";

const heroMapImage = mapIcon("world-map");

function playTopicWord(audio: string) {
  playAudio(audio);
}
</script>

<style scoped lang="scss">
.topic-page {
  padding-bottom: 48rpx;
}

.topic-hero {
  padding: 34rpx 30rpx;
  border: 1rpx solid rgba(95, 143, 132, 0.12);
  border-radius: 32rpx;
  background:
    radial-gradient(circle at 84% 18%, rgba(232, 201, 111, 0.28), transparent 32%),
    linear-gradient(135deg, #dfeee7 0%, #fffef9 60%, #eef3ec 100%);
}

.topic-hero__eyebrow {
  display: block;
  margin-bottom: 12rpx;
  font-size: 25rpx;
  font-weight: 900;
  color: #3f6f67;
}

.map-card {
  display: grid;
  grid-template-columns: 180rpx 1fr;
  gap: 24rpx;
  align-items: center;
  margin-top: 28rpx;
  padding: 30rpx;
}

.map-card__image {
  width: 164rpx;
  height: 164rpx;
}

.map-card__label,
.map-card__cn {
  display: block;
  font-size: 24rpx;
  color: #6f7c75;
}

.map-card__en {
  display: block;
  margin: 12rpx 0 10rpx;
  font-size: 38rpx;
  font-weight: 900;
  color: #1f332f;
}

.topic-section__subtitle {
  display: block;
  margin: -8rpx 0 20rpx;
  font-size: 25rpx;
  color: #6f7c75;
}

.word-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.world-word {
  display: grid;
  grid-template-columns: 104rpx 1fr;
  gap: 20rpx;
  align-items: center;
  padding: 22rpx;
}

.world-word__pin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  background: #e4eee9;
}

.world-word__image {
  width: 78rpx;
  height: 78rpx;
}

.world-word__word {
  display: block;
  font-size: 31rpx;
  font-weight: 900;
  color: #1f332f;
}

.world-word__phonetic,
.world-word__meaning,
.world-word__sentence {
  display: block;
  margin-top: 6rpx;
  font-size: 23rpx;
  color: #6f7c75;
  line-height: 1.45;
}

.world-word__meaning {
  color: #3f6f67;
  font-weight: 800;
}
</style>
