<template>
  <button class="audio-button" :class="`audio-button--${props.size}`" @tap="handlePlay">
    <text class="audio-button__icon">▶</text>
    <text class="audio-button__label">{{ props.label }}</text>
  </button>
</template>

<script setup lang="ts">
import { playAudio } from "@/services/audioService";

const props = withDefaults(
  defineProps<{
    label?: string;
    src?: string;
    size?: "medium" | "large";
  }>(),
  {
    label: "播放",
    src: "",
    size: "medium"
  }
);

const emit = defineEmits<{
  (event: "play", src: string): void;
}>();

function handlePlay() {
  playAudio(props.src);
  emit("play", props.src);
}
</script>

<style scoped lang="scss">
.audio-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  min-height: 76rpx;
  padding: 0 28rpx;
  border-radius: $radius-pill;
  color: $color-primary-dark;
  background: rgba(221, 240, 255, 0.86);
  box-shadow: 0 10rpx 22rpx rgba(107, 175, 232, 0.16);
  transition: transform 0.16s ease;
}

.audio-button:active {
  transform: scale(0.98);
}

.audio-button--large {
  min-height: 108rpx;
  padding: 0 42rpx;
  background: linear-gradient(135deg, $color-primary 0%, #83c6f4 100%);
  color: #ffffff;
  box-shadow: $shadow-button;
}

.audio-button__icon {
  font-size: 26rpx;
  line-height: 1;
}

.audio-button__label {
  font-size: 29rpx;
  font-weight: 900;
  letter-spacing: 0;
}
</style>
