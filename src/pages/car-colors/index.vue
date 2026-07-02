<template>
  <view class="page car-page">
    <view class="car-hero soft-card">
      <text class="section-kicker">Color Cars</text>
      <text class="page-title">颜色汽车</text>
      <text class="page-subtitle">{{ target.task }} · {{ feedback }}</text>
    </view>

    <view class="quiz-card soft-card">
      <text class="quiz-card__title">Listen and tap!</text>
      <BigButton label="再听一次" @tap="askAgain" />
    </view>

    <view class="choice-grid">
      <view v-for="car in choices" :key="car.id" class="choice-card soft-card" @tap="choose(car.id)">
        <CartownVehicle :color="car.hex" accent="#FFD66B" kind="color-car" />
        <text class="choice-card__word">{{ car.label }}</text>
        <text class="choice-card__zh">{{ car.zh }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BigButton from "@/components/BigButton.vue";
import CartownVehicle from "@/components/CartownVehicle.vue";
import { colorCars } from "@/mock/cartown";
import { speakEnglish } from "@/services/audioService";
import { addCartownStar, getCartownProgress, saveCartownProgress } from "@/services/cartownProgressService";

const progress = getCartownProgress();
const targetIndex = ref(progress.colorQuestionsDone % colorCars.length);
const feedback = ref("听一听，选对颜色车。");
const target = computed(() => colorCars[targetIndex.value]);
const choices = computed(() => [target.value, colorCars[(targetIndex.value + 2) % colorCars.length], colorCars[(targetIndex.value + 4) % colorCars.length]]);

function askAgain() {
  speakEnglish(target.value.task);
}

function choose(id: string) {
  if (id !== target.value.id) {
    feedback.value = "Try again!";
    speakEnglish("Try again!");
    return;
  }

  feedback.value = "Great job!";
  speakEnglish("Great job!");
  addCartownStar();
  const nextDone = getCartownProgress().colorQuestionsDone + 1;
  saveCartownProgress({ colorQuestionsDone: nextDone });
  targetIndex.value = nextDone % colorCars.length;
}
</script>

<style scoped lang="scss">
.car-page {
  padding-bottom: 56rpx;
}

.car-hero,
.quiz-card {
  padding: 32rpx;
}

.car-hero {
  background:
    radial-gradient(circle at 92% 20%, rgba(255, 214, 107, 0.34), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 58%, #fff0dd 100%);
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
</style>
