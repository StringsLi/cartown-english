<template>
  <view class="page playground-game-page">
    <button class="back-link" @tap="goTopics">‹ 选别的主题</button>
    <view class="game-heading">
      <view>
        <text class="section-kicker">{{ topic.english }}</text>
        <text class="page-title">来玩{{ topic.title }}吧！</text>
        <text class="page-subtitle">{{ finished ? "今天玩得真棒！" : "听一听，找到正确的图片。" }}</text>
      </view>
      <text class="game-heading__progress">{{ finished ? "完成" : `${questionIndex + 1} / ${topic.items.length}` }}</text>
    </view>

    <view v-if="!finished" class="question-card soft-card">
      <text class="question-card__label">听一听 · 找一找</text>
      <text class="question-card__prompt">{{ currentItem.prompt }}</text>
      <BigButton label="▶ 听英语" @tap="playPrompt" />
      <view class="choice-grid">
        <button
          v-for="choice in choices"
          :key="choice.id"
          class="choice-card"
          :class="{
            'choice-card--correct': answered && choice.id === currentItem.id,
            'choice-card--wrong': wrongChoiceId === choice.id
          }"
          :disabled="answered"
          :aria-label="choice.label"
          @tap="choose(choice.id)"
        >
          <CartownVehicle v-if="choice.color" class="choice-card__car" :color="choice.color" kind="color-car" />
          <text v-else class="choice-card__symbol">{{ choice.symbol }}</text>
          <text class="choice-card__label">{{ choice.label }}</text>
        </button>
      </view>
      <text class="question-card__feedback" :class="{ 'question-card__feedback--retry': wrongChoiceId && !answered }" aria-live="polite">{{ feedback }}</text>
      <BigButton v-if="answered" :label="isLastQuestion ? '完成，去家里玩 ›' : '下一题 ›'" variant="warm" @tap="next" />
    </view>

    <view v-else class="complete-card soft-card">
      <text class="complete-card__star">★</text>
      <text class="complete-card__title">完成啦！</text>
      <text class="complete-card__subtitle">{{ earnedStar ? "第一次完成这个主题，获得一颗星星。" : "再玩一次也很棒！" }}</text>
      <view class="offline-task">
        <text class="offline-task__heading">离开屏幕的小任务</text>
        <text class="offline-task__body">{{ topic.offlineTask }}</text>
      </view>
      <view class="complete-actions">
        <BigButton label="再玩一次" variant="ghost" @tap="restart" />
        <BigButton label="选别的主题" @tap="goTopics" />
      </view>
    </view>

    <view class="story-card soft-card">
      <view>
        <text class="story-card__title">迷你故事</text>
        <text class="story-card__body">{{ topic.story }}</text>
      </view>
      <button class="story-card__play" aria-label="播放迷你故事" @tap="playStory">▶</button>
    </view>

    <view class="story-card chant-card soft-card">
      <view>
        <text class="story-card__title">{{ topic.chantTitle }} · 跟着节奏念</text>
        <text v-for="line in topic.chantLyrics" :key="line" class="story-card__body">{{ line }}</text>
      </view>
      <button class="story-card__play" :aria-label="`播放${topic.chantTitle}`" @tap="playChant">▶</button>
    </view>

    <view class="parent-card soft-card">
      <text class="parent-card__kicker">家长一起说</text>
      <text class="parent-card__phrase">{{ topic.parentPhrase }}</text>
      <text class="parent-card__tip">{{ topic.parentTip }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onHide, onLoad, onUnload } from "@dcloudio/uni-app";
import BigButton from "@/components/BigButton.vue";
import CartownVehicle from "@/components/CartownVehicle.vue";
import { getPlaygroundTopic, playgroundTopics, type PlaygroundItem } from "@/mock/playground";
import { playAudio, stopAudio } from "@/services/audioService";
import { completePlaygroundTopic } from "@/services/cartownProgressService";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const topic = ref(playgroundTopics[0]);
const questionIndex = ref(0);
const answered = ref(false);
const finished = ref(false);
const earnedStar = ref(false);
const wrongChoiceId = ref("");
const feedback = ref("");
const currentItem = computed(() => topic.value.items[questionIndex.value]);
const isLastQuestion = computed(() => questionIndex.value === topic.value.items.length - 1);
const choices = computed<PlaygroundItem[]>(() => {
  const items = topic.value.items;
  const index = questionIndex.value;
  const candidates = [items[index], items[(index + 1) % items.length], items[(index + 2) % items.length]];
  const shift = index % candidates.length;
  return [...candidates.slice(shift), ...candidates.slice(0, shift)];
});

onLoad((query) => {
  const requestedId = (query as Record<string, string | undefined>).topic ?? "";
  topic.value = getPlaygroundTopic(requestedId) ?? playgroundTopics[0];
});
onHide(stopAudio);
onUnload(stopAudio);

function playPrompt() {
  playAudio(currentItem.value.audio, currentItem.value.prompt);
}

function playStory() {
  playAudio(topic.value.storyAudio, topic.value.story);
}

