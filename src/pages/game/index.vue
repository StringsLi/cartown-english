<template>
  <view class="page game-page">
    <view class="game-hero soft-card">
      <text class="section-kicker">Listen and Choose</text>
      <text class="page-title">小游戏</text>
      <text class="page-subtitle">听一个单词，选出它。答对不是目标，愿意再听一次才是目标。</text>
    </view>

    <view v-if="!showResult && currentWord" class="quiz-card soft-card">
      <view class="quiz-card__top">
        <text class="quiz-card__count">Question {{ questionIndex + 1 }} / {{ totalQuestions }}</text>
        <text class="quiz-card__score">Score {{ score }}</text>
      </view>
      <text class="quiz-card__title">Listen. What do you hear?</text>
      <AudioButton label="播放单词" :src="currentWord.audio" size="large" />
    </view>

    <view v-if="!showResult" class="choice-grid">
      <button
        v-for="word in choices"
        :key="word.id"
        class="choice-card soft-card"
        :class="choiceClass(word.word)"
        @tap="chooseWord(word.word)"
      >
        <view class="choice-card__visual">
          <text class="choice-card__letter">{{ word.word.slice(0, 1).toUpperCase() }}</text>
        </view>
        <text class="choice-card__word">{{ word.word }}</text>
        <text class="choice-card__meaning">{{ word.meaning }}</text>
      </button>
    </view>

    <view v-if="!showResult" class="game-next">
      <BigButton :label="isLastQuestion ? '完成游戏' : '下一题'" :disabled="!selectedWord" @tap="nextQuestion" />
    </view>

    <view v-else class="result-card soft-card">
      <text class="result-card__en">Great job!</text>
      <text class="result-card__score">{{ score }} / {{ totalQuestions }}</text>
      <text class="result-card__cn">今天的小耳朵很认真。</text>
      <view class="result-card__actions">
        <BigButton label="再玩一次" variant="warm" @tap="restartGame" />
        <BigButton label="返回首页" variant="ghost" @tap="goHome" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AudioButton from "@/components/AudioButton.vue";
import BigButton from "@/components/BigButton.vue";
import { getBookById, getBookWords, getTodayBook } from "@/services/bookService";
import { saveGameRecord } from "@/services/progressService";
import type { Word } from "@/types/book";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const bookId = ref(getTodayBook().id);
const questionIndex = ref(0);
const selectedWord = ref("");
const score = ref(0);
const showResult = ref(false);
const savedResult = ref(false);

const book = computed(() => getBookById(bookId.value) ?? getTodayBook());
const words = computed(() => getBookWords(book.value.id));
const choices = computed<Word[]>(() => words.value);
const totalQuestions = computed(() => Math.max(words.value.length, 1));
const currentWord = computed(() => words.value[questionIndex.value] ?? words.value[0]);
const isLastQuestion = computed(() => questionIndex.value >= totalQuestions.value - 1);

onLoad((query) => {
  const params = query as Record<string, string | undefined>;
  bookId.value = params.bookId || getTodayBook().id;
});

function chooseWord(word: string) {
  if (selectedWord.value || !currentWord.value) {
    return;
  }

  selectedWord.value = word;

  if (word === currentWord.value.word) {
    score.value += 1;
  }
}

function choiceClass(word: string) {
  if (!selectedWord.value || !currentWord.value) {
    return "";
  }

  if (word === currentWord.value.word) {
    return "choice-card--correct";
  }

  return selectedWord.value === word ? "choice-card--wrong" : "";
}

function nextQuestion() {
  if (!selectedWord.value) {
    return;
  }

  if (isLastQuestion.value) {
    finishGame();
    return;
  }

  questionIndex.value += 1;
  selectedWord.value = "";
}

function finishGame() {
  showResult.value = true;

  if (!savedResult.value) {
    saveGameRecord({
      bookId: book.value.id,
      gameType: "listen_choose_image",
      score: score.value,
      total: totalQuestions.value
    });
    savedResult.value = true;
  }
}

function restartGame() {
  questionIndex.value = 0;
  selectedWord.value = "";
  score.value = 0;
  showResult.value = false;
  savedResult.value = false;
}

function goHome() {
  uni.reLaunch({ url: "/pages/index/index" });
}
</script>

<style scoped lang="scss">
.game-page {
  padding-bottom: 56rpx;
}

.game-hero {
  padding: 32rpx;
  background:
    radial-gradient(circle at 92% 20%, rgba(255, 214, 107, 0.34), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 58%, #fff0dd 100%);
}

.quiz-card {
  margin-top: 26rpx;
  padding: 30rpx;
  text-align: center;
}

.quiz-card__top {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 22rpx;
}

.quiz-card__count,
.quiz-card__score {
  font-size: 23rpx;
  font-weight: 900;
  color: $color-muted;
}

.quiz-card__title {
  display: block;
  margin-bottom: 28rpx;
  font-size: 38rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.choice-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 24rpx;
}

.choice-card {
  min-height: 246rpx;
  padding: 20rpx 12rpx;
  text-align: center;
  transition: transform 0.16s ease;
}

.choice-card:active {
  transform: scale(0.98);
}

.choice-card--correct {
  border-color: rgba(145, 216, 168, 0.8);
  background: rgba(145, 216, 168, 0.22);
}

.choice-card--wrong {
  border-color: rgba(255, 159, 122, 0.8);
  background: rgba(255, 159, 122, 0.18);
}

.choice-card__visual {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100rpx;
  height: 100rpx;
  margin: 0 auto 18rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, $color-sky-soft 0%, #ffffff 100%);
}

.choice-card__letter {
  font-size: 48rpx;
  font-weight: 900;
  color: $color-primary;
}

.choice-card__word {
  display: block;
  font-size: 30rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.choice-card__meaning {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  color: $color-muted;
}

.game-next {
  margin-top: 26rpx;
}

.result-card {
  margin-top: 28rpx;
  padding: 34rpx 30rpx;
  text-align: center;
}

.result-card__en,
.result-card__score,
.result-card__cn {
  display: block;
}

.result-card__en {
  font-size: 46rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.result-card__score {
  margin-top: 18rpx;
  font-size: 64rpx;
  font-weight: 900;
  color: $color-primary;
}

.result-card__cn {
  margin-top: 12rpx;
  font-size: 27rpx;
  color: $color-muted;
}

.result-card__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 30rpx;
}
</style>
