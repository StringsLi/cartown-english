<template>
  <view class="page home-page screen-with-nav">
    <view class="brand-row">
      <view class="brand-copy"><text class="section-kicker">LITTLE DRIVER CLUB</text><text class="page-title">车车英语乐园</text><text class="greeting">{{ childName }}，今天想去哪里玩？</text></view>
      <button role="button" class="star-pocket" aria-label="查看我的车库" @tap="goGarage"><text class="star-pocket__value">★ {{ progress.stars }}</text><text class="star-pocket__label">我的车库 ›</text></button>
    </view>

    <view class="today-trip">
      <view class="today-trip__heading"><text class="today-trip__tag">今天的小旅程</text><text class="today-trip__progress">{{ finishedSteps }} / 3 个小活动</text></view>
      <view class="today-trip__body"><view class="today-trip__copy"><text class="today-trip__title">{{ primaryTitle }}</text><text class="today-trip__note">{{ primaryNote }}</text></view><image class="today-trip__car" src="/static/ui/home-red-car.png" mode="aspectFit" /></view>
      <button role="button" class="home-primary" @tap="primaryAction"><text>{{ primaryLabel }}</text><text class="home-primary__arrow">›</text></button>
      <view class="daily-steps"><button role="button" v-for="(step, index) in dailySteps" :key="step.title" class="daily-step" :class="{ 'daily-step--done': step.done }" :aria-label="step.title + '，' + step.detail + (step.done ? '，已完成' : '')" @tap="openStep(index)"><text class="daily-step__mark">{{ step.done ? '✓' : index + 1 }}</text><view class="daily-step__copy"><text class="daily-step__title">{{ step.title }}</text><text class="daily-step__detail">{{ step.detail }}</text></view></button></view>
    </view>
    <AudioFeedback />

    <view class="section-head home-section-head"><text class="section-title">选一个喜欢的世界</text><text class="section-caption">随时换，慢慢玩</text></view>
    <view class="world-grid">
      <button role="button" v-for="item in homeWorlds" :key="item.id" class="world-card" :class="'world-card--' + item.id" :aria-label="item.title + '，' + item.note" @tap="openDestination(item.url)">
        <view class="world-card__top"><HomeModuleArt :kind="item.kind" /><text class="world-card__arrow">↗</text></view>
        <text class="world-card__title">{{ item.title }}</text><text class="world-card__english">{{ item.english }}</text><text class="world-card__note">{{ item.note }}</text>
      </button>
    </view>

    <view class="section-head home-section-head"><text class="section-title">车车练习站</text><text class="section-caption">听一听，再动手</text></view>
    <view class="practice-grid">
      <button role="button" v-for="item in homePractices" :key="item.id" class="practice-card" :class="'practice-card--' + item.id" @tap="openDestination(item.url)"><text class="practice-card__icon">{{ item.icon }}</text><view class="practice-card__copy"><text class="practice-card__title">{{ item.title }}</text><text class="practice-card__note">{{ item.note }}</text></view><text class="practice-card__arrow">›</text></button>
    </view>

    <view class="section-head home-section-head"><text class="section-title">一起陪玩</text><text class="section-caption">声音与小纪念</text></view>
    <view class="family-tools">
      <button role="button" class="tool-row" @tap="openChants"><text class="tool-row__icon tool-row__icon--music">♫</text><view class="tool-row__copy"><text class="tool-row__title">儿歌电台</text><text class="tool-row__note">听节奏，和孩子一起动一动</text></view><text class="tool-row__arrow">›</text></button>
      <button role="button" class="tool-row" @tap="openFamilyPlay"><text class="tool-row__icon tool-row__icon--family">♡</text><view class="tool-row__copy"><text class="tool-row__title">亲子小任务</text><text class="tool-row__note">一句英语，带进日常生活</text></view><text class="tool-row__arrow">›</text></button>
      <button role="button" class="tool-row tool-row--last" @tap="openRecordings"><text class="tool-row__icon tool-row__icon--voice">♪</text><view class="tool-row__copy"><text class="tool-row__title">声音小纪念</text><text class="tool-row__note">{{ recordingCount ? '本机保存 ' + recordingCount + ' 条录音 · 回听与备份' : '跟读后保存的录音，可以回听和备份' }}</text></view><text class="tool-row__arrow">›</text></button>
    </view>
    <button role="button" v-if="reviewTopic" class="review-card" @tap="openReview"><view class="review-card__copy"><text class="review-card__title">老朋友，再见面</text><text class="review-card__note">{{ reviewTopic.title }} · 复习 {{ reviewCount }} 个小伙伴</text></view><text class="review-card__link">去听听 ›</text></button>
    <button role="button" class="parent-summary" @tap="goParent"><view class="parent-summary__copy"><text class="parent-summary__title">给家长看的小足迹</text><text class="parent-summary__note">听过 {{ summary.heard }} 个词 · 独立找对 {{ summary.independent }} 个词</text></view><text class="parent-summary__link">查看 ›</text></button>
    <text class="home-footnote">想停就停，进度保存在这台设备。</text>
    <BottomNav active="home" />
  </view>
