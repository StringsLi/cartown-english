<template>
  <view class="page playground-game-page">
    <view class="topbar"><button class="back-link" @tap="goTopics">‹ 乐园地图</button><text class="topbar__tag">{{ topic.english }} · {{ topic.items.length }} 个小伙伴</text></view>
    <view class="game-heading"><text class="section-kicker">LET'S PLAY TOGETHER</text><text class="page-title">{{ topic.title }}</text><text class="page-subtitle">{{ mode === 'learn' ? '点点图片，听听它的英语名字。' : '听一听，找到正确的图片。' }}</text></view>
    <view class="mode-tabs"><button :class="{ 'mode-tabs__active': mode === 'learn' }" @tap="switchMode('learn')">① 点图听词</button><button :class="{ 'mode-tabs__active': mode === 'quiz' }" @tap="switchMode('quiz')">② 听音找图</button></view>

    <view v-if="mode === 'learn'" class="learn-panel">
      <view class="flashcard" :style="{ backgroundColor: topic.tint }">
        <view class="flashcard__top"><text>认识新朋友</text><text>{{ wordIndex + 1 }} / {{ topic.items.length }}</text></view>
        <button class="flashcard__picture" :aria-label="`听${learningItem.word}的发音`" @tap="playWord"><image :src="learningItem.art" mode="aspectFit" /></button>
        <text class="flashcard__word">{{ learningItem.word }}</text><text class="flashcard__label">{{ learningItem.label }}</text>
        <button class="word-play" :style="{ backgroundColor: topic.accent }" @tap="playWord">▶ 听一听，再说一说</button>
        <text class="flashcard__hint">{{ heardIds.includes(`${topic.id}:${learningItem.id}`) ? '听过啦，随时可以再听一次' : '轻轻点一下图片，也可以听哦' }}</text>
      </view>
      <view class="word-navigation"><button :disabled="wordIndex === 0" @tap="moveWord(-1)">‹ 上一个</button><view class="word-dots"><view v-for="(item, index) in topic.items" :key="item.id" :class="{ 'word-dots__active': index === wordIndex }" /></view><button :disabled="wordIndex === topic.items.length - 1" @tap="moveWord(1)">下一个 ›</button></view>
      <view class="word-strip"><button v-for="(item, index) in topic.items" :key="item.id" :class="{ 'word-strip__active': index === wordIndex }" :aria-label="`点读${item.word}`" @tap="selectWord(index)"><image :src="item.art" mode="aspectFit" /><text>{{ item.label }}</text></button></view>
      <BigButton class="start-quiz" label="认识啦，去听音找图 ›" @tap="switchMode('quiz')" />
    </view>

    <view v-else-if="!finished" class="question-card">
      <view class="question-card__head"><text>小耳朵，准备好了吗？</text><text>{{ questionIndex + 1 }} / {{ topic.items.length }}</text></view>
      <view class="question-progress"><view v-for="(item, index) in questionOrder" :key="item.id" :class="{ 'question-progress__done': index < questionIndex || (index === questionIndex && answered), 'question-progress__current': index === questionIndex }" /></view>
      <text class="question-card__prompt">{{ currentItem.prompt }}</text><button class="listen-button" @tap="playPrompt"><text class="listen-button__icon">▶</text><text>听英语提示</text><text class="listen-button__again">可以反复听</text></button>
      <view class="choice-grid"><button v-for="choice in choices" :key="choice.id" class="choice-card" :class="{ 'choice-card--correct': answered && choice.id === currentItem.id, 'choice-card--wrong': wrongChoiceId === choice.id }" :disabled="answered" :aria-label="choice.label" @tap="choose(choice.id)"><image class="choice-card__art" :src="choice.art" mode="aspectFit" /><text class="choice-card__label">{{ choice.label }}</text><text v-if="answered && choice.id === currentItem.id" class="choice-card__check">✓</text></button></view>
      <view class="question-card__feedback" :class="{ 'question-card__feedback--retry': wrongChoiceId && !answered }" aria-live="polite"><text>{{ feedback || '选一张图片，试一试吧。' }}</text></view>
      <BigButton v-if="answered" :label="isLastQuestion ? '完成冒险，收集印章 ★' : '下一题 ›'" variant="warm" @tap="next" />
    </view>

    <view v-else class="complete-card"><view class="complete-card__medal"><image :src="topic.items[0].art" mode="aspectFit" /><text>★</text></view><text class="complete-card__title">冒险完成啦！</text><text class="complete-card__subtitle">{{ earnedStar ? '新印章 +1 · 获得一颗星星' : '又探索了一次，真棒！' }}</text><view class="offline-task"><text class="offline-task__heading">♡ 现在，到生活里玩一玩</text><text class="offline-task__body">{{ topic.offlineTask }}</text></view><BigButton :label="`下一站：${nextTopic.title} ›`" @tap="goNextTopic" /><button class="replay-button" @tap="restart">↻ 再玩一次这个主题</button></view>

    <view class="section-head"><text class="section-title">③ 听故事，唱儿歌</text><text class="section-caption">和家长一起</text></view>
    <view class="story-card"><view class="media-heading"><view class="media-heading__icon">▤</view><view><text class="media-heading__kicker">MINI STORY · 迷你故事</text><text class="media-heading__title">{{ topic.storyTitle }}</text></view><button class="round-play" aria-label="播放迷你故事" @tap="playStory">▶</button></view><text class="story-card__body">{{ topic.story }}</text><button class="translation-toggle" @tap="showTranslation = !showTranslation">{{ showTranslation ? '收起中文提示 −' : '家长看中文提示 +' }}</button><text v-if="showTranslation" class="story-card__translation">{{ topic.storyTranslation }}</text></view>
    <view class="story-card chant-card" :style="{ backgroundColor: topic.tint }"><view class="media-heading"><view class="media-heading__icon">♫</view><view><text class="media-heading__kicker">SING & MOVE · 节奏跟读</text><text class="media-heading__title">{{ topic.chantTitle }}</text></view><button class="round-play" :aria-label="`播放${topic.chantTitle}`" @tap="playChant">▶</button></view><text v-for="line in topic.chantLyrics" :key="line" class="story-card__body">{{ line }}</text></view>
    <button class="stop-button" @tap="stopAudio">■ 停止播放</button>
    <view class="parent-card"><text class="parent-card__kicker">陪玩锦囊</text><text class="parent-card__phrase">“{{ topic.parentPhrase }}”</text><text class="parent-card__tip">{{ topic.parentTip }}</text></view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onHide, onLoad, onUnload } from "@dcloudio/uni-app";
