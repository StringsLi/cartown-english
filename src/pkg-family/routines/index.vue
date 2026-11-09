<template>
  <view class="page family-page">
    <PageTopbar section="一句英语，一个生活小动作" />
    <view class="family-heading"><text class="section-kicker">ENGLISH IN OUR DAY</text><text class="page-title">生活里的英语</text><text class="family-subtitle">刷牙、穿衣、收玩具，把熟悉的日常变成亲子英语时间。</text></view>
    <view class="routine-summary"><text>今天一起完成 {{ completedCount }} 个场景</text><text>选一个现在用得上的就好</text></view>
    <view class="routine-grid"><button v-for="item in lifeRoutines" :key="item.id" role="button" :aria-pressed="selected === item.id" :class="{ 'routine-choice--selected': selected === item.id }" class="routine-choice" :style="{ backgroundColor: item.tint }" @tap="choose(item.id)"><text class="routine-choice__symbol">{{ item.symbol }}</text><text class="routine-choice__title">{{ item.title }}</text><text class="routine-choice__time">{{ complete(item.id) ? '✓ 今天玩过' : item.time }}</text></button></view>
    <AudioFeedback />
    <view class="routine-detail" :style="{ backgroundColor: routine.tint }">
      <text class="routine-detail__english">{{ routine.english }}</text><text class="routine-detail__title">{{ routine.title }}</text><text class="family-subtitle">{{ routine.tip }}</text>
      <view class="routine-progress">
        <text role="status" aria-live="polite">今天一起做过 {{ doneCount }} / {{ routine.steps.length }} 步</text>
        <view class="routine-progress__track" role="progressbar" :aria-valuenow="doneCount" :aria-valuemax="routine.steps.length" aria-valuemin="0" :aria-label="routine.title + '完成进度'"><view :style="{ width: `${doneCount / routine.steps.length * 100}%` }" /></view>
        <button v-if="nextStepIndex >= 0" role="button" class="routine-progress__continue" @tap="continueRoutine">{{ doneCount ? `继续第 ${nextStepIndex + 1} 步` : '从第一步开始' }} ↓</button>
      </view>
      <view v-for="(step, index) in routine.steps" :id="'routine-step-' + step.id" :key="step.id" class="step-card">
        <text class="step-card__number">一起做 · {{ index + 1 }} / {{ routine.steps.length }}</text><text class="step-card__english">{{ step.english }}</text><text class="step-card__chinese">{{ step.chinese }}</text>
        <button role="button" class="step-card__listen" :aria-label="(sampleActive(step.english) ? '停止示范：' : '听示范：') + step.english" :aria-pressed="sampleActive(step.english)" @tap="listen(step.id, step.english)">{{ sampleActive(step.english) ? (audioPlaybackState.phase === 'loading' ? '取消加载' : '■ 停止示范') : '▶ 听一句示范' }}</button>
        <view class="step-card__action"><text>放下手机，试一试</text><text>{{ step.action }}</text></view>
        <button role="button" class="step-card__done" :aria-pressed="doneIds.includes(step.id)" :class="{ 'step-card__done--yes': doneIds.includes(step.id) }" @tap="mark(step.id)">{{ doneIds.includes(step.id) ? '✓ 今天做过了 · 点此撤销' : '♡ 我和孩子一起做过了' }}</button>
      </view>
      <view v-if="complete(routine.id)" class="routine-celebration" role="status"><text>今天的{{ routine.title }}完成啦</text><text>一句话、一个动作，就是很好的陪伴。</text></view>
    </view>
    <view class="family-section"><text class="family-section__title">最近七天的陪玩足迹</text><view class="routine-week"><view v-for="day in week" :key="day.date" :aria-label="`${day.label}，完成${day.count}个场景`"><text :class="{ 'routine-week--done': day.count > 0 }">{{ day.count ? day.count : '·' }}</text><text>{{ day.label }}</text></view></view><text class="family-subtitle">数字代表当天一起完成的场景，同一场景一天只记一次。</text></view>
    <button role="button" class="listen-link" @tap="openListening">☾ 想听故事？去故事陪听室 ›</button>
    <text class="family-footnote">由家长确认陪玩，不做发音评分，不增加星星。最近 90 天的记录保存在本机。</text>
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow, onHide, onUnload } from "@dcloudio/uni-app";
import PageTopbar from "@/components/PageTopbar.vue";
import AudioFeedback from "@/components/AudioFeedback.vue";
import { usePageShare } from "@/composables/usePageShare";
import { audioPlaybackState, playAudio, stopAudio } from "@/services/audioService";
import { navigate } from "@/services/navigationService";
import { todayKey } from "@/utils/date";
import { lifeRoutines, routineAudio } from "../catalog";
import { getRoutineProgress, getRoutineWeek, selectRoutine, setRoutineStep } from "../services/routineService";
usePageShare({ title: "生活里的英语，一句话陪孩子做一个小动作" });
const progress = ref(getRoutineProgress()), date = ref(todayKey());
const selected = ref(progress.value.selected), week = ref(getRoutineWeek());
const routine = computed(() => lifeRoutines.find(item => item.id === selected.value)!);
const doneIds = computed(() => progress.value.days[date.value] || []);
const doneCount = computed(() => routine.value.steps.filter(step => doneIds.value.includes(step.id)).length);
const nextStepIndex = computed(() => routine.value.steps.findIndex(step => !doneIds.value.includes(step.id)));
const complete = (id: string) => lifeRoutines.find(item => item.id === id)!.steps.every(step => doneIds.value.includes(step.id));
const completedCount = computed(() => lifeRoutines.filter(item => complete(item.id)).length);
function refresh() { date.value = todayKey(); progress.value = getRoutineProgress(); selected.value = progress.value.selected; week.value = getRoutineWeek(); }
function choose(id: string) { stopAudio(); selected.value = id; selectRoutine(id); refresh(); }
function sampleActive(english: string) { return audioPlaybackState.value.label === english && ["loading", "playing"].includes(audioPlaybackState.value.phase); }
function listen(id: string, english: string) { refresh(); if (sampleActive(english)) stopAudio(); else playAudio(routineAudio(id), english); }
function continueRoutine() {
  const step = routine.value.steps[nextStepIndex.value];
  if (step) uni.pageScrollTo({ selector: '#routine-step-' + step.id, duration: 300 });
}
function mark(id: string) { refresh(); setRoutineStep(id, !doneIds.value.includes(id), date.value); refresh(); }
function openListening() { navigate({ url: "/pkg-family/listen/index" }); }
let clock: ReturnType<typeof setInterval> | undefined;
onShow(() => { refresh(); clearInterval(clock); clock = setInterval(refresh, 30000); });
function leave() { stopAudio(); clearInterval(clock); clock = undefined; }
onHide(leave); onUnload(leave);
</script>
<style scoped lang="scss">
@use "../family.scss";
.family-page button { margin:0; line-height:1.5; }.family-page button::after { border:0; }
.routine-summary { display:flex; flex-direction:column; gap:8rpx; margin:24rpx 0; padding:24rpx; border-radius:24rpx; background:#e9efdf; color:#56704a; font-size:25rpx; font-weight:700; }.routine-summary text + text { font-weight:400; font-size:22rpx; }
.routine-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14rpx; }.routine-choice { display:flex; flex-direction:column; align-items:center; gap:8rpx; padding:22rpx 8rpx; min-height:44px; border:3rpx solid transparent; border-radius:24rpx; }.routine-grid .routine-choice--selected { border-color:#587b59; box-shadow:0 4rpx 0 #587b591a; }.routine-choice__symbol { font-size:40rpx; }.routine-choice__title { font-size:23rpx; font-weight:800; color:#49634d; }.routine-choice__time { font-size:19rpx; color:#6d7e65; }
.routine-detail { margin-top:28rpx; border-radius:32rpx; padding:26rpx; }.routine-detail__english { display:block; font-size:23rpx; color:#718366; font-weight:700; }.routine-detail__title { display:block; font-size:36rpx; font-weight:800; color:#3f5b48; margin-top:10rpx; }
.routine-progress { margin-top:22rpx; font-size:23rpx; color:#49634d; }.routine-progress__track { height:10rpx; margin-top:14rpx; overflow:hidden; border-radius:10rpx; background:#ffffff9c; }.routine-progress__track > view { height:100%; border-radius:inherit; background:#5d7b53; transition:width .2s; }.routine-progress__continue { width:100%; min-height:44px; margin-top:16rpx; padding:12rpx; border-radius:18rpx; background:#fffdf8; color:#49634d; font-size:24rpx; font-weight:700; }
.step-card { margin-top:22rpx; padding:24rpx; background:#fffdf8; border-radius:24rpx; }.step-card__number { display:block; font-size:19rpx; color:#a18c65; }.step-card__english { display:block; font-size:31rpx; font-weight:800; line-height:1.6; color:#3e5c4d; margin-top:14rpx; overflow-wrap:anywhere; }.step-card__chinese { display:block; font-size:23rpx; color:#848575; line-height:1.6; margin-top:7rpx; }.step-card__listen { display:flex; align-items:center; justify-content:center; width:100%; min-height:44px; padding:12rpx; margin-top:18rpx; border-radius:17rpx; background:#e6eee0; color:#456644; font-size:24rpx; font-weight:700; }.step-card__action { display:flex; flex-direction:column; gap:10rpx; padding:20rpx; margin-top:18rpx; border-radius:16rpx; background:#f5efe1; color:#7c7765; font-size:23rpx; line-height:1.7; }.step-card__action text:first-child { font-size:19rpx; font-weight:800; color:#9c845c; }.step-card__done { width:100%; min-height:44px; margin-top:18rpx; padding:12rpx 8rpx; border:1rpx solid #d3dfca; border-radius:18rpx; font-size:22rpx; color:#69805c; }.step-card__done--yes { color:#fffdf0; background:#5d7b53; border-color:#5d7b53; }
.routine-celebration { display:flex; flex-direction:column; text-align:center; gap:10rpx; padding:28rpx 0 4rpx; font-size:25rpx; font-weight:800; color:#58704c; }.routine-celebration text + text { font-size:22rpx; font-weight:400; line-height:1.7; }
.routine-week { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:6rpx; margin-top:24rpx; }.routine-week view { display:flex; flex-direction:column; align-items:center; gap:12rpx; font-size:18rpx; color:#819074; }.routine-week view text:first-child { display:flex; align-items:center; justify-content:center; width:56rpx; height:56rpx; background:#f0f1e7; border-radius:50%; font-size:23rpx; }.routine-week view .routine-week--done { color:#fffdf0; background:#6b875e; }.routine-week + .family-subtitle { font-size:21rpx; }
.listen-link { display:flex; align-items:center; justify-content:center; width:100%; min-height:48px; padding:20rpx; margin-top:24rpx; border-radius:24rpx; background:#e7e8f0; color:#6c6885; font-size:24rpx; }
</style>