</template>
<script setup lang="ts">
import { navigate } from "@/services/navigationService";
import { computed, ref } from "vue";
import { onShow, onHide, onUnload } from "@dcloudio/uni-app";
import BottomNav from "@/components/BottomNav.vue";
import AudioFeedback from "@/components/AudioFeedback.vue";
import HomeModuleArt from "@/components/HomeModuleArt.vue";
import { homeWorlds, homePractices } from "@/mock/homeDiscovery";
import { getLearningState } from "@/services/progressService";
import { getCartownProgress } from "@/services/cartownProgressService";
import { getPlaygroundTopic, getSuggestedPlaygroundTopic } from "@/mock/playground";
import { getTodayPlay, getPlaygroundLearning, getPlaygroundSummary, getReviewTopic, getReviewItems } from "@/services/playgroundLearningService";
import { stopAudio } from "@/services/audioService";
import { usePageShare } from "@/composables/usePageShare";
usePageShare();
const childName = ref(getLearningState().childNickname || "小小司机");
const progress = ref(getCartownProgress()), daily = ref({ ...getTodayPlay() });
const session = ref(getPlaygroundLearning().session), summary = ref(getPlaygroundSummary(progress.value.playgroundHeardWordIds));
const reviewTopic = ref(getReviewTopic());
const recordingCount = ref(getLearningState().repeatRecords.length);
const reviewCount = ref(reviewTopic.value ? getReviewItems(reviewTopic.value.id).length : 0);
const suggestedTopic = computed(() => getSuggestedPlaygroundTopic(progress.value.playgroundCompletedTopicIds));
const resumeTopic = computed(() => session.value && getPlaygroundTopic(session.value.topicId));
const dailySteps = computed(() => [
  { title: "听 3 个词", detail: `${Math.min(3, daily.value.heardIds.length)} / 3`, done: daily.value.heardIds.length >= 3 },
  { title: "找对 2 张图", detail: `${Math.min(2, daily.value.solvedIds.length)} / 2`, done: daily.value.solvedIds.length >= 2 },
  { title: "玩 1 个故事", detail: `${Math.min(1, daily.value.adventureIds.length)} / 1`, done: daily.value.adventureIds.length >= 1 }
]);
const todayDone = computed(() => dailySteps.value.every(s => s.done));
onShow(() => { recordingCount.value = getLearningState().repeatRecords.length; childName.value = getLearningState().childNickname || "小小司机"; progress.value = getCartownProgress(); daily.value = { ...getTodayPlay() }; session.value = getPlaygroundLearning().session; summary.value = getPlaygroundSummary(progress.value.playgroundHeardWordIds); reviewTopic.value = getReviewTopic(); reviewCount.value = reviewTopic.value ? getReviewItems(reviewTopic.value.id).length : 0; });
onHide(stopAudio); onUnload(stopAudio);
function openDestination(url: string) { navigate({ url }); }
function primaryAction() { if (session.value && resumeTopic.value) resume(); else startToday(); }
function openChants() { openDestination("/pkg-music/index/index"); }
function openFamilyPlay() { openDestination("/pkg-learning/playground/index?tab=parent"); }
function openRecordings() { openDestination("/pkg-reading/recordings/index"); }
const finishedSteps = computed(() => dailySteps.value.filter(step => step.done).length);
const primaryTitle = computed(() => session.value && resumeTopic.value ? "接着玩 · " + resumeTopic.value.title : todayDone.value ? "今天的小旅程完成啦" : "听一听，找一找，开车出发");
const primaryNote = computed(() => session.value && resumeTopic.value ? session.value.mode === "learn" ? "上次点读到第 " + (session.value.wordIndex + 1) + " 个小伙伴" : (session.value.reviewOnly ? "复习" : "找图") + "第 " + (session.value.questionIndex + 1) + " / " + session.value.questionIds.length + " 题" : todayDone.value ? "拿出玩具车，和家长接着演一演。" : "从" + suggestedTopic.value.title + "开始，想听几遍都可以。");
const primaryLabel = computed(() => session.value && resumeTopic.value ? "继续上次的小旅程" : todayDone.value ? "再玩一个车车故事" : "开始今天的小旅程");
function startToday() { openStep(todayDone.value ? 2 : dailySteps.value.findIndex(s => !s.done)); }
function openStep(index: number) { if (index === 2) return goAdventure(); stopAudio(); navigate({ url: `/pkg-learning/playground-game/index?topic=${suggestedTopic.value.id}${index === 1 ? '&mode=quiz' : ''}` }); }
function resume() { if (session.value) navigate({ url: `/pkg-learning/playground-game/index?topic=${session.value.topicId}&resume=1` }); }
function openReview() { if (reviewTopic.value) navigate({ url: `/pkg-learning/playground-game/index?topic=${reviewTopic.value.id}&mode=quiz&review=1` }); }
function goAdventure() { navigate({ url: "/pkg-adventure/index/index" }); }
function goGarage() { navigate({ url: "/pkg-cars/car-garage/index" }); }
function goParent() { navigate({ url: "/pkg-user/parent/index" }, "reLaunch"); }
</script>
<style scoped lang="scss">
.home-page { background: #faf8f1; }
.brand-row { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; margin: 5rpx 0 28rpx; }.brand-copy { min-width: 0; }.brand-row .section-kicker { font-size: 17rpx; letter-spacing: 2rpx; color: #867668; margin-bottom: 10rpx; }.brand-row .page-title { font-size: 38rpx; color: #314d44; }.greeting { display: block; font-size: 23rpx; line-height: 1.55; color: #756f62; margin-top: 12rpx; }
.star-pocket { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: none; min-height: 44px; padding: 14rpx 18rpx; border-radius: 23rpx; background: #f4e8ca; color: #876937; }.star-pocket__value { font-size: 26rpx; font-weight: 900; line-height: 1.2; }.star-pocket__label { margin-top: 7rpx; font-size: 18rpx; line-height: 1.3; }
.today-trip { padding: 26rpx; border: 1rpx solid #d9e3d4; border-radius: 30rpx; background: linear-gradient(140deg,#e8f0df,#f0f3e8); }.today-trip__heading { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; }.today-trip__tag { font-size: 21rpx; font-weight: 800; color: #627458; }.today-trip__progress { font-size: 19rpx; color: #73816b; }.today-trip__body { display: flex; align-items: center; gap: 12rpx; min-height: 130rpx; margin-top: 12rpx; }.today-trip__copy { flex: 1; min-width: 0; }.today-trip__title { display: block; font-size: 31rpx; line-height: 1.5; font-weight: 900; color: #304c41; }.today-trip__note { display: block; margin-top: 9rpx; font-size: 22rpx; line-height: 1.6; color: #64715e; }.today-trip__car { width: 155rpx; height: 116rpx; flex: none; }.home-primary { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 48px; margin: 18rpx 0 15rpx; padding: 18rpx 26rpx; border-radius: 21rpx; background: #31584b; color: #fffdf7; font-size: 27rpx; font-weight: 800; line-height: 1.4; }.home-primary__arrow { flex: none; margin-left: 12rpx; font-size: 35rpx; }
.daily-steps { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 7rpx; }.daily-step { display: flex; align-items: center; justify-content: center; gap: 9rpx; min-height: 44px; padding: 11rpx 4rpx; border-radius: 17rpx; background: #ffffff90; text-align: left; }.daily-step__mark { display: flex; align-items: center; justify-content: center; width: 28rpx; height: 28rpx; flex: none; border-radius: 50%; background: #e2e9d8; color: #72856a; font-size: 18rpx; font-weight: 800; }.daily-step--done .daily-step__mark { background: #65876a; color: #fff; }.daily-step__copy { min-width: 0; }.daily-step__title,.daily-step__detail { display: block; line-height: 1.45; }.daily-step__title { color: #52664d; font-size: 20rpx; font-weight: 700; white-space: nowrap; }.daily-step__detail { margin-top: 3rpx; color: #73836b; font-size: 18rpx; }
.home-section-head { margin: 34rpx 0 18rpx; gap: 12rpx; }.home-section-head .section-title { font-size: 29rpx; color: #354d45; }.section-caption { flex: none; font-size: 19rpx; color: #81796e; }
.world-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16rpx; }.world-card { display: flex; flex-direction: column; align-items: flex-start; padding: 20rpx 22rpx 23rpx; border: 1rpx solid #ffffffd9; border-radius: 27rpx; text-align: left; background: #eae4f2; color: #51466b; }.world-card--book { background: #f6e9d8; color: #775738; }.world-card--world { background: #e0edf0; color: #3f6e7b; }.world-card--logo { background: #e9efdf; color: #567146; }.world-card--town { background: #f5e5de; color: #97614b; }.world-card--space { background: #e8e6f0; color: #686085; }.world-card__top { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 9rpx; }.world-card__arrow { font-size: 27rpx; opacity: .7; }.world-card__title { font-size: 29rpx; line-height: 1.4; font-weight: 900; color: #364b43; }.world-card__english { display: block; margin-top: 6rpx; font-size: 19rpx; line-height: 1.4; font-weight: 700; }.world-card__note { display: block; margin-top: 9rpx; font-size: 21rpx; line-height: 1.5; color: #6f746a; }
.practice-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12rpx; }.practice-card { display: flex; align-items: center; gap: 10rpx; min-height: 110rpx; padding: 19rpx 14rpx; border-radius: 22rpx; border: 1rpx solid #e8e3d8; background: #fffdf8; text-align: left; }.practice-card__icon { display: flex; align-items: center; justify-content: center; flex: none; width: 50rpx; height: 52rpx; border-radius: 15rpx; color: #7d7766; background: #eee9dd; font-size: 18rpx; font-weight: 900; }.practice-card--colors .practice-card__icon { color: #b67861; background: #f5e5db; font-size: 32rpx; }.practice-card--count .practice-card__icon { color: #677d65; background: #e6eddf; }.practice-card--traffic .practice-card__icon { color: #678190; background: #e4edf2; }.practice-card__copy { flex: 1; min-width: 0; }.practice-card__title { display: block; font-size: 23rpx; line-height: 1.4; font-weight: 800; color: #425449; }.practice-card__note { display: block; margin-top: 6rpx; font-size: 18rpx; line-height: 1.5; color: #7b7c70; }.practice-card__arrow { font-size: 27rpx; color: #a49c8e; flex: none; }
.family-tools { padding: 0 23rpx; border-radius: 27rpx; border: 1rpx solid #e7e0d4; background: #fffdf8; }.tool-row { display: flex; align-items: center; gap: 18rpx; width: 100%; padding: 23rpx 0; border-bottom: 1rpx solid #eee8dd; text-align: left; }.tool-row--last { border-bottom: 0; }.tool-row__icon { display: flex; justify-content: center; align-items: center; width: 65rpx; height: 65rpx; border-radius: 20rpx; flex: none; font-size: 32rpx; }.tool-row__icon--music { color: #8b779e; background: #eee7f2; }.tool-row__icon--family { color: #a47966; background: #f5e6df; }.tool-row__icon--voice { color: #6d8b7b; background: #e4eee5; }.tool-row__copy { flex: 1; min-width: 0; }.tool-row__title { display: block; font-size: 25rpx; font-weight: 800; line-height: 1.5; color: #455449; }.tool-row__note { display: block; margin-top: 5rpx; font-size: 21rpx; line-height: 1.6; color: #777c70; }.tool-row__arrow { font-size: 29rpx; color: #9b9d8f; flex: none; }
.review-card { display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 16rpx; padding: 23rpx; margin-top: 20rpx; border-radius: 24rpx; background: #fff0d7; text-align: left; }.review-card__copy { flex: 1; min-width: 0; }.review-card__title { display: block; font-size: 25rpx; line-height: 1.5; font-weight: 800; color: #7e6544; }.review-card__note { display: block; font-size: 21rpx; line-height: 1.6; color: #8f7655; margin-top: 6rpx; }.review-card__link { font-size: 21rpx; color: #8f7655; flex: none; }
.parent-summary { display: flex; justify-content: space-between; align-items: center; gap: 14rpx; width: 100%; padding: 29rpx 5rpx; margin-top: 6rpx; text-align: left; }.parent-summary__copy { flex: 1; min-width: 0; }.parent-summary__title { display: block; font-size: 24rpx; line-height: 1.5; font-weight: 800; color: #6c7768; }.parent-summary__note { display: block; margin-top: 6rpx; font-size: 20rpx; line-height: 1.6; color: #808579; }.parent-summary__link { font-size: 21rpx; flex: none; color: #778170; }.home-footnote { display: block; text-align: center; font-size: 20rpx; line-height: 1.6; color: #8b8a7c; padding-bottom: 12rpx; }
@media (max-width: 350px) { .today-trip__car { width: 128rpx; height: 105rpx; }.today-trip__title { font-size: 29rpx; }.daily-step { gap: 6rpx; }.world-card { padding: 18rpx; }.practice-card { gap: 8rpx; padding: 18rpx 12rpx; }.practice-card__icon { width: 43rpx; }.practice-card__arrow { display: none; } }
</style>