import BigButton from "@/components/BigButton.vue";
import { getPlaygroundTopic, getSuggestedPlaygroundTopic, playgroundTopics, type PlaygroundItem } from "@/mock/playground";
import { playAudio, stopAudio } from "@/services/audioService";
import { completePlaygroundTopic, getCartownProgress, recordPlaygroundWord } from "@/services/cartownProgressService";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const topic = ref(playgroundTopics[0]);
const mode = ref<"learn" | "quiz">("learn");
const wordIndex = ref(0);
const heardIds = ref([...getCartownProgress().playgroundHeardWordIds]);
const questionIndex = ref(0);
const questionOrder = ref<PlaygroundItem[]>([...topic.value.items]);
const choices = ref<PlaygroundItem[]>([]);
const answered = ref(false);
const finished = ref(false);
const earnedStar = ref(false);
const wrongChoiceId = ref("");
const feedback = ref("");
const showTranslation = ref(false);
const learningItem = computed(() => topic.value.items[wordIndex.value]);
const currentItem = computed(() => questionOrder.value[questionIndex.value]);
const isLastQuestion = computed(() => questionIndex.value === questionOrder.value.length - 1);
const nextTopic = computed(() => getSuggestedPlaygroundTopic(getCartownProgress().playgroundCompletedTopicIds));

