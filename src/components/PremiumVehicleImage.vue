<template>
  <CachedImage
    class="premium-vehicle"
    :src="vehicleIcon(props.name)"
    mode="aspectFit"
    :aria-label="props.alt || props.name"
  />
</template>

<script setup lang="ts">
import CachedImage from "@/components/CachedImage.vue";
import { vehicleIcon } from "@/mock/topicAssets";

const props = defineProps<{
  name: string;
  alt?: string;
}>();
</script>

<style scoped lang="scss">
.premium-vehicle {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: $radius-small;
}
</style>