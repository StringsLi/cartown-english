<template>
  <view class="page parent-page screen-with-nav">
    <view class="parent-header">
      <text class="page-title">家长中心</text>
      <button class="settings-button" aria-label="打开孩子资料" @tap="goProfile">⌁</button>
    </view>

    <view class="child-card soft-card">
      <view class="child-card__avatar">{{ childInitial }}</view>
      <view class="child-card__copy">
        <text class="child-card__name">{{ childName }}</text>
        <text class="child-card__age">亲子阅读 · Level {{ book.level }}</text>
      </view>
      <button class="child-card__switch" @tap="goProfile">编辑资料</button>
    </view>

    <view class="week-card soft-card">
      <view>
        <text class="week-card__label">本周阅读时长</text>
        <view class="week-card__time-row">
          <text class="week-card__time">{{ weeklyMinutes }}</text>
          <text class="week-card__unit">分钟</text>
        </view>
        <text class="week-card__delta">{{ weeklyDeltaText }}</text>
      </view>
      <CachedImage class="week-card__image" :src="highResolutionAsset('/static/books/mom/cover.webp')" mode="aspectFill" />
    </view>

    <view class="streak-card soft-card">
      <view class="streak-card__head">
        <view>
          <text class="streak-card__label">阅读打卡</text>
          <text class="streak-card__value">连续打卡 {{ stats.streakDays }} 天</text>
        </view>
        <text class="streak-card__badge">本周</text>
      </view>
      <view class="streak-days">
        <view v-for="day in weekActivity" :key="day.dateKey" class="streak-day">
          <view class="streak-day__dot" :class="{ 'streak-day__dot--done': day.done, 'streak-day__dot--today': day.isToday }">
            {{ day.done ? "✓" : day.isToday ? "·" : "" }}
          </view>
          <text class="streak-day__label">{{ day.label }}</text>
        </view>
      </view>
    </view>

    <view class="progress-card soft-card">
      <view class="section-head progress-card__head">
        <text class="section-title">阅读进度</text>
        <text class="progress-card__percent">{{ readingPercent }}%</text>
      </view>
      <view class="progress-card__level-row">
        <view>
          <text class="progress-card__level">L{{ book.level }} 级别</text>
          <text class="progress-card__desc">已完成 {{ stats.readBookCount }} / 20 本</text>
        </view>
        <view class="level-medal">L{{ book.level }}</view>
      </view>
      <view class="progress-track">
        <view class="progress-track__fill" :style="{ width: `${readingPercent}%` }" />
      </view>
    </view>

    <view class="report-card soft-card">
      <view class="section-head report-card__head">
        <text class="section-title">学习报告</text>
        <text class="report-card__date">近 7 天</text>
      </view>
      <view v-for="skill in skillScores" :key="skill.label" class="skill-row">
        <text class="skill-row__label">{{ skill.label }}</text>
        <view class="skill-row__track">
          <view class="skill-row__fill" :style="{ width: `${skill.score}%` }" />
        </view>
        <text class="skill-row__score">{{ skill.score }}</text>
      </view>
      <view class="report-card__summary">
        <view class="report-stat">
          <text class="report-stat__value">{{ stats.learnedWordCount }}</text>
          <text class="report-stat__label">已学单词</text>
        </view>
        <view class="report-stat">
          <text class="report-stat__value">{{ learningState.repeatRecords.length }}</text>
          <text class="report-stat__label">跟读次数</text>
        </view>
        <view class="report-stat">
          <text class="report-stat__value">{{ cartownProgress.stars }}</text>
          <text class="report-stat__label">主题星星</text>
        </view>
      </view>
    </view>

    <view class="parent-advice soft-card">
      <view class="parent-advice__icon">♥</view>
      <view>
        <text class="parent-advice__title">家长建议</text>
        <text class="parent-advice__text">{{ parentTip.activity || "每天 15 分钟，用听、指、说的节奏陪孩子读一本小绘本。" }}</text>
      </view>
    </view>

    <BottomNav active="parent" />
  </view>
