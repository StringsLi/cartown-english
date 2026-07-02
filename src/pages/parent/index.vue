<template>
  <view class="page parent-page">
    <view class="parent-hero soft-card">
      <view>
        <text class="section-kicker">Parent Center</text>
        <text class="page-title">家长中心</text>
        <text class="page-subtitle">每天陪孩子 5 分钟，一句英文也算一次漂亮的开始。</text>
      </view>
      <view class="parent-hero__status" :class="{ 'parent-hero__status--done': stats.todayCompleted }">
        <text class="parent-hero__status-value">{{ stats.todayCompleted ? "Done" : "Today" }}</text>
        <text class="parent-hero__status-label">{{ stats.todayCompleted ? "已完成" : "待完成" }}</text>
      </view>
    </view>

    <view class="parent-stats soft-card">
      <view class="parent-stat">
        <text class="parent-stat__value">{{ stats.streakDays }} 天</text>
        <text class="parent-stat__label">连续学习</text>
      </view>
      <view class="parent-stat">
        <text class="parent-stat__value">{{ stats.readBookCount }} 本</text>
        <text class="parent-stat__label">已读绘本</text>
      </view>
      <view class="parent-stat">
        <text class="parent-stat__value">{{ stats.learnedWordCount }} 个</text>
        <text class="parent-stat__label">已学单词</text>
      </view>
      <view class="parent-stat">
        <text class="parent-stat__value">{{ learningState.repeatRecords.length }} 次</text>
        <text class="parent-stat__label">跟读记录</text>
      </view>
    </view>

    <view class="cartown-card soft-card">
      <view>
        <text class="cartown-card__label">CarTown English</text>
        <text class="cartown-card__title">小汽车英语小镇进度</text>
      </view>
      <view class="cartown-card__stats">
        <view class="cartown-card__stat">
          <text class="cartown-card__value">{{ cartownProgress.stars }}</text>
          <text class="cartown-card__name">星星</text>
        </view>
        <view class="cartown-card__stat">
          <text class="cartown-card__value">{{ cartownProgress.colorQuestionsDone }}</text>
          <text class="cartown-card__name">颜色题</text>
        </view>
        <view class="cartown-card__stat">
          <text class="cartown-card__value">{{ cartownProgress.logoQuizDone }}</text>
          <text class="cartown-card__name">车标题</text>
        </view>
      </view>
    </view>

    <view class="today-book soft-card">
      <view>
        <text class="today-book__label">今日绘本</text>
        <text class="today-book__title">{{ book.title }}</text>
        <text class="today-book__desc">{{ book.description }}</text>
      </view>
      <BigButton label="去阅读" @tap="goReader" />
    </view>

    <text class="section-title">今日陪读卡</text>
    <ParentTipCard :title="parentTip.title" :questions="parentTip.questions" :activity="parentTip.activity" />

    <view class="routine-card soft-card">
      <text class="routine-card__title">今晚可以这样做</text>
      <view class="routine-card__steps">
        <text class="routine-card__step">1. 先听一句，不急着纠音。</text>
        <text class="routine-card__step">2. 指一指图片里的核心词。</text>
        <text class="routine-card__step">3. 孩子愿意开口，就马上夸。</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import BigButton from "@/components/BigButton.vue";
import ParentTipCard from "@/components/ParentTipCard.vue";
import { getBookById, getParentTip, getTodayBook } from "@/services/bookService";
import { getCartownProgress } from "@/services/cartownProgressService";
import { getHomeStats, getLearningState } from "@/services/progressService";

const bookId = ref(getTodayBook().id);
const stats = computed(() => getHomeStats());
const learningState = computed(() => getLearningState());
const cartownProgress = computed(() => getCartownProgress());
const book = computed(() => getBookById(bookId.value) ?? getTodayBook());
const parentTip = computed(() => getParentTip(book.value.id));

onLoad((query) => {
  const params = query as Record<string, string | undefined>;
  bookId.value = params.bookId || getTodayBook().id;
});

function goReader() {
  uni.navigateTo({
    url: `/pages/reader/index?bookId=${book.value.id}&pageIndex=1`
  });
}
</script>

<style scoped lang="scss">
.parent-page {
  padding-bottom: 56rpx;
}

.parent-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 28rpx;
  padding: 32rpx;
  background:
    radial-gradient(circle at 92% 20%, rgba(255, 214, 107, 0.34), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eaf6ff 58%, #fff0dd 100%);
}

.parent-hero__status {
  flex: 0 0 auto;
  width: 132rpx;
  min-height: 132rpx;
  padding: 24rpx 10rpx;
  border-radius: 36rpx;
  text-align: center;
  background: rgba(255, 214, 107, 0.72);
}

.parent-hero__status--done {
  background: rgba(145, 216, 168, 0.58);
}

.parent-hero__status-value,
.parent-hero__status-label {
  display: block;
  color: $color-primary-dark;
}

.parent-hero__status-value {
  font-size: 30rpx;
  font-weight: 900;
}

.parent-hero__status-label {
  margin-top: 10rpx;
  font-size: 22rpx;
  font-weight: 900;
}

.parent-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 24rpx;
  padding: 18rpx;
}

.parent-stat {
  min-height: 136rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: rgba(221, 240, 255, 0.52);
}

.parent-stat__value {
  display: block;
  font-size: 34rpx;
  font-weight: 900;
  color: $color-primary;
}

.parent-stat__label {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  font-weight: 800;
  color: $color-muted;
}

.today-book {
  display: grid;
  grid-template-columns: 1fr 220rpx;
  gap: 20rpx;
  align-items: center;
  margin-top: 24rpx;
  padding: 30rpx;
}

.cartown-card {
  margin-top: 24rpx;
  padding: 30rpx;
}

.cartown-card__label {
  display: block;
  font-size: 24rpx;
  font-weight: 900;
  color: $color-coral;
}

.cartown-card__title {
  display: block;
  margin-top: 8rpx;
  font-size: 34rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.cartown-card__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 22rpx;
}

.cartown-card__stat {
  padding: 18rpx 8rpx;
  border-radius: 22rpx;
  text-align: center;
  background: rgba(221, 240, 255, 0.52);
}

.cartown-card__value,
.cartown-card__name {
  display: block;
}

.cartown-card__value {
  font-size: 38rpx;
  font-weight: 900;
  color: $color-primary;
}

.cartown-card__name {
  margin-top: 6rpx;
  font-size: 22rpx;
  font-weight: 800;
  color: $color-muted;
}

.today-book__label {
  display: block;
  font-size: 24rpx;
  font-weight: 900;
  color: $color-coral;
}

.today-book__title {
  display: block;
  margin-top: 8rpx;
  font-size: 36rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.today-book__desc {
  display: block;
  margin-top: 10rpx;
  font-size: 25rpx;
  color: $color-muted;
  line-height: 1.45;
}

.routine-card {
  margin-top: 24rpx;
  padding: 30rpx;
}

.routine-card__title {
  display: block;
  font-size: 32rpx;
  font-weight: 900;
  color: $color-primary-dark;
}

.routine-card__steps {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 20rpx;
}

.routine-card__step {
  display: block;
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  font-size: 26rpx;
  color: $color-muted;
  line-height: 1.45;
  background: rgba(255, 248, 236, 0.78);
}
</style>
