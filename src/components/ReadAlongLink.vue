<template>
  <view class="read-along-actions">
    <button class="read-along-actions__button" v-if="listen" role="button" :aria-label="`听${title}的原声`" @tap="hear">▶ 听原声</button>
    <button class="read-along-actions__button" role="button" :aria-label="`录音跟读：${text}`" @tap="record">● 录音跟读</button>
  </view>
</template>
<script setup lang="ts">
import { playAudio } from '@/services/audioService';
import { openReadAlong } from '@/services/readAlongService';
const props = withDefaults(defineProps<{ sourceKey: string; title: string; text: string; textCn?: string; audio: string; returnUrl: string; bookId?: string; listen?: boolean }>(), { listen: false });
const emit = defineEmits<{ played: [sourceKey: string] }>();
function hear() { const sourceKey = props.sourceKey; playAudio(props.audio, props.text, () => emit('played', sourceKey)); }
function record() { openReadAlong({ key: props.sourceKey, title: props.title, sentence: props.text, sentenceCn: props.textCn, audio: props.audio, returnUrl: props.returnUrl, bookId: props.bookId }); }
</script>
<style scoped>
.read-along-actions { display:flex; flex-wrap:wrap; gap:16rpx; margin-top:18rpx; }
.read-along-actions__button { display:flex; flex:1; align-items:center; justify-content:center; min-width:120rpx; min-height:44px; padding:10rpx 16rpx; border:1rpx solid #b8cbbc; border-radius:18rpx; background:#e8f0e8; color:#385c50; font-size:23rpx; font-weight:700; line-height:1.5; }
</style>
