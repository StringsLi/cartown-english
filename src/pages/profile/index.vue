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
      <text class="profile-card__text">首版不做儿童社交、不做排行榜、不采集位置。跟读录音后续默认仅家长可见。</text>
      <BigButton label="清除本地学习记录" variant="ghost" @tap="clearData" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BigButton from "@/components/BigButton.vue";
import { clearLearningData, getLearningState, updateChildNickname } from "@/services/progressService";

const nickname = ref(getLearningState().childNickname);

function saveNickname() {
  updateChildNickname(nickname.value);
  uni.showToast({ title: "已保存", icon: "success" });
}

function clearData() {
  clearLearningData();
  uni.showToast({ title: "已清除", icon: "success" });
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
