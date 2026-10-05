<template>
  <view class="page car-page">
    <PageTopbar section="点一点 · 数一数" fallback="/pages/vehicles/index" />
    <AudioFeedback /><ReadAlongLink :source-key="'car-count-' + challenge.id" :title="'数数汽车'" :text="challenge.task" :audio="phraseAudioPath(challenge.task)" :return-url="'/pkg-cars/car-count/index'"  />
    <view class="car-hero soft-card">
      <text class="section-kicker">Count Cars</text>
      <text class="page-title">{{ challenge.count }}</text>
      <text class="page-subtitle">{{ challenge.task }} · {{ feedback }}</text>
    </view>

    <view class="count-status" role="status">已点 {{ tapped.length }} / {{ challenge.count }} 辆 · 每辆只点一次</view>
    <view class="count-grid">
      <button role="button"
        v-for="slot in slots"
        :key="slot"
        class="count-card soft-card"
        :class="{ 'count-card--active': tapped.includes(slot) }"
        @tap="tapCar(slot)"
      >
        <view class="count-card__vehicle">
          <PremiumVehicleImage :name="challenge.kind" :alt="challenge.vehicleZh" />
        </view>
      </button>
    </view>

    <view class="count-actions">
      <BigButton label="再听一次" variant="ghost" @tap="askAgain" />
      <BigButton label="下一题" variant="warm" :disabled="tapped.length !== challenge.count" @tap="nextChallenge" />
    </view>
  </view>
</template>

<script setup lang="ts">
import ReadAlongLink from "@/components/ReadAlongLink.vue";
import AudioFeedback from "@/components/AudioFeedback.vue";
import PageTopbar from "@/components/PageTopbar.vue";
import { computed, ref } from "vue";
import BigButton from "@/components/BigButton.vue";
import PremiumVehicleImage from "@/components/PremiumVehicleImage.vue";
import { countingChallenges } from "@/mock/cartown";
import { phraseAudioPath } from "@/services/audioCatalog";
import { speakEnglish } from "@/services/audioService";
import { addCartownStar, getCartownProgress, saveCartownProgress } from "@/services/cartownProgressService";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const progress = getCartownProgress();
const challengeIndex = ref(progress.countQuestionsDone % countingChallenges.length);
const tapped = ref<number[]>([]);
const feedback = ref("Tap and count!");
const challenge = computed(() => countingChallenges[challengeIndex.value]);
const slots = computed(() => Array.from({ length: challenge.value.count }, (_, index) => index));

function askAgain() {
  speakEnglish(challenge.value.task);
}

function tapCar(slot: number) {
  if (slot < 0 || slot >= challenge.value.count || tapped.value.length >= challenge.value.count || tapped.value.includes(slot)) {
    return;
  }

  tapped.value = [...tapped.value, slot];
  speakEnglish(String(tapped.value.length));

  if (tapped.value.length === challenge.value.count) {
    feedback.value = "Great job!";
    addCartownStar();
    const nextDone = getCartownProgress().countQuestionsDone + 1;
    saveCartownProgress({ countQuestionsDone: nextDone });
  }
}

function nextChallenge() {
  if (tapped.value.length !== challenge.value.count) return;
  challengeIndex.value = (challengeIndex.value + 1) % countingChallenges.length;
  tapped.value = [];
  feedback.value = "Tap and count!";
  askAgain();
}
</script>

<style scoped lang="scss">
.count-status { margin-top:22rpx; padding:18rpx 22rpx; border-radius:20rpx; background:#e8efe6; font-size:24rpx; color:#527769; }
.car-page {
  padding-bottom: calc(56rpx + env(safe-area-inset-bottom));
}

.car-hero {
  padding: 32rpx;
  background:
    radial-gradient(circle at 92% 20%, rgba(223, 166, 45, 0.16), transparent 34%),
    linear-gradient(135deg, #fffdf9 0%, #edf2e9 58%, #f7edda 100%);
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