</template>

<script setup lang="ts">
import CachedImage from "@/components/CachedImage.vue";
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import BottomNav from "@/components/BottomNav.vue";
import { getBookById, getParentTip, getTodayBook } from "@/services/bookService";
import { getCartownProgress } from "@/services/cartownProgressService";
import { highResolutionAsset } from "@/services/assetService";
import { getCurrentWeekActivity, getHomeStats, getLearningState } from "@/services/progressService";

const bookId = ref(getTodayBook().id);
const stats = ref(getHomeStats());
const learningState = ref(getLearningState());
const cartownProgress = ref(getCartownProgress());
const weekActivity = ref(getCurrentWeekActivity());
const book = computed(() => getBookById(bookId.value) ?? getTodayBook());
const parentTip = computed(() => getParentTip(book.value.id));
const childName = computed(() => learningState.value.childNickname || "宝贝");
const childInitial = computed(() => childName.value.slice(0, 1).toUpperCase());
const weeklyMinutes = computed(() => {
  const seconds = stats.value.weeklyReadingSeconds;
  if (seconds > 0 && seconds < 60) return "<1";
  return String(Math.round(seconds / 60));
});
const weeklyDeltaText = computed(() => {
  const difference = Math.round((stats.value.weeklyReadingSeconds - stats.value.previousWeeklyReadingSeconds) / 60);
  if (difference === 0) return "与上周持平";
  return difference > 0 ? `比上周多 ${difference} 分钟` : `比上周少 ${Math.abs(difference)} 分钟`;
});
const readingPercent = computed(() => Math.min(100, Math.round((stats.value.readBookCount / 20) * 100)));
const skillScores = computed(() => [
  { label: "听读", score: Math.min(100, Math.round((stats.value.readBookCount / 20) * 100)) },
  { label: "词汇", score: Math.min(100, Math.round((stats.value.learnedWordCount / 40) * 100)) },
  { label: "跟读", score: Math.min(100, learningState.value.repeatRecords.length * 10) },
  { label: "练习", score: Math.min(100, learningState.value.gameRecords.length * 10) }
]);

onLoad((query) => {
  const params = query as Record<string, string | undefined>;
  bookId.value = params.bookId || getTodayBook().id;
});

onShow(refreshReport);

function refreshReport() {
  stats.value = getHomeStats();
  learningState.value = getLearningState();
  cartownProgress.value = getCartownProgress();
  weekActivity.value = getCurrentWeekActivity();
}

function goProfile() {
  uni.navigateTo({ url: "/pages/profile/index" });
}
</script>

<style scoped lang="scss">
.parent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rpx 0 20rpx;
}

.settings-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border: 1rpx solid $color-line;
  border-radius: 50%;
  font-size: 27rpx;
  color: $color-primary-dark;
  background: #fffdf9;
}

.child-card {
  display: grid;
  grid-template-columns: 70rpx 1fr auto;
  gap: 16rpx;
  align-items: center;
  padding: 20rpx 22rpx;
}

.child-card__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  font-size: 27rpx;
  font-weight: 800;
  color: #6f472f;
  background: #f1dcc4;
}

.child-card__name,
.child-card__age {
  display: block;
}

