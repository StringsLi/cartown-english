<template>
  <view class="page profile-page">
    <PageTopbar section="资料与设置" fallback="/pkg-user/parent/index" />
    <text class="page-title">我的</text>
    <text class="page-subtitle">本地体验版只保存昵称和学习记录，不采集真实姓名、头像和位置。</text>

    <view class="profile-card soft-card">
      <text class="profile-card__label">孩子昵称</text>
      <input :maxlength="16" v-model="nickname" class="profile-card__input" placeholder="最多 16 个字" />
      <BigButton label="保存昵称" @tap="saveNickname" />
    </view>

    <view class="profile-card soft-card"><text class="profile-card__label">点读音量 · {{ audioVolume }}%</text><text class="profile-card__text">{{ audioVolume === 0 ? "已静音，调大后可以听英语。" : "选一个舒服的音量，下次打开也会记住。" }}</text><slider :value="audioVolume" :min="0" :max="100" :step="10" show-value activeColor="#7e9d86" @change="changeVolume" /></view>

    <view class="profile-card soft-card"><text class="profile-card__label">录音与备份</text><text class="profile-card__text">先导出要保留的录音和记录，再清理学习数据。</text><BigButton label="打开孩子的录音小册" variant="warm" @tap="navigate({ url: '/pkg-reading/recordings/index' })" /></view>

    <view class="profile-card soft-card">
      <text class="profile-card__label">隐私说明</text>
      <text class="profile-card__text">不做儿童社交、不做排行榜、不采集位置。跟读录音默认只保存在当前设备，由家长管理。</text>
      <BigButton label="清理图片和音频缓存" variant="ghost" @tap="clearCache" />
      <BigButton label="清除本地学习记录" variant="ghost" @tap="clearData" />
    </view>
  </view>
</template>

<script setup lang="ts">
import PageTopbar from "@/components/PageTopbar.vue";
import { navigate } from "@/services/navigationService";
import { ref } from "vue";
import { getAudioVolume, setAudioVolume } from "@/services/audioService";
import BigButton from "@/components/BigButton.vue";
import { clearCartownProgress } from "@/services/cartownProgressService";
import { clearLearningData, getLearningState, updateChildNickname } from "@/services/progressService";
import { clearMediaCache } from "@/services/mediaCacheService";
import { usePageShare } from "@/composables/usePageShare";

usePageShare();
const audioVolume = ref(Math.round(getAudioVolume() * 100));
function changeVolume(event: { detail: { value: number } }) { audioVolume.value = event.detail.value; setAudioVolume(audioVolume.value / 100); }
const nickname = ref(getLearningState().childNickname);

function saveNickname() {
  nickname.value = nickname.value.trim();
  if (!nickname.value) { uni.showToast({ title: "先给宝贝起个昵称吧", icon: "none" }); return; }
  updateChildNickname(nickname.value.slice(0, 16));
  uni.showToast({ title: "已保存", icon: "success" });
}

function clearCache() {
  clearMediaCache();
  uni.showToast({ title: "缓存已清理", icon: "success" });
}

function clearData() {
  uni.showModal({
    title: "清除学习记录？",
    content: "将清除昵称、绘本进度、录音索引、游戏记录、主题星星、国家探索记录和太空护照。请先导出录音与备份；音量设置保留。此操作无法撤销。",
    confirmText: "确认清除",
    confirmColor: "#b95f3d",
    success(result) {
      if (!result.confirm) return;
      clearLearningData();
      clearCartownProgress();
      uni.removeStorageSync("cartown_explored_countries");
      uni.removeStorageSync("cartown_daily_countries");
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
