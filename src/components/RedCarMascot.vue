<template>
  <view class="red-car-mascot" :class="{ 'red-car-mascot--compact': compact }">
    <image
      class="red-car-mascot__image"
      src="/static/generated-books/red-car/cover.jpg"
      mode="aspectFill"
      aria-label="红色小车：两个眼睛和两盏车灯"
    />
  </view>
</template>

<script setup lang="ts">
defineProps<{
  compact?: boolean;
}>();
</script>

<style scoped lang="scss">
.red-car-mascot,
.red-car-mascot__image {
  display: block;
  width: 100%;
  height: 100%;
}

.red-car-mascot {
  overflow: hidden;
}

.red-car-mascot--compact .red-car-mascot__image {
  object-position: center;
}
</style>
