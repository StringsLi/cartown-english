<template>
  <view class="cached-image" :class="{ 'cached-image--loading': loading }">
    <image v-if="displaySource && !failed" :key="displaySource" class="cached-image__image" :src="displaySource" :mode="props.mode" :lazy-load="props.lazyLoad" :aria-label="props.alt" @load="handleLoad" @error="handleError" />
    <view v-if="loading" class="cached-image__status" aria-label="图片加载中"><text class="native-cachedimage-text">◌</text></view>
    <view v-if="failed" class="cached-image__status cached-image__status--failed"><text class="native-cachedimage-text">图片暂未加载</text><button class="native-cachedimage-button" role="button" aria-label="重新加载图片" @tap.stop="resolveSource">重试 ↻</button></view>
  </view>
</template>
<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import { invalidateCachedMedia, resolveCachedMedia } from "@/services/mediaCacheService";
// Keep percentage sizing relative to the actual image container in native WeChat.
defineOptions({ options: { virtualHost: true } });
const props = withDefaults(defineProps<{ src: string; alt?: string; mode?: "scaleToFill" | "aspectFit" | "aspectFill" | "widthFix" | "heightFix"; lazyLoad?: boolean }>(), { mode: "scaleToFill", lazyLoad: true, alt: "" });
const emit = defineEmits<{ load: [event: unknown]; error: [event: unknown] }>();
const displaySource = ref(""); const loading = ref(true); const failed = ref(false);
let requestId = 0;
watch(() => props.src, resolveSource, { immediate: true });
onBeforeUnmount(() => { requestId += 1; });
async function resolveSource() {
  const request = ++requestId;
  loading.value = true; failed.value = false; displaySource.value = "";
  try {
    const resolved = await resolveCachedMedia(props.src, "image");
    if (request !== requestId) return;
    if (!resolved) throw new Error("Empty image source");
    displaySource.value = resolved;
  } catch (error) {
    if (request === requestId) handleError(error);
  }
}
function handleLoad(event: unknown) { loading.value = false; emit("load", event); }
function handleError(event: unknown) { invalidateCachedMedia(props.src); loading.value = false; failed.value = true; emit("error", event); }
</script>
<style scoped>
.cached-image { position: relative; display: block; width: 100%; height: 100%; overflow: hidden; background: #f2eee5; }
.cached-image__image { display: block; width: 100%; height: 100%; }
.cached-image__status { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12rpx; padding: 12rpx; color: #7a746c; font-size: 20rpx; text-align: center; }
.cached-image__status > .native-cachedimage-text { line-height: 1.4; }
.cached-image__status .native-cachedimage-button { min-height: 76rpx; padding: 0 18rpx; border-radius: 18rpx; background: #fffdf9; color: #527769; font-size: 22rpx; }
</style>