.child-card__name {
  font-size: 27rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.child-card__age {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: $color-muted;
}

.child-card__switch {
  min-height: 52rpx;
  padding: 0 18rpx;
  border: 1rpx solid $color-line;
  border-radius: $radius-pill;
  font-size: 19rpx;
  color: $color-muted;
  background: #f7f3ec;
}

.week-card {
  position: relative;
  min-height: 226rpx;
  margin-top: 18rpx;
  padding: 28rpx;
  overflow: hidden;
  background: #e7eee4;
}

.week-card__label,
.week-card__delta {
  display: block;
}

.week-card__label {
  font-size: 23rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.week-card__time-row {
  display: flex;
  align-items: baseline;
  gap: 7rpx;
  margin-top: 18rpx;
}

.week-card__time {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 66rpx;
  font-weight: 700;
  color: #1f2f43;
}

.week-card__unit {
  font-size: 23rpx;
  color: $color-muted;
}

.week-card__delta {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #71806d;
}

.week-card__image {
  position: absolute;
  right: 16rpx;
  bottom: 0;
  width: 218rpx;
  height: 194rpx;
  border-radius: $radius-card $radius-card 0 0;
  opacity: 0.86;
}

.streak-card,
.progress-card,
.report-card {
  margin-top: 18rpx;
  padding: 24rpx;
}

.streak-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.streak-card__label,
.streak-card__value {
  display: block;
}

.streak-card__label {
  font-size: 21rpx;
  color: $color-muted;
}

.streak-card__value {
  margin-top: 5rpx;
  font-size: 28rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.streak-card__badge {
  padding: 7rpx 14rpx;
  border-radius: $radius-pill;
  font-size: 19rpx;
  color: #6a805f;
  background: #e9efe4;
}

.streak-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8rpx;
  margin-top: 22rpx;
}

.streak-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.streak-day__dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  font-size: 19rpx;
  color: #8b857e;
  background: #eee9e1;
}

.streak-day__dot--done {
  color: #ffffff;
  background: #8ba77f;
}

.streak-day__dot--today {
  color: #ffffff;
  background: #c88e31;
}

.streak-day__label {
  font-size: 18rpx;
  color: $color-muted;
}

.progress-card__head,
.report-card__head {
  margin: 0 0 18rpx;
}

.progress-card__percent,
.report-card__date {
  font-size: 21rpx;
  color: $color-muted;
}

.progress-card__level-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.progress-card__level,
.progress-card__desc {
  display: block;
}

.progress-card__level {
  font-size: 27rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.progress-card__desc {
  margin-top: 5rpx;
  font-size: 20rpx;
  color: $color-muted;
}

.level-medal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  font-size: 26rpx;
  font-weight: 800;
  color: #ffffff;
  background: #c48a28;
}

.progress-track {
  height: 13rpx;
  margin-top: 20rpx;
  overflow: hidden;
  border-radius: $radius-pill;
  background: #ebe5dc;
}

.progress-track__fill {
  height: 100%;
  border-radius: inherit;
  background: #7f9f76;
}

.skill-row {
  display: grid;
  grid-template-columns: 64rpx 1fr 42rpx;
  gap: 14rpx;
  align-items: center;
  margin-top: 15rpx;
}

.skill-row__label,
.skill-row__score {
  font-size: 20rpx;
  color: $color-muted;
}

.skill-row__score {
  text-align: right;
}

.skill-row__track {
  height: 11rpx;
  overflow: hidden;
  border-radius: $radius-pill;
  background: #ebe5dc;
}

.skill-row__fill {
  height: 100%;
  border-radius: inherit;
  background: #d09a3d;
}

.report-card__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid $color-line;
}

.report-stat {
  text-align: center;
}

.report-stat__value,
.report-stat__label {
  display: block;
}

.report-stat__value {
  font-family: Georgia, serif;
  font-size: 31rpx;
  font-weight: 700;
  color: $color-primary-dark;
}

.report-stat__label {
  margin-top: 4rpx;
  font-size: 18rpx;
  color: $color-muted;
}

.parent-advice {
  display: grid;
  grid-template-columns: 54rpx 1fr;
  gap: 16rpx;
  margin-top: 18rpx;
  padding: 22rpx;
  background: #f7eee8;
}

.parent-advice__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  font-size: 22rpx;
  color: #ffffff;
  background: $color-primary;
}

.parent-advice__title,
.parent-advice__text {
  display: block;
}

.parent-advice__title {
  font-size: 23rpx;
  font-weight: 800;
  color: $color-primary-dark;
}

.parent-advice__text {
  margin-top: 6rpx;
  font-size: 20rpx;
  color: $color-muted;
  line-height: 1.46;
}
</style>
