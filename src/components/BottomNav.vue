<template>
  <view class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.id"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': props.active === item.id }"
      :aria-label="item.label"
      @tap="go(item.path)"
    >
      <text class="bottom-nav__icon">{{ item.icon }}</text>
      <text class="bottom-nav__label">{{ item.label }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
type NavId = "home" | "books" | "learn" | "parent";

const props = defineProps<{
  active: NavId;
}>();

const navItems: Array<{ id: NavId; label: string; icon: string; path: string }> = [
  { id: "home", label: "首页", icon: "⌂", path: "/pages/index/index" },
  { id: "books", label: "绘本馆", icon: "▤", path: "/pages/books/index" },
  { id: "learn", label: "主题学习", icon: "A·Z", path: "/pages/vehicles/index" },
  { id: "parent", label: "家长", icon: "◎", path: "/pages/parent/index" }
];

function go(path: string) {
  uni.reLaunch({ url: path });
}
</script>

<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 50%;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: 100%;
  max-width: 820px;
  padding: 14rpx 18rpx calc(12rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid rgba(72, 62, 49, 0.11);
  background: rgba(255, 253, 249, 0.96);
  backdrop-filter: blur(16rpx);
  transform: translateX(-50%);
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5rpx;
  min-height: 80rpx;
  color: #8b857e;
}

.bottom-nav__icon {
  height: 34rpx;
  font-size: 25rpx;
  font-weight: 800;
  line-height: 34rpx;
}

.bottom-nav__label {
  font-size: 20rpx;
  font-weight: 700;
}

.bottom-nav__item--active {
  color: $color-primary;
}
</style>
