<template>
  <button
    class="big-button"
    :class="[`big-button--${props.variant}`, { 'big-button--disabled': props.disabled }]"
    :disabled="props.disabled"
    @tap="handleTap"
  >
    <slot>{{ props.label }}</slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string;
    variant?: "primary" | "warm" | "ghost";
    disabled?: boolean;
  }>(),
  {
    label: "",
    variant: "primary",
    disabled: false
  }
);

const emit = defineEmits<{
  (event: "tap"): void;
}>();

function handleTap() {
  if (!props.disabled) {
    emit("tap");
  }
}
</script>

<style scoped lang="scss">
.big-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 92rpx;
  padding: 0 38rpx;
  border-radius: $radius-pill;
  font-size: 31rpx;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0;
  box-shadow: $shadow-button;
  transition: transform 0.16s ease, opacity 0.16s ease;
}

.big-button:active {
  transform: scale(0.98);
}

.big-button--primary {
  background: linear-gradient(135deg, $color-primary 0%, #83c6f4 100%);
}

.big-button--warm {
  color: $color-primary-dark;
  background: linear-gradient(135deg, $color-warm 0%, #ffe58e 100%);
  box-shadow: 0 12rpx 24rpx rgba(255, 159, 122, 0.18);
}

.big-button--ghost {
  color: $color-primary-dark;
  border: 1rpx solid rgba(107, 175, 232, 0.28);
  background: rgba(221, 240, 255, 0.68);
  box-shadow: 0 10rpx 22rpx rgba(47, 58, 74, 0.04);
}

.big-button--disabled,
.big-button[disabled] {
  opacity: 0.55;
  box-shadow: none;
}
</style>
