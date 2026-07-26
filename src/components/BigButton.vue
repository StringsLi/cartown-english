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
  min-height: 82rpx;
  padding: 0 30rpx;
  border-radius: $radius-pill;
  font-size: 28rpx;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0;
  box-shadow: $shadow-button;
  transition: transform 0.16s ease, opacity 0.16s ease;
}

.big-button:active {
  transform: scale(0.98);
}

.big-button--primary {
  background: $color-primary;
}

.big-button--warm {
  color: #ffffff;
  background: #c48a28;
  box-shadow: 0 10rpx 20rpx rgba(150, 101, 28, 0.18);
}

.big-button--ghost {
  color: $color-primary-dark;
  border: 1rpx solid rgba(38, 61, 89, 0.16);
  background: #f3eee6;
  box-shadow: 0 10rpx 22rpx rgba(47, 58, 74, 0.04);
}

.big-button--disabled,
.big-button[disabled] {
  opacity: 0.55;
  box-shadow: none;
}
</style>