onLoad((query) => {
  const params = query as Record<string, string | undefined>;
  topic.value = getPlaygroundTopic(params.topic ?? "") ?? playgroundTopics[0];
  resetQuiz();
  if (params.mode === "quiz") mode.value = "quiz";
});
onHide(stopAudio);
onUnload(stopAudio);

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function setChoices() {
  const distractors = shuffled(topic.value.items.filter(item => item.id !== currentItem.value.id)).slice(0, 2);
  choices.value = shuffled([currentItem.value, ...distractors]);
}
function resetQuiz() {
  questionIndex.value = 0;
  questionOrder.value = shuffled(topic.value.items);
  answered.value = false;
  finished.value = false;
  earnedStar.value = false;
  wrongChoiceId.value = "";
  feedback.value = "";
  setChoices();
}
function switchMode(nextMode: "learn" | "quiz") { stopAudio(); mode.value = nextMode; }
function playWord() {
  const item = learningItem.value;
  const topicId = topic.value.id;
  playAudio(item.wordAudio, item.word, () => {
    heardIds.value = [...recordPlaygroundWord(topicId, item.id).playgroundHeardWordIds];
  });
}
function moveWord(delta: number) {
  const index = wordIndex.value + delta;
  if (index < 0 || index >= topic.value.items.length) return;
  stopAudio(); wordIndex.value = index;
}
function selectWord(index: number) { wordIndex.value = index; playWord(); }
function playPrompt() { playAudio(currentItem.value.audio, currentItem.value.prompt); }
function playStory() { playAudio(topic.value.storyAudio, topic.value.story); }
function playChant() { playAudio(topic.value.chantAudio, topic.value.chantTitle); }
function choose(id: string) {
  if (answered.value) return;
  if (id !== currentItem.value.id) {
    wrongChoiceId.value = id; feedback.value = "没关系，再听一次，慢慢找。"; playPrompt(); return;
  }
  answered.value = true; wrongChoiceId.value = "";
  feedback.value = `找到了！${currentItem.value.word} · ${currentItem.value.label}`;
  playAudio(currentItem.value.wordAudio, currentItem.value.word);
}
function next() {
  if (!answered.value) return;
  stopAudio();
  if (!isLastQuestion.value) {
    questionIndex.value += 1; answered.value = false; wrongChoiceId.value = ""; feedback.value = ""; setChoices(); return;
  }
  earnedStar.value = completePlaygroundTopic(topic.value.id).earned;
  finished.value = true;
}
function restart() { stopAudio(); resetQuiz(); }
function goTopics() { stopAudio(); uni.redirectTo({ url: "/pkg-learning/playground/index" }); }
function goNextTopic() { stopAudio(); uni.redirectTo({ url: `/pkg-learning/playground-game/index?topic=${nextTopic.value.id}` }); }
</script>

