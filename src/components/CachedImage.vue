<template>
  <image

    class="cached-image"
    :class="{ 'cached-image--loading': loading }"
    :src="displaySource"
    :mode="props.mode"
    :lazy-load="props.lazyLoad"
    @load="handleLoad"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { highResolutionAsset } from "@/services/assetService";
import { resolveCachedMedia } from "@/services/mediaCacheService";

const props = withDefaults(defineProps<{
  src: string;
  mode?: "scaleToFill" | "aspectFit" | "aspectFill" | "widthFix" | "heightFix";
  lazyLoad?: boolean;
}>(), {
  mode: "scaleToFill",
  lazyLoad: true
});

const emit = defineEmits<{
  load: [event: unknown];
  error: [event: unknown];
}>();

const displaySource = ref("");
const loading = ref(true);
let requestId = 0;
let usedNetworkFallback = false;

watch(() => props.src, async (source) => {
  const currentRequest = ++requestId;
  loading.value = true;
  usedNetworkFallback = false;
  displaySource.value = "";

  const resolved = await resolveCachedMedia(source, "image");
  if (currentRequest === requestId) {
    displaySource.value = resolved;
  }
}, { immediate: true });

function handleLoad(event: unknown) {
  loading.value = false;
  emit("load", event);
}

function handleError(event: unknown) {
  const networkSource = highResolutionAsset(props.src);
  if (!usedNetworkFallback && displaySource.value !== networkSource) {
    usedNetworkFallback = true;
    displaySource.value = networkSource;
    return;
  }
  loading.value = false;
  emit("error", event);
}
</script>

<style scoped>
.cached-image {
  display: block;
  width: 100%;
  height: 100%;
  background: #f2eee5;
  transition: opacity 180ms ease;
}

.cached-image--loading {
  opacity: 0.72;
}
</style>
