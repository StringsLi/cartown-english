<template>
  <view class="page car-page">
    <view class="car-hero soft-card">
      <text class="section-kicker">Count Cars</text>
      <text class="page-title">{{ challenge.count }}</text>
      <text class="page-subtitle">{{ challenge.task }} · {{ feedback }}</text>
    </view>

    <view class="count-grid">
      <view
        v-for="slot in slots"
        :key="slot"
        class="count-card soft-card"
        :class="{ 'count-card--active': tapped.includes(slot) }"
        @tap="tapCar(slot)"
      >
        <view class="count-card__vehicle">
          <PremiumVehicleImage :name="challenge.kind" :alt="challenge.vehicleZh" />
        </view>
      </view>
    </view>

    <view class="count-actions">
      <BigButton label="再听一次" variant="ghost" @tap="askAgain" />
      <BigButton label="下一题" variant="warm" @tap="nextChallenge" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BigButton from "@/components/BigButton.vue";
import PremiumVehicleImage from "@/components/PremiumVehicleImage.vue";
import { countingChallenges } from "@/mock/cartown";
import { speakEnglish } from "@/services/audioService";
import { addCartownStar, getCartownProgress, saveCartownProgress } from "@/services/cartownProgressService";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const progress = getCartownProgress();
const challengeIndex = ref(progress.countQuestionsDone % countingChallenges.length);
const tapped = ref<number[]>([]);
const feedback = ref("Tap and count!");
const challenge = computed(() => countingChallenges[challengeIndex.value]);
const slots = computed(() => Array.from({ length: challenge.value.count + 1 }, (_, index) => index));

function askAgain() {
  speakEnglish(challenge.value.task);
}

function tapCar(slot: number) {
  if (tapped.value.includes(slot)) {
    return;
  }

  tapped.value = [...tapped.value, slot];
  speakEnglish(String(tapped.value.length));

  if (tapped.value.length === challenge.value.count) {
    feedback.value = "Great job!";
    speakEnglish("Great job!");
    addCartownStar();
    const nextDone = getCartownProgress().countQuestionsDone + 1;
    saveCartownProgress({ countQuestionsDone: nextDone });
  }
}

function nextChallenge() {
  challengeIndex.value = (challengeIndex.value + 1) % countingChallenges.length;
  tapped.value = [];
  feedback.value = "Tap and count!";
  askAgain();
}
</script>

<style scoped lang="scss">
.car-page {
  padding-bottom: 56rpx;
}

.car-hero {
  padding: 32rpx;
  background:
    radial-gradient(circle at 92% 20%, rgba(255, 214, 107, 0.34), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 58%, #fff0dd 100%);
}

.count-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 28rpx;
}

.count-card {
  min-height: 230rpx;
  padding: 24rpx 16rpx;
  transition: transform 0.16s ease;
}

.count-card__vehicle {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: $radius-small;
  background: #eef2f3;
}

.count-card--active {
  border-color: rgba(145, 216, 168, 0.8);
  background: rgba(145, 216, 168, 0.22);
}

.count-card:active {
  transform: scale(0.98);
}

.count-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 28rpx;
}
</style>
