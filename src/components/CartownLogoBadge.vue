<template>
  <view
    class="logo-badge"
    :class="[`logo-badge--${props.shape}`, { 'logo-badge--small': props.size === 'small' }]"
    :style="badgeStyle"
  >
    <view class="logo-badge__image-wrap">
      <image
        v-if="!imageFailed"
        class="logo-badge__image"
        :src="logoImage"
        mode="aspectFit"
        :lazy-load="false"
        @error="imageFailed = true"
      />
      <view v-else class="logo-badge__shape">
        <text class="logo-badge__text">{{ props.badgeText }}</text>
      </view>
    </view>
    <text v-if="props.showName" class="logo-badge__name">{{ props.name }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { highResolutionAsset } from "@/services/assetService";

defineOptions({
  options: {
    virtualHost: true
  }
});

const props = withDefaults(
  defineProps<{
    logoId: string;
    name: string;
    badgeText: string;
    shape: string;
    primary: string;
    secondary: string;
    size?: "normal" | "small";
    showName?: boolean;
  }>(),
  {
    size: "normal",
    showName: true
  }
);

const badgeStyle = computed(() => ({
  "--logo-primary": props.primary,
  "--logo-secondary": props.secondary
}));

const imageFailed = ref(false);
const logoImage = computed(() => highResolutionAsset(`/static/cartown-logos/${props.logoId}.webp`));

watch(
  () => props.logoId,
  () => {
    imageFailed.value = false;
  }
);
</script>

<style scoped lang="scss">
.logo-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.logo-badge__image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 320rpx;
  max-width: 100%;
  height: 238rpx;
  border: 1rpx solid rgba(47, 58, 74, 0.1);
  border-radius: $radius-card;
  background: #fffdf9;
  box-shadow: 0 8rpx 18rpx rgba(47, 58, 74, 0.05);
}

.logo-badge--small .logo-badge__image-wrap {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  border-radius: $radius-small;
}

.logo-badge__image {
  width: 100%;
  height: auto;
  max-height: 100%;
  aspect-ratio: 4 / 3;
}

.logo-badge__shape {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 7rpx solid $color-primary-dark;
  border-radius: 40rpx;
  background:
    radial-gradient(circle at 28% 20%, rgba(255, 255, 255, 0.72), transparent 36%),
    linear-gradient(135deg, var(--logo-primary) 0%, rgba(47, 58, 74, 0.82) 100%);
  box-shadow: 0 12rpx 0 rgba(47, 58, 74, 0.08);
}

.logo-badge--small .logo-badge__shape {
  border-width: 5rpx;
  border-radius: 26rpx;
}

.logo-badge--circle .logo-badge__shape,
.logo-badge--ring .logo-badge__shape {
  border-radius: 50%;
}

.logo-badge--oval .logo-badge__shape {
  border-radius: 50%;
}

.logo-badge--shield .logo-badge__shape {
  border-radius: 34rpx 34rpx 52rpx 52rpx;
}

.logo-badge--diamond .logo-badge__shape {
  width: 78%;
  height: 78%;
  border-radius: 24rpx;
  transform: rotate(45deg);
}

.logo-badge--diamond .logo-badge__text {
  transform: rotate(-45deg);
}

.logo-badge--wings .logo-badge__shape {
  border-radius: 70rpx 28rpx;
}

.logo-badge--star .logo-badge__shape {
  border-radius: 54rpx 22rpx;
}

.logo-badge--triangle .logo-badge__shape {
  clip-path: polygon(50% 3%, 96% 95%, 4% 95%);
  border-radius: 12rpx;
}

.logo-badge--hex .logo-badge__shape {
  clip-path: polygon(22% 5%, 78% 5%, 98% 50%, 78% 95%, 22% 95%, 2% 50%);
}

.logo-badge__text {
  display: block;
  max-width: 150rpx;
  color: var(--logo-secondary);
  font-size: 42rpx;
  font-weight: 900;
  text-align: center;
  line-height: 1;
}

.logo-badge--small .logo-badge__text {
  font-size: 26rpx;
}

.logo-badge__name {
  display: block;
  margin-top: 12rpx;
  max-width: 180rpx;
  overflow: hidden;
  color: $color-primary-dark;
  font-size: 24rpx;
  font-weight: 900;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
