<template>
  <view class="page car-page">
    <PageTopbar section="听颜色 · 找小车" fallback="/pages/vehicles/index" />
    <AudioFeedback /><ReadAlongLink :source-key="'car-colors-' + target.id" :title="'颜色汽车'" :text="target.task" :audio="phraseAudioPath(target.task)" :return-url="'/pkg-cars/car-colors/index'"  />
    <view class="car-hero soft-card">
      <text class="section-kicker">Color Cars</text>
      <text class="page-title">颜色汽车</text>
      <text class="page-subtitle">{{ target.task }} · {{ feedback }}</text>
    </view>

    <view class="quiz-card soft-card">
      <text class="quiz-card__title">Listen and tap!</text>
      <BigButton :label="promptHeard ? '再听一次' : '先听英文提示'" @tap="askAgain" />
    </view>

    <text v-if="!answered" class="prompt-hint" role="status" aria-live="polite">{{ promptHint }}</text>
    <view class="choice-grid">
      <button role="button" v-for="car in choices" :key="car.id" class="choice-card soft-card" :class="{ 'choice-card--correct': answered && car.id === target.id }" :disabled="answered || !promptHeard" :aria-disabled="answered || !promptHeard" @tap="choose(car.id)">
        <view class="choice-card__vehicle">
          <PremiumVehicleImage :name="`color-car-${car.id}`" :alt="`${car.zh}小汽车`" />
        </view>
        <text class="choice-card__word">{{ car.label }}</text>
        <text class="choice-card__zh">{{ car.zh }}</text>
        <text v-if="answered && car.id === target.id" class="answer-mark">✓ 找到了</text>
      </button>
    </view>
    <BigButton class="round-next" label="下一题" variant="warm" :disabled="!answered" @tap="nextRound" />
  </view>
</template>

<script setup lang="ts">
import ReadAlongLink from "@/components/ReadAlongLink.vue";
import AudioFeedback from "@/components/AudioFeedback.vue";
import PageTopbar from "@/components/PageTopbar.vue";
import { shuffleChoices } from "@/utils/practice";
import { computed, ref } from "vue";
import BigButton from "@/components/BigButton.vue";
import PremiumVehicleImage from "@/components/PremiumVehicleImage.vue";
import { colorCars } from "@/mock/cartown";
import { phraseAudioPath } from "@/services/audioCatalog";
import { speakEnglish } from "@/services/audioService";
import { addCartownStar, getCartownProgress, saveCartownProgress } from "@/services/cartownProgressService";
import { useListeningPrompt } from "@/composables/useListeningPrompt";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const { promptHeard, promptHint, playPromptAudio, resetPrompt } = useListeningPrompt();
const progress = getCartownProgress();
const targetIndex = ref(progress.colorQuestionsDone % colorCars.length);
const answered = ref(false);
const feedback = ref("听一听，选对颜色车。");
const target = computed(() => colorCars[targetIndex.value]);
const choices = computed(() => shuffleChoices([target.value, colorCars[(targetIndex.value + 2) % colorCars.length], colorCars[(targetIndex.value + 4) % colorCars.length]]));

function askAgain() {
  playPromptAudio(phraseAudioPath(target.value.task), target.value.task);
}

function choose(id: string) {
  if (answered.value || !promptHeard.value || !choices.value.some(car => car.id === id)) return;
  if (id !== target.value.id) {
    feedback.value = "再听一次，慢慢找。";
    speakEnglish("Try again!");
    return;
  }

  answered.value = true;
  feedback.value = "选对啦！准备好再继续。";
  speakEnglish("Great job!");
  addCartownStar();
  const nextDone = getCartownProgress().colorQuestionsDone + 1;
  saveCartownProgress({ colorQuestionsDone: nextDone });

}
function nextRound() {
  if (!answered.value) return;
  resetPrompt();
  answered.value = false;
  targetIndex.value = (getCartownProgress().colorQuestionsDone) % colorCars.length;
  feedback.value = "先听一遍，再试一试。";
  playPromptAudio(phraseAudioPath(target.value.task), target.value.task);
}
</script>

<style scoped lang="scss">
.round-next { margin-top:24rpx; }
.prompt-hint { display:block; margin-top:18rpx; font-size:24rpx; line-height:1.7; color:$color-muted; text-align:center; }
.choice-card--correct { outline:3rpx solid #628a68; background:#edf4e9; }
.answer-mark { display:block; margin-top:10rpx; color:#477254; font-size:24rpx; font-weight:800; }
.car-page {
  padding-bottom: calc(56rpx + env(safe-area-inset-bottom));
}

.car-hero,
.quiz-card {
  padding: 32rpx;
}

.car-hero {
  background:
    radial-gradient(circle at 92% 20%, rgba(223, 166, 45, 0.16), transparent 34%),
    linear-gradient(135deg, #fffdf9 0%, #edf2e9 58%, #f7edda 100%);
}

.quiz-card {
  margin-top: 26rpx;
  text-align: center;
}

.quiz-card__title {
  display: block;
  margin-bottom: 24rpx;
  font-size: 42rpx;
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
  min-height: 300rpx;
  padding: 18rpx 12rpx;
  text-align: center;
}

.choice-card__vehicle {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: $radius-small;
  background: #eef2f3;
}

.choice-card__word,
.choice-card__zh {
  display: block;
}

.choice-card__word {
  margin-top: 8rpx;
  font-size: 30rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.choice-card__zh {
  margin-top: 6rpx;
  font-size: 23rpx;
  color: $color-muted;
}
.choice-grid .choice-card[disabled] { background:#fffdf8; color:$color-primary-dark; }
.choice-grid .choice-card--correct[disabled] { background:#edf4e9; }
</style>
