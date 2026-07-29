<template>
  <view class="page traffic-page">
    <view class="traffic-hero soft-card">
      <text class="section-kicker">Traffic Light</text>
      <text class="page-title">红绿灯动作</text>
      <text class="page-subtitle">{{ prompt.task }} · {{ feedback }}</text>
    </view>

    <view class="traffic-scene soft-card">
      <view class="traffic-light">
        <view class="traffic-light__dot traffic-light__dot--red" :class="{ 'traffic-light__dot--active': prompt.light === 'red' }" />
        <view class="traffic-light__dot traffic-light__dot--yellow" :class="{ 'traffic-light__dot--active': prompt.light === 'yellow' }" />
        <view class="traffic-light__dot traffic-light__dot--green" :class="{ 'traffic-light__dot--active': prompt.light === 'green' }" />
      </view>
      <view class="traffic-scene__vehicle">
        <PremiumVehicleImage name="police-car" alt="警车" />
      </view>
    </view>

    <view class="traffic-actions">
      <BigButton v-for="item in trafficPrompts" :key="item.id" :label="item.action" :variant="item.light === 'yellow' ? 'warm' : 'primary'" @tap="choose(item.action)" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BigButton from "@/components/BigButton.vue";
import PremiumVehicleImage from "@/components/PremiumVehicleImage.vue";
import { trafficPrompts } from "@/mock/cartown";
import { speakEnglish } from "@/services/audioService";
import { addCartownStar, getCartownProgress, saveCartownProgress } from "@/services/cartownProgressService";

const progress = getCartownProgress();
const promptIndex = ref(progress.trafficTurnsDone % trafficPrompts.length);
const feedback = ref("Listen and choose!");
const prompt = computed(() => trafficPrompts[promptIndex.value]);

function choose(action: string) {
  if (action !== prompt.value.action) {
    feedback.value = "Try again!";
    speakEnglish("Try again!");
    return;
  }

  feedback.value = "Great job!";
  speakEnglish("Great job!");
  addCartownStar();
  const nextDone = getCartownProgress().trafficTurnsDone + 1;
  saveCartownProgress({ trafficTurnsDone: nextDone });
  promptIndex.value = nextDone % trafficPrompts.length;
}
</script>

<style scoped lang="scss">
.traffic-page {
  padding-bottom: 56rpx;
}

.traffic-hero {
  padding: 32rpx;
  background:
    radial-gradient(circle at 92% 20%, rgba(255, 214, 107, 0.34), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 58%, #fff0dd 100%);
}

.traffic-scene {
  display: grid;
  grid-template-columns: 190rpx 1fr;
  gap: 24rpx;
  align-items: center;
  margin-top: 28rpx;
  padding: 32rpx;
}

.traffic-scene__vehicle {
  height: 240rpx;
}

.traffic-light {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  padding: 24rpx;
  border-radius: 42rpx;
  background: $color-primary-dark;
}

.traffic-light__dot {
  width: 104rpx;
  height: 104rpx;
  border: 7rpx solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  opacity: 0.26;
}

.traffic-light__dot--red {
  background: #ff5a5f;
}

.traffic-light__dot--yellow {
  background: #ffd447;
}

.traffic-light__dot--green {
  background: #43c66b;
}

.traffic-light__dot--active {
  opacity: 1;
  box-shadow: 0 0 30rpx rgba(255, 255, 255, 0.74);
}

.traffic-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 28rpx;
}
</style>
