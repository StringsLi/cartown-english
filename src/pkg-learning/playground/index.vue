<template>
  <view class="page playground-page screen-with-nav">
    <view class="playground-hero soft-card">
      <image class="playground-hero__image" :src="playgroundIllustration" mode="aspectFill" aria-label="苹果、小狮子、蓝色小汽车和绿叶" />
      <view class="playground-hero__copy">
        <text class="section-kicker">LITTLE ENGLISH PLAYGROUND</text>
        <text class="page-title">小小英语乐园</text>
        <text class="page-subtitle">选一个喜欢的主题，听一听、找一找，再到家里继续玩。</text>
      </view>
    </view>

    <view class="section-head">
      <text class="section-title">今天想玩什么？</text>
      <text class="playground-count">{{ completedCount }} / 4 玩过了</text>
    </view>
    <view class="topic-grid">
      <button
        v-for="topic in playgroundTopics"
        :key="topic.id"
        class="topic-card soft-card"
        :style="{ backgroundColor: topic.tint }"
        :aria-label="`开始${topic.title}英语游戏`"
        @tap="openTopic(topic.id)"
      >
        <text class="topic-card__symbol">{{ topic.symbol }}</text>
        <text class="topic-card__title">{{ topic.title }}</text>
        <text class="topic-card__english">{{ topic.english }}</text>
        <text class="topic-card__description">{{ topic.description }}</text>
        <text class="topic-card__action">{{ completedIds.includes(topic.id) ? "再玩一次" : "开始玩" }} ›</text>
      </button>
    </view>

    <view class="playground-note soft-card">
      <text class="playground-note__icon">♡</text>
      <view>
        <text class="playground-note__title">一次约 10 分钟</text>
        <text class="playground-note__body">孩子先用手指出来、做出动作，就已经在学习了。想停就停。</text>
      </view>
    </view>

    <view class="section-head"><text class="section-title">离线儿歌 · 一起跟读</text></view>
    <view v-for="topic in playgroundTopics" :key="`chant-${topic.id}`" class="chant-card soft-card">
      <view class="chant-card__copy">
        <text class="chant-card__title">{{ topic.symbol }} {{ topic.chantTitle }}</text>
        <text v-for="line in topic.chantLyrics" :key="line" class="chant-card__lyric">{{ line }}</text>
      </view>
      <button class="chant-card__play" :aria-label="`播放${topic.chantTitle}`" @tap="playChant(topic.chantAudio, topic.chantTitle)">▶</button>
    </view>

    <view class="section-head"><text class="section-title">家长一起玩</text></view>
    <view class="routine soft-card">
      <text class="routine__line">① 听提示，和孩子一起指一指。</text>
      <text class="routine__line">② 孩子自己选图，选错了就再听一次。</text>
      <text class="routine__line">③ 完成后关掉屏幕，玩线下小任务。</text>
    </view>
    <view v-for="topic in playgroundTopics" :key="topic.id" class="parent-topic soft-card">
      <view class="parent-topic__head">
        <text class="parent-topic__title">{{ topic.symbol }} {{ topic.title }}</text>
        <text class="parent-topic__phrase">{{ topic.parentPhrase }}</text>
      </view>
      <text class="parent-topic__tip">{{ topic.parentTip }}</text>
    </view>
    <text class="privacy-note">原创短儿歌与发音文件随小程序离线提供；主题进度只保存在当前设备。</text>

    <BottomNav active="learn" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onHide, onShow, onUnload } from "@dcloudio/uni-app";
import BottomNav from "@/components/BottomNav.vue";
import { playgroundTopics, type PlaygroundTopicId } from "@/mock/playground";
import { getCartownProgress } from "@/services/cartownProgressService";
import { usePageShare } from "@/composables/usePageShare";
import { playAudio, stopAudio } from "@/services/audioService";

usePageShare();
const playgroundIllustration = "/pkg-learning/static/playground/friends.jpg";
const completedIds = ref(getCartownProgress().playgroundCompletedTopicIds);
const completedCount = computed(() => completedIds.value.length);

onShow(() => {
  completedIds.value = [...getCartownProgress().playgroundCompletedTopicIds];
});
onHide(stopAudio);
onUnload(stopAudio);

function openTopic(topicId: PlaygroundTopicId) {
  uni.navigateTo({ url: `/pkg-learning/playground-game/index?topic=${topicId}` });
}

function playChant(audio: string, title: string) {
  playAudio(audio, title);
}
</script>

<style scoped lang="scss">
.playground-page { padding-bottom: 160rpx; }
.playground-hero { overflow: hidden; background: #e7eff1; }
.playground-hero__image { display: block; width: 100%; height: 270rpx; }
.playground-hero__copy { padding: 22rpx 26rpx 28rpx; }
.playground-hero .page-subtitle { max-width: 580rpx; }
.playground-count { font-size: 21rpx; font-weight: 800; color: $color-muted; }
.topic-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16rpx; }
.topic-card { display: flex; flex-direction: column; align-items: flex-start; min-height: 288rpx; padding: 23rpx; text-align: left; }
.topic-card__symbol { font-size: 57rpx; line-height: 1.2; }
.topic-card__title,.topic-card__english,.topic-card__description,.topic-card__action { display: block; }
.topic-card__title { margin-top: 16rpx; font-size: 29rpx; font-weight: 900; color: $color-primary-dark; }
.topic-card__english { margin-top: 3rpx; font-size: 21rpx; font-weight: 800; color: #4f6779; }
.topic-card__description { margin-top: 9rpx; font-size: 19rpx; color: $color-muted; line-height: 1.4; }
.topic-card__action { margin-top: auto; padding-top: 16rpx; font-size: 21rpx; font-weight: 900; color: $color-primary; }
.playground-note { display: grid; grid-template-columns: 50rpx 1fr; gap: 13rpx; align-items: center; margin-top: 24rpx; padding: 20rpx; background: #fff6df; }
.playground-note__icon { font-size: 35rpx; color: #a96d35; }
.playground-note__title,.playground-note__body { display: block; }
.playground-note__title { font-size: 23rpx; font-weight: 900; }
.playground-note__body { margin-top: 5rpx; font-size: 20rpx; color: $color-muted; line-height: 1.5; }
.chant-card { display: grid; grid-template-columns: 1fr 72rpx; gap: 14rpx; align-items: center; margin-top: 14rpx; padding: 20rpx 24rpx; background: #f7f3e9; }
.chant-card__title,.chant-card__lyric { display: block; }
.chant-card__title { margin-bottom: 8rpx; font-size: 23rpx; font-weight: 900; color: $color-primary-dark; }
.chant-card__lyric { font-size: 19rpx; line-height: 1.5; color: $color-muted; }
.chant-card__play { width: 68rpx; height: 68rpx; border-radius: 50%; font-size: 26rpx; color: #fff; background: $color-primary; }
.routine { padding: 20rpx 24rpx; }
.routine__line { display: block; padding: 7rpx 0; font-size: 21rpx; line-height: 1.5; }
.parent-topic { margin-top: 14rpx; padding: 22rpx 24rpx; }
.parent-topic__head { display: flex; justify-content: space-between; align-items: center; gap: 10rpx; }
.parent-topic__title { font-size: 23rpx; font-weight: 900; }
.parent-topic__phrase { font-size: 19rpx; color: $color-primary; text-align: right; }
.parent-topic__tip { display: block; margin-top: 12rpx; font-size: 20rpx; color: $color-muted; line-height: 1.55; }
.privacy-note { display: block; margin: 24rpx 4rpx 0; font-size: 18rpx; line-height: 1.5; color: $color-muted; }
</style>