<style scoped lang="scss">
.playground-game-page { padding-bottom: calc(50rpx + env(safe-area-inset-bottom)); }
.topbar { display: flex; align-items: center; justify-content: space-between; margin: 8rpx 0 32rpx; }
.back-link { font-size: 23rpx; font-weight: 800; color: #89725d; padding: 12rpx 0; }
.topbar__tag { font-size: 19rpx; color: #a3988b; }
.game-heading .section-kicker { font-size: 18rpx; letter-spacing: 2rpx; }
.game-heading .page-title { font-size: 42rpx; }
.game-heading .page-subtitle { font-size: 24rpx; }
.mode-tabs { display: flex; gap: 8rpx; padding: 8rpx; margin: 26rpx 0; border-radius: 24rpx; background: #eee8de; }
.mode-tabs button { display: flex; align-items: center; justify-content: center; flex: 1; min-height: 68rpx; font-size: 25rpx; font-weight: 800; border-radius: 18rpx; color: #988b7c; }
.mode-tabs .mode-tabs__active { background: #fffdf9; color: $color-primary-dark; box-shadow: 0 4rpx 12rpx #7461420a; }
.flashcard { padding: 24rpx; border-radius: 32rpx; text-align: center; }
.flashcard__top { display: flex; justify-content: space-between; font-size: 20rpx; color: #8c7c6e; }
.flashcard__picture { display: block; width: 100%; margin: 18rpx 0 0; }
.flashcard__picture image { display: block; width: 100%; height: 250rpx; }
.flashcard__word { display: block; margin-top: 0; font-size: 58rpx; font-weight: 900; letter-spacing: 1rpx; color: $color-primary-dark; }
.flashcard__label { display: block; margin-top: 9rpx; font-size: 26rpx; color: #8a7969; }
.word-play { display: flex; align-items: center; justify-content: center; width: 360rpx; min-height: 75rpx; margin: 24rpx auto 0; border-radius: 24rpx; color: #fff; font-size: 25rpx; font-weight: 800; }
.flashcard__hint { display: block; margin: 16rpx 0 4rpx; font-size: 18rpx; color: #998675; }
.word-navigation { display: flex; align-items: center; justify-content: space-between; gap: 14rpx; margin: 20rpx 0; }
.word-navigation button { padding: 16rpx 8rpx; font-size: 23rpx; color: #867363; font-weight: 700; }
.word-navigation button[disabled] { opacity: .3; background: transparent; }
.word-dots { display: flex; gap: 10rpx; }
.word-dots view { width: 10rpx; height: 10rpx; border-radius: 50%; background: #dcd4c9; }
.word-dots .word-dots__active { background: #b98060; width: 26rpx; border-radius: 8rpx; }
.word-strip { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 8rpx; }
.word-strip button { display: flex; flex-direction: column; align-items: center; padding: 10rpx 4rpx 14rpx; border: 2rpx solid #ece6dc; border-radius: 20rpx; background: #fffdf9; }
.word-strip image { width: 96rpx; height: 76rpx; }
.word-strip text { font-size: 20rpx; color: #8b7d6d; }
.word-strip .word-strip__active { border-color: #c8aa8b; background: #f4ecdf; }
.start-quiz { margin-top: 24rpx; }
.question-card { padding: 26rpx; border: 1rpx solid #ebe3d7; border-radius: 32rpx; background: #fffdf9; }
.question-card__head { display: flex; justify-content: space-between; font-size: 20rpx; color: #988674; }
.question-progress { display: flex; gap: 8rpx; margin: 20rpx 0 26rpx; }
.question-progress view { flex: 1; height: 8rpx; border-radius: 8rpx; background: #eee9e0; }
.question-progress .question-progress__current { background: #ead2a2; }
.question-progress .question-progress__done { background: #9bb68c; }
.question-card__prompt { display: block; min-height: 58rpx; font-size: 34rpx; font-weight: 900; line-height: 1.35; color: $color-primary-dark; }
.listen-button { display: flex; align-items: center; gap: 14rpx; width: 100%; padding: 18rpx; margin-top: 18rpx; border-radius: 22rpx; background: #eaf0f2; font-size: 25rpx; font-weight: 800; color: #4e7580; }
.listen-button__icon { display: flex; align-items: center; justify-content: center; width: 50rpx; height: 50rpx; border-radius: 50%; color: #fff; background: #7598a3; font-size: 19rpx; }
.listen-button__again { margin-left: auto; font-size: 17rpx; color: #8c9a9d; font-weight: 400; }
.choice-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12rpx; margin-top: 24rpx; }
.choice-card { position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 16rpx 4rpx; border: 3rpx solid #eee6da; border-radius: 24rpx; background: #fbf7ef; }
.choice-card--correct { border-color: #94b68b; background: #edf5e9; }
.choice-card--wrong { border-color: #dbb491; background: #fbf0e4; }
.choice-card__art { width: 172rpx; height: 152rpx; }
.choice-card__label { display: block; font-size: 23rpx; font-weight: 800; color: $color-primary-dark; }
.choice-card__check { position: absolute; right: 10rpx; top: 8rpx; color: #739866; font-size: 25rpx; }
.question-card__feedback { display: flex; align-items: center; justify-content: center; min-height: 80rpx; padding: 14rpx 0; font-size: 23rpx; line-height: 1.5; color: #6c8c62; }
.question-card__feedback--retry { color: #ad7f51; }
.complete-card { padding: 32rpx 28rpx 20rpx; text-align: center; border: 1rpx solid #e7decf; border-radius: 32rpx; background: #fffdf9; }
.complete-card__medal { position: relative; width: 176rpx; height: 176rpx; margin: 0 auto; border: 6rpx double #d7bb79; border-radius: 50%; background: #fff3d8; }
.complete-card__medal image { width: 150rpx; height: 126rpx; margin-top: 18rpx; }
.complete-card__medal text { position: absolute; right: -6rpx; bottom: -2rpx; font-size: 48rpx; color: #d3aa4c; }
.complete-card__title { display: block; margin-top: 24rpx; font-size: 37rpx; font-weight: 900; }
.complete-card__subtitle { display: block; margin-top: 12rpx; font-size: 23rpx; color: #b48d48; }
.offline-task { margin: 28rpx 0; padding: 24rpx; border-radius: 24rpx; background: #eef2e7; text-align: left; }
.offline-task__heading,.offline-task__body { display: block; }
.offline-task__heading { font-size: 21rpx; font-weight: 800; color: #768565; }
.offline-task__body { margin-top: 12rpx; font-size: 25rpx; line-height: 1.7; }
.replay-button { width: 100%; padding: 26rpx; font-size: 23rpx; color: #958572; }
.section-caption { font-size: 19rpx; color: #a09589; }
.story-card { padding: 26rpx; margin-top: 16rpx; border-radius: 28rpx; border: 1rpx solid #eae3d8; background: #fffdf9; }
.media-heading { display: grid; grid-template-columns: 60rpx 1fr 64rpx; gap: 12rpx; align-items: center; margin-bottom: 20rpx; }
.media-heading__icon { display: flex; align-items: center; justify-content: center; width: 58rpx; height: 58rpx; border-radius: 18rpx; background: #f2e8d6; color: #ac8c5c; font-size: 30rpx; }
.media-heading__kicker,.media-heading__title { display: block; }
.media-heading__kicker { font-size: 16rpx; color: #a29789; }
.media-heading__title { margin-top: 9rpx; font-size: 27rpx; font-weight: 800; }
.round-play { display: flex; align-items: center; justify-content: center; width: 64rpx; height: 64rpx; border-radius: 50%; background: #f5eee3; color: #a67d55; font-size: 24rpx; }
.story-card__body { display: block; font-size: 25rpx; line-height: 1.75; color: #67707a; }
.translation-toggle { margin-top: 18rpx; font-size: 19rpx; color: #a09384; text-align: left; }
.story-card__translation { display: block; margin-top: 14rpx; font-size: 22rpx; line-height: 1.65; color: #a09384; }
.chant-card { border-color: transparent; }
.chant-card .round-play { background: #fffdf9; }
.stop-button { display: block; width: 100%; padding: 20rpx; margin-top: 12rpx; font-size: 20rpx; color: #a09384; }
.parent-card { padding: 24rpx; border-radius: 26rpx; background: #f3eddf; margin-top: 20rpx; }
.parent-card__kicker,.parent-card__phrase,.parent-card__tip { display: block; }
.parent-card__kicker { font-size: 18rpx; font-weight: 800; color: #a58b66; }
.parent-card__phrase { margin-top: 14rpx; font-size: 28rpx; font-weight: 800; color: #997951; }
.parent-card__tip { margin-top: 14rpx; font-size: 22rpx; line-height: 1.7; color: #958674; }
</style>
