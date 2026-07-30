<template>
  <image
    class="premium-vehicle"
    :src="vehicleIcon(props.name)"
    mode="aspectFit"
    :lazy-load="false"
    :aria-label="props.alt || props.name"
  />
</template>

<script setup lang="ts">
import { vehicleIcon } from "@/mock/topicAssets";

defineOptions({
  options: {
    virtualHost: true
  }
});

const props = defineProps<{
  name: string;
  alt?: string;
}>();
</script>

<style scoped lang="scss">
.premium-vehicle {
  display: block;
  width: 100%;
  height: auto;
  max-height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: $radius-small;
}
</style>
