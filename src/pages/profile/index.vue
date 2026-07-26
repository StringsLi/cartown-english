<template>
  <view class="page profile-page">
    <text class="page-title">我的</text>
    <text class="page-subtitle">本地体验版只保存昵称和学习记录，不采集真实姓名、头像和位置。</text>

    <view class="profile-card soft-card">
      <text class="profile-card__label">孩子昵称</text>
      <input v-model="nickname" class="profile-card__input" placeholder="Little Reader" />
      <BigButton label="保存昵称" @tap="saveNickname" />
    </view>

    <view class="profile-card soft-card">
      <text class="profile-card__label">隐私说明</text>
      <text class="profile-card__text">不做儿童社交、不做排行榜、不采集位置。跟读录音默认只保存在当前设备，由家长管理。</text>
      <BigButton label="清除本地学习记录" variant="ghost" @tap="clearData" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BigButton from "@/components/BigButton.vue";
import { clearCartownProgress } from "@/services/cartownProgressService";
import { clearLearningData, getLearningState, updateChildNickname } from "@/services/progressService";

const nickname = ref(getLearningState().childNickname);

function saveNickname() {
  updateChildNickname(nickname.value);
  uni.showToast({ title: "已保存", icon: "success" });
}

function clearData() {
  uni.showModal({
    title: "清除学习记录？",
    content: "绘本进度、跟读记录、游戏成绩和主题星星都会被清除，此操作无法撤销。",
    confirmText: "确认清除",
    confirmColor: "#b95f3d",
    success(result) {
      if (!result.confirm) return;
      clearLearningData();
      clearCartownProgress();
      nickname.value = getLearningState().childNickname;
      uni.showToast({ title: "已清除", icon: "success" });
    }
  });
}
</script>

<style scoped lang="scss">
.profile-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 34rpx;
  padding: 30rpx;
}

.profile-card__label {
  font-size: 30rpx;
  font-weight: 900;
  color: #1f332f;
}

.profile-card__input {
  min-height: 86rpx;
  padding: 0 22rpx;
  border-radius: 24rpx;
  font-size: 30rpx;
  color: #1f332f;
  background: #f5f7f2;
}

.profile-card__text {
  font-size: 26rpx;
  color: #6f7c75;
  line-height: 1.55;
}
</style>
