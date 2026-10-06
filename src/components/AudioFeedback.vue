<template>
  <view v-if="audioPlaybackState.phase !== 'idle'" class="audio-feedback" :class="`audio-feedback--${audioPlaybackState.phase}`" role="status" aria-live="polite">
    <view class="audio-feedback__copy"><text class="native-audiofeedback-text">{{ phaseLabel }}</text><text class="native-audiofeedback-text">{{ audioPlaybackState.label }}</text></view>
    <button class="native-audiofeedback-button" role="button" v-if="active" aria-label="停止播放声音" @tap="stopAudio">停止 ■</button>
    <button class="native-audiofeedback-button" role="button" v-else-if="audioPlaybackState.canReplay" @tap="replayAudio">{{ audioPlaybackState.phase === 'error' ? '再试一次 ↻' : '再听一次 ↻' }}</button>
  </view>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { audioPlaybackState, replayAudio, stopAudio } from "@/services/audioService";
const active = computed(() => ["loading", "playing"].includes(audioPlaybackState.value.phase));
const phaseLabel = computed(() => ({ idle: "", loading: "正在准备声音…", playing: "正在播放 ♪", ended: "听完啦", error: "一起再试试" }[audioPlaybackState.value.phase]));
</script>
<style scoped lang="scss">
.audio-feedback { display: flex; align-items: center; gap: 16rpx; padding: 16rpx 20rpx; margin: 18rpx 0; border-radius: 20rpx; background: #e9f1ee; color: #487263; }.audio-feedback--error { background: #fff0db; color: #957047; }.audio-feedback__copy { flex: 1; min-width: 0; }.audio-feedback__copy .native-audiofeedback-text { display: block; font-size: 22rpx; font-weight: 800; line-height: 1.5; }.audio-feedback__copy .native-audiofeedback-text + .native-audiofeedback-text { font-size: 19rpx; font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.audio-feedback .native-audiofeedback-button { flex: none; min-height: 68rpx; padding: 0 14rpx; font-size: 22rpx; font-weight: 800; border-radius: 14rpx; background: #ffffffaa; }
</style>
