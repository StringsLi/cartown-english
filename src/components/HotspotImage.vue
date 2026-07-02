<template>
  <view class="hotspot-image">
    <image class="hotspot-image__image" :src="props.image" mode="aspectFill" />
    <button
      v-for="hotspot in props.hotspots"
      :key="`${hotspot.word}-${hotspot.x}-${hotspot.y}`"
      class="hotspot-image__spot"
      :style="{
        left: hotspot.x + '%',
        top: hotspot.y + '%',
        width: hotspot.width + '%',
        height: hotspot.height + '%'
      }"
      @tap.stop="emit('select', hotspot)"
    >
      <text class="hotspot-image__dot" />
    </button>
  </view>
</template>

<script setup lang="ts">
import type { Hotspot } from "@/types/book";

const props = defineProps<{
  image: string;
  hotspots: Hotspot[];
}>();

const emit = defineEmits<{
  (event: "select", hotspot: Hotspot): void;
}>();
</script>

<style scoped lang="scss">
.hotspot-image {
  position: relative;
  width: 100%;
  min-height: 520rpx;
  overflow: hidden;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #e7f0eb 0%, #f6efd8 100%);
}

.hotspot-image__image {
  width: 100%;
  height: 520rpx;
}

.hotspot-image__spot {
  position: absolute;
  border-radius: 28rpx;
  border: 4rpx solid rgba(95, 143, 132, 0.46);
  background: rgba(255, 254, 249, 0.24);
}

.hotspot-image__dot {
  position: absolute;
  right: 12rpx;
  bottom: 12rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #e8c96f;
}
</style>
