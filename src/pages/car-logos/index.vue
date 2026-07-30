<template>
  <view class="page logos-page">
    <view class="logos-hero soft-card">
      <view>
        <text class="section-kicker">Brand Badges</text>
        <text class="page-title">50 个车标</text>
        <text class="page-subtitle">先当图形认知，不强调品牌消费。听名字，找徽章。</text>
      </view>
      <text class="logos-hero__count">{{ activeIndex + 1 }} / {{ carLogos.length }}</text>
    </view>

    <view class="mode-tabs">
      <BigButton :variant="mode === 'learn' ? 'warm' : 'ghost'" label="学习" @tap="mode = 'learn'" />
      <BigButton :variant="mode === 'play' ? 'warm' : 'ghost'" label="游戏" @tap="startQuiz" />
    </view>

    <view v-if="mode === 'learn'" class="logo-learn soft-card">
      <CartownLogoBadge :logo-id="activeLogo.id" :name="activeLogo.name" :badge-text="activeLogo.badgeText" :shape="activeLogo.shape" :primary="activeLogo.primary" :secondary="activeLogo.secondary" :show-name="false" />
      <text class="logo-learn__name">{{ activeLogo.name }}</text>
      <text class="logo-learn__zh">{{ activeLogo.zh }} · {{ activeLogo.country }}</text>
      <text class="logo-learn__cue">{{ activeLogo.cue }}</text>
      <view class="logo-learn__actions">
        <BigButton label="听名字" @tap="speakLogo(activeLogo.name)" />
        <BigButton label="下一个" variant="warm" @tap="nextLogo" />
      </view>
    </view>

    <view v-else class="logo-quiz">
      <view class="quiz-head soft-card">
        <text class="quiz-head__title">Tap {{ targetLogo.name }}</text>
        <text class="quiz-head__feedback">{{ feedback }}</text>
      </view>
      <view class="logo-options">
        <view v-for="logo in quizOptions" :key="logo.id" class="logo-option soft-card" @tap="chooseLogo(logo.id)">
          <CartownLogoBadge :logo-id="logo.id" :name="logo.name" :badge-text="logo.badgeText" :shape="logo.shape" :primary="logo.primary" :secondary="logo.secondary" size="small" :show-name="false" />
          <text class="logo-option__name">{{ logo.name }}</text>
          <text class="logo-option__zh">{{ logo.zh }}</text>
        </view>
      </view>
      <BigButton class="logo-quiz__listen" label="再听一次" @tap="speakLogo(`Tap ${targetLogo.name}.`)" />
    </view>

    <text class="section-title">Logo Wall</text>
    <view class="logo-wall">
      <view v-for="(logo, index) in carLogos" :key="logo.id" class="logo-wall__item soft-card" @tap="selectLogo(index)">
        <CartownLogoBadge :logo-id="logo.id" :name="logo.name" :badge-text="logo.badgeText" :shape="logo.shape" :primary="logo.primary" :secondary="logo.secondary" size="small" :show-name="false" />
        <text class="logo-wall__name">{{ logo.name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BigButton from "@/components/BigButton.vue";
import CartownLogoBadge from "@/components/CartownLogoBadge.vue";
import { carLogos } from "@/mock/cartown";
import { speakEnglish } from "@/services/audioService";
import { addCartownStar, getCartownProgress, saveCartownProgress } from "@/services/cartownProgressService";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const mode = ref<"learn" | "play">("learn");
const activeIndex = ref(Math.min(getCartownProgress().logoIndex, carLogos.length - 1));
const targetIndex = ref(0);
const feedback = ref("Listen and tap!");
const activeLogo = computed(() => carLogos[activeIndex.value]);
const targetLogo = computed(() => carLogos[targetIndex.value]);
const quizOptions = computed(() => [targetLogo.value, carLogos[(targetIndex.value + 7) % carLogos.length], carLogos[(targetIndex.value + 19) % carLogos.length]]);

function speakLogo(text: string) {
  speakEnglish(text);
}

function selectLogo(index: number) {
  mode.value = "learn";
  activeIndex.value = index;
  saveCartownProgress({ logoIndex: index });
  speakLogo(carLogos[index].name);
}

function nextLogo() {
  activeIndex.value = (activeIndex.value + 1) % carLogos.length;
  saveCartownProgress({ logoIndex: activeIndex.value });
  speakLogo(activeLogo.value.name);
}

function startQuiz() {
  mode.value = "play";
  targetIndex.value = (getCartownProgress().logoQuizDone * 5) % carLogos.length;
  feedback.value = "Listen and tap!";
  speakLogo(`Tap ${targetLogo.value.name}.`);
}

function chooseLogo(id: string) {
  if (id !== targetLogo.value.id) {
    feedback.value = "Try again!";
    speakEnglish("Try again!");
    return;
  }

  feedback.value = "Great job!";
  speakEnglish("Great job!");
  addCartownStar();
  const nextDone = getCartownProgress().logoQuizDone + 1;
  saveCartownProgress({ logoQuizDone: nextDone });
  targetIndex.value = (nextDone * 5) % carLogos.length;
}
</script>

<style scoped lang="scss">
.logos-page {
  padding-bottom: 56rpx;
}

.logos-hero {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 32rpx;
  background:
    radial-gradient(circle at 92% 20%, rgba(255, 214, 107, 0.34), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 58%, #fff0dd 100%);
}

.logos-hero__count {
  flex: 0 0 auto;
  align-self: flex-start;
  padding: 12rpx 18rpx;
  border-radius: $radius-pill;
  font-size: 23rpx;
  font-weight: 900;
  color: $color-primary-dark;
  background: rgba(255, 214, 107, 0.72);
}

.mode-tabs,
.logo-learn__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 24rpx;
}

.logo-learn,
.quiz-head {
  margin-top: 24rpx;
  padding: 30rpx;
  text-align: center;
}

.logo-learn {
  overflow: hidden;
}

.logo-learn__name,
.quiz-head__title {
  display: block;
  margin-top: 14rpx;
  font-size: 44rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.logo-learn__zh,
.logo-learn__cue,
.quiz-head__feedback,
.logo-option__zh {
  display: block;
  margin-top: 8rpx;
  font-size: 25rpx;
  color: $color-muted;
}

.logo-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 18rpx;
}

.logo-option,
.logo-wall__item {
  padding: 18rpx 10rpx;
  text-align: center;
}

.logo-option__name,
.logo-wall__name {
  display: block;
  margin-top: 8rpx;
  overflow: hidden;
  color: $color-primary-dark;
  font-size: 22rpx;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logo-quiz__listen {
  margin-top: 18rpx;
}

.logo-wall {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

@media (min-width: 700px) {
  .logo-wall {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