function playChant() {
  playAudio(topic.value.chantAudio, topic.value.chantTitle);
}

function choose(id: string) {
  if (answered.value) return;
  if (id !== currentItem.value.id) {
    wrongChoiceId.value = id;
    feedback.value = "再听一次，慢慢找。";
    playPrompt();
    return;
  }
  answered.value = true;
  wrongChoiceId.value = "";
  feedback.value = `找到了！${currentItem.value.word} · ${currentItem.value.label}`;
}

function next() {
  if (!answered.value) return;
  if (!isLastQuestion.value) {
    questionIndex.value += 1;
    answered.value = false;
    wrongChoiceId.value = "";
    feedback.value = "";
    return;
  }
  const result = completePlaygroundTopic(topic.value.id);
  earnedStar.value = result.earned;
  finished.value = true;
  stopAudio();
}

function restart() {
  questionIndex.value = 0;
  answered.value = false;
  finished.value = false;
  earnedStar.value = false;
  wrongChoiceId.value = "";
  feedback.value = "";
}

function goTopics() {
  stopAudio();
  uni.redirectTo({ url: "/pkg-learning/playground/index" });
}
</script>

<style scoped lang="scss">
.playground-game-page { padding-bottom: 58rpx; }
.back-link { margin: 4rpx 0 26rpx; font-size: 22rpx; font-weight: 800; color: #287b92; }
.game-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 16rpx; margin-bottom: 26rpx; }
.game-heading__progress { flex: none; padding: 10rpx 16rpx; border-radius: $radius-pill; font-size: 21rpx; font-weight: 800; color: #59738a; background: #e7eff1; }
.question-card { padding: 25rpx; }
.question-card__label,.question-card__prompt,.question-card__feedback { display: block; }
.question-card__label { font-size: 21rpx; font-weight: 800; color: #70808a; }
.question-card__prompt { margin: 11rpx 0 22rpx; font-size: 36rpx; font-weight: 900; line-height: 1.25; color: $color-primary-dark; }
.question-card :deep(.big-button) { width: 100%; }
.choice-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 11rpx; margin-top: 23rpx; }
.choice-card { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 210rpx; overflow: hidden; padding: 12rpx 5rpx; border: 3rpx solid #e5e2d9; border-radius: $radius-card; background: #fff; }
.choice-card--correct { border-color: #79b98a; background: #ebf8ed; }
.choice-card--wrong { border-color: #d88d80; background: #fff2ef; }
.choice-card__car { transform: scale(0.7); transform-origin: center; }
.choice-card__symbol { display: block; font-size: 64rpx; line-height: 1.5; }
.choice-card__label { display: block; margin-top: 7rpx; font-size: 22rpx; font-weight: 900; color: $color-primary-dark; }
.question-card__feedback { min-height: 43rpx; margin: 19rpx 0 13rpx; font-size: 22rpx; font-weight: 800; color: #358461; }
.question-card__feedback--retry { color: #a15b29; }
.complete-card { padding: 29rpx; text-align: center; }
.complete-card__star { display: block; font-size: 65rpx; color: #e3ac2b; }
.complete-card__title { display: block; margin-top: 8rpx; font-size: 35rpx; font-weight: 900; color: $color-primary-dark; }
.complete-card__subtitle { display: block; margin-top: 8rpx; font-size: 21rpx; line-height: 1.5; color: $color-muted; }
.offline-task { margin: 25rpx 0; padding: 22rpx; border-radius: $radius-card; background: #eaf5e7; text-align: left; }
.offline-task__heading,.offline-task__body { display: block; }
.offline-task__heading { font-size: 21rpx; font-weight: 900; color: #4d775a; }
.offline-task__body { margin-top: 8rpx; font-size: 23rpx; line-height: 1.6; }
.complete-actions { display: flex; gap: 12rpx; }
.complete-actions :deep(.big-button) { flex: 1; font-size: 22rpx; }
.story-card { display: grid; grid-template-columns: 1fr 70rpx; gap: 16rpx; align-items: center; margin-top: 18rpx; padding: 23rpx; }
.story-card__title,.story-card__body { display: block; }
.story-card__title { font-size: 23rpx; font-weight: 900; }
.story-card__body { margin-top: 9rpx; font-size: 21rpx; line-height: 1.6; color: $color-muted; }
.story-card__play { width: 68rpx; height: 68rpx; border-radius: 50%; font-size: 26rpx; color: #fff; background: $color-primary; }
.chant-card { background: #f7f3e9; }
.parent-card { margin-top: 18rpx; padding: 23rpx; background: #fff5dd; }
.parent-card__kicker,.parent-card__phrase,.parent-card__tip { display: block; }
.parent-card__kicker { font-size: 19rpx; font-weight: 800; color: #9a6b2f; }
.parent-card__phrase { margin-top: 8rpx; font-size: 26rpx; font-weight: 900; color: #73501c; }
.parent-card__tip { margin-top: 10rpx; font-size: 20rpx; line-height: 1.55; color: #746447; }
</style>
