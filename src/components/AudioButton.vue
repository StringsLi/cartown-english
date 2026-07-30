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
    fallbackText?: string;
    size?: "medium" | "large";
  }>(),
  {
    label: "播放",
    src: "",
    fallbackText: "",
    size: "medium"
  }
);

const emit = defineEmits<{
  (event: "play", src: string): void;
}>();

function handlePlay() {
  playAudio(props.src, props.fallbackText);
  emit("play", props.src);
}
</script>

<style scoped lang="scss">
.audio-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  min-height: 70rpx;
  padding: 0 24rpx;
  border-radius: $radius-pill;
  color: $color-primary;
  border: 1rpx solid rgba(185, 95, 61, 0.16);
  background: #f8eee8;
  box-shadow: 0 8rpx 18rpx rgba(72, 62, 49, 0.06);
  transition: transform 0.16s ease;
}

.audio-button:active {
  transform: scale(0.98);
}

.audio-button--large {
  min-height: 108rpx;
  padding: 0 42rpx;
  background: $color-primary;
  color: #ffffff;
  box-shadow: $shadow-button;
}

.audio-button__icon {
  font-size: 26rpx;
  line-height: 1;
}

.audio-button__label {
  font-size: 29rpx;
  font-weight: 800;
  letter-spacing: 0;
}
</style>
