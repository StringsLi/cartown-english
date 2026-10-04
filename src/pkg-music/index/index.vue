<template>
  <view class="page playground-page screen-with-nav">
    <view class="welcome-row"><view><text class="section-kicker">LITTLE MUSIC RADIO</text><text class="page-title">小小儿歌电台</text></view><view class="star-pocket">♫</view></view>
    <text class="welcome-subtitle">听一小段，唱一小段，快乐就是进步。</text>
    <view class="content-tabs"><button role="button" class="content-tabs__tab" @tap="openTopics">主题小世界</button><button role="button" class="content-tabs__tab content-tabs__tab--active" aria-current="page">儿歌电台</button><button role="button" class="content-tabs__tab" @tap="openParent">亲子任务</button></view>
    <AudioFeedback />
    <view id="chants-panel">
      <view class="section-head"><text class="section-title">小小儿歌电台</text><text class="section-caption">{{ playgroundTopics.length }} 首原创跟读儿歌</text></view>
      <text class="section-intro">听着轻柔的旋律，和孩子一起念、一起动。</text>
      <view v-for="topic in playgroundTopics" :key="`chant-${topic.id}`" class="chant-card" :style="{ backgroundColor: topic.tint }">
        <view class="chant-card__heading"><image class="chant-card__art" :src="chantArt(topic)" mode="aspectFit" /><view><text class="chant-card__title">{{ topic.chantTitle }}</text><text class="chant-card__tag">{{ topic.english }} · 节奏跟读</text></view><button role="button" class="round-play" :aria-label="`播放${topic.chantTitle}`" @tap="playChant(topic.chantAudio, topic.chantTitle)">▶</button></view>
        <text v-for="line in topic.chantLyrics" :key="line" class="chant-card__lyric">{{ line }}</text>
        <button role="button" class="chant-card__link" @tap="openTopic(topic.id)">去认识这首歌的小伙伴 ›</button>
      </view>
      <button role="button" class="stop-button" @tap="stopAudio">■ 停止播放</button>
    </view>

    <view class="gentle-note"><text>♡</text><text>唱完走一走，和孩子一起做个小动作。</text></view>
    <text class="privacy-note">8 首原创节奏跟读儿歌；加载完成后可离线播放。</text>
    <BottomNav active="learn" />
  </view>
</template>
<script setup lang="ts">
import AudioFeedback from "@/components/AudioFeedback.vue";
import BottomNav from "@/components/BottomNav.vue";
import { playgroundTopics, type PlaygroundTopic, type PlaygroundTopicId } from "@/mock/playground";
import { navigate } from "@/services/navigationService";
import { playAudio, stopAudio } from "@/services/audioService";
import { usePageShare } from "@/composables/usePageShare";
usePageShare();
const chantArt = (topic: PlaygroundTopic) => `/pkg-music/static/art/${topic.items[0].art.split("/").pop()}`;
function playChant(audio: string, title: string) { playAudio(audio, title); }
function openTopic(id: PlaygroundTopicId) { navigate({ url: `/pkg-learning/playground-game/index?topic=${id}` }); }
function openTopics() { navigate({ url: "/pkg-learning/playground/index" }, "redirectTo"); }
function openParent() { navigate({ url: "/pkg-learning/playground/index?tab=parent" }, "redirectTo"); }
</script>
<style scoped lang="scss">
.playground-page { padding-top: 36rpx; }
.welcome-row { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.welcome-row .section-kicker { font-size: 18rpx; letter-spacing: 2rpx; margin-bottom: 12rpx; }
.welcome-row .page-title { font-size: 42rpx; }
.welcome-subtitle { display: block; margin-top: 14rpx; font-size: 24rpx; color: $color-muted; }
.star-pocket { display: flex; align-items: center; gap: 10rpx; padding: 16rpx 20rpx; border-radius: 24rpx; background: #f5e9cc; font-size: 25rpx; font-weight: 800; color: #967332; }
.star-pocket text:first-child { color: #bf8e3a; }
.content-tabs { position: sticky; top: 0; z-index: 10; display: flex; gap: 6rpx; padding: 8rpx; margin-top: 28rpx; background: #eee9e0; border-radius: 24rpx; }
.content-tabs__tab { display: flex; align-items: center; justify-content: center; flex: 1; min-height: 44px; border-radius: 18rpx; font-size: 23rpx; font-weight: 800; color: #8a8379; }
.content-tabs__tab--active { color: $color-primary-dark; background: #fffdf9; box-shadow: 0 4rpx 10rpx #63513b0a; }
.section-caption { font-size: 19rpx; color: #948779; }
.section-intro { display: block; margin: 10rpx 0 20rpx; font-size: 22rpx; color: $color-muted; line-height: 1.6; }
.chant-card { padding: 24rpx; border-radius: 28rpx; margin-bottom: 18rpx; }
.chant-card__heading { display: grid; grid-template-columns: 94rpx minmax(0,1fr) 44px; align-items: center; gap: 12rpx; margin-bottom: 16rpx; }
.chant-card__art { width: 94rpx; height: 80rpx; }
.chant-card__title,.chant-card__tag,.chant-card__lyric { display: block; }
.chant-card__title { font-size: 27rpx; font-weight: 800; }
.chant-card__tag { font-size: 18rpx; color: $color-muted; margin-top: 9rpx; }
.round-play { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #fffdf9; color: $color-primary; font-size: 24rpx; }
.chant-card__lyric { font-size: 23rpx; line-height: 1.7; color: #615d56; }
.chant-card__link { display: flex; align-items: center; width: 100%; min-height: 44px; margin-top: 10rpx; font-size: 20rpx; color: #877561; text-align: left; }
.stop-button { min-height: 44px; padding: 22rpx; width: 100%; border-radius: 22rpx; background: #eee8de; font-size: 23rpx; color: #7d756a; }
.gentle-note { display: flex; align-items: center; justify-content: center; gap: 12rpx; margin: 34rpx 0 14rpx; font-size: 21rpx; color: #97836e; }
.gentle-note text:first-child { font-size: 30rpx; }
.privacy-note { display: block; text-align: center; font-size: 17rpx; color: #a09a91; line-height: 1.6; }
</style>
