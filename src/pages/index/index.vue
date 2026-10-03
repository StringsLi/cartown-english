<template>
  <view class="page home-page screen-with-nav">
    <view class="brand-row"><view><text class="section-kicker">HELLO, LITTLE DRIVER</text><text class="page-title">车车英语乐园</text><text class="greeting">{{ childName }}，一起玩一会儿英语吧。</text></view><button role="button" class="star-pocket" aria-label="查看我的车库" @tap="goGarage">★ {{ progress.stars }}</button></view>
    <view class="today-trip">
      <text class="today-trip__tag">今天的小旅程 · 慢慢玩</text><image class="today-trip__car" src="/static/ui/home-red-car.png" mode="aspectFit" />
      <text class="today-trip__title">{{ todayDone ? '今天的小旅程完成啦！' : '听一听，找一找，开车出发' }}</text>
      <text class="today-trip__note">{{ todayDone ? '拿出玩具车，和家长接着演一演。' : `从${suggestedTopic.title}开始，想听几遍都可以。` }}</text>
      <button role="button" class="home-primary" @tap="startToday">{{ todayDone ? '再选一个喜欢的故事 ›' : '开始今天的小旅程 ›' }}</button>
      <view class="daily-steps"><button role="button" v-for="(step, index) in dailySteps" :key="step.title" @tap="openStep(index)"><view :class="{ 'daily-steps__done': step.done }">{{ step.done ? '✓' : index + 1 }}</view><text>{{ step.title }}</text><text>{{ step.detail }}</text></button></view>
    </view>
    <AudioFeedback />
    <button role="button" v-if="session" class="continue-card" @tap="resume"><view><text class="small-tag">接着上次玩</text><text class="card-title">{{ resumeTopic?.title }}</text><text class="card-note">{{ session.mode === 'learn' ? `点读到第 ${session.wordIndex + 1} 个小伙伴` : `${session.reviewOnly ? '复习' : '找图'}第 ${session.questionIndex + 1} / ${session.questionIds.length} 题` }}</text></view><text class="card-arrow">继续 ›</text></button>
    <button role="button" v-if="reviewTopic" class="review-card" @tap="openReview"><view><text class="small-tag">老朋友，再见面</text><text class="card-title">来复习 {{ reviewCount }} 个小伙伴</text><text class="card-note">{{ reviewTopic.title }} · 先听一遍，再找图片</text></view><text class="card-arrow">出发 ›</text></button>
    <view class="section-head"><text class="section-title">今天想怎么玩？</text></view>
    <view class="play-grid"><button role="button" class="play-card play-card--learn" @tap="goPlayground"><text class="play-card__icon">A · Z</text><text class="card-title">点图听英语</text><text class="card-note">8 个主题，认识小伙伴</text><text class="play-card__link">去英语乐园 ↗</text></button><button role="button" class="play-card play-card--town" @tap="goAdventure"><text class="play-card__icon">▣</text><text class="card-title">车车小故事</text><text class="card-note">送水果，和家长一起演</text><text class="play-card__link">去车车小镇 ↗</text></button></view>
    <view class="explore-section"><button role="button" class="explore-toggle" :aria-expanded="showExplore" @tap="showExplore = !showExplore"><view><text class="card-title">还想探索更多？</text><text class="card-note">绘本、真车、车标和世界地图</text></view><text>{{ showExplore ? '收起 ⌃' : '展开 ⌄' }}</text></button><view v-if="showExplore" class="explore-links"><button role="button" @tap="goBooks">▤ 车车绘本 ›</button><button role="button" @tap="goVehicles">▣ 认识真车 ›</button><button role="button" @tap="goLogos">◎ 车标发现 ›</button><button role="button" @tap="goWorld">✦ 世界地图 ›</button></view></view>
    <button role="button" class="parent-summary" @tap="goParent"><view><text class="card-title">给家长看的小足迹</text><text class="card-note">听过 {{ summary.heard }} 个词 · 独立找对 {{ summary.independent }} 个词</text></view><text>查看 ›</text></button>
    <text class="home-footnote">想停就停，进度会保存在这台设备。</text>
    <BottomNav active="home" />
  </view>
</template>
<script setup lang="ts">
import { navigate } from "@/services/navigationService";
import { computed, ref } from "vue";
import { onShow, onHide, onUnload } from "@dcloudio/uni-app";
import BottomNav from "@/components/BottomNav.vue";
import AudioFeedback from "@/components/AudioFeedback.vue";
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
const reviewTopic = ref(getReviewTopic()), showExplore = ref(false);
const reviewCount = ref(reviewTopic.value ? getReviewItems(reviewTopic.value.id).length : 0);
const suggestedTopic = computed(() => getSuggestedPlaygroundTopic(progress.value.playgroundCompletedTopicIds));
const resumeTopic = computed(() => session.value && getPlaygroundTopic(session.value.topicId));
const dailySteps = computed(() => [
  { title: "听 3 个词", detail: `${Math.min(3, daily.value.heardIds.length)} / 3`, done: daily.value.heardIds.length >= 3 },
  { title: "找对 2 张图", detail: `${Math.min(2, daily.value.solvedIds.length)} / 2`, done: daily.value.solvedIds.length >= 2 },
  { title: "玩 1 个故事", detail: `${Math.min(1, daily.value.adventureIds.length)} / 1`, done: daily.value.adventureIds.length >= 1 }
]);
const todayDone = computed(() => dailySteps.value.every(s => s.done));
onShow(() => { childName.value = getLearningState().childNickname || "小小司机"; progress.value = getCartownProgress(); daily.value = { ...getTodayPlay() }; session.value = getPlaygroundLearning().session; summary.value = getPlaygroundSummary(progress.value.playgroundHeardWordIds); reviewTopic.value = getReviewTopic(); reviewCount.value = reviewTopic.value ? getReviewItems(reviewTopic.value.id).length : 0; });
onHide(stopAudio); onUnload(stopAudio);
function startToday() { openStep(todayDone.value ? 2 : dailySteps.value.findIndex(s => !s.done)); }
function openStep(index: number) { if (index === 2) return goAdventure(); stopAudio(); navigate({ url: `/pkg-learning/playground-game/index?topic=${suggestedTopic.value.id}${index === 1 ? '&mode=quiz' : ''}` }); }
function resume() { if (session.value) navigate({ url: `/pkg-learning/playground-game/index?topic=${session.value.topicId}&resume=1` }); }
function openReview() { if (reviewTopic.value) navigate({ url: `/pkg-learning/playground-game/index?topic=${reviewTopic.value.id}&mode=quiz&review=1` }); }
function goPlayground() { navigate({ url: "/pkg-learning/playground/index" }); }
function goAdventure() { navigate({ url: "/pkg-adventure/index/index" }); }
function goGarage() { navigate({ url: "/pkg-learning/car-garage/index" }); }
function goBooks() { navigate({ url: "/pages/books/index" }, "reLaunch"); }
function goVehicles() { navigate({ url: "/pages/vehicles/index" }, "reLaunch"); }
function goLogos() { navigate({ url: "/pkg-learning/car-logos/index" }); }
function goWorld() { navigate({ url: "/pkg-world/world/index" }); }
function goParent() { navigate({ url: "/pkg-user/parent/index" }, "reLaunch"); }
</script>
<style scoped lang="scss">
.home-page { background: #faf7ee; }.brand-row { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; margin-bottom: 26rpx; }.brand-row .section-kicker { font-size: 17rpx; letter-spacing: 2rpx; }.brand-row .page-title { font-size: 38rpx; }.greeting { display: block; font-size: 22rpx; line-height: 1.5; color: #8f846f; margin-top: 12rpx; }.star-pocket { flex: none; padding: 15rpx 20rpx; border-radius: 24rpx; background: #f7e4b8; font-size: 25rpx; font-weight: 900; color: #a38343; }
.today-trip { position: relative; overflow: hidden; padding: 28rpx; border: 1rpx solid #e0e6d5; border-radius: 34rpx; background: linear-gradient(150deg,#e9f0df,#f3f4e8); }.today-trip__tag { display: block; font-size: 20rpx; color: #7d8c67; font-weight: 800; }.today-trip__car { display: block; width: 350rpx; height: 200rpx; margin: 6rpx auto 0; }.today-trip__title { display: block; text-align: center; font-size: 33rpx; font-weight: 900; line-height: 1.5; color: #304b40; }.today-trip__note { display: block; text-align: center; font-size: 23rpx; color: #849078; margin-top: 10rpx; line-height: 1.6; }.home-primary { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 94rpx; margin: 24rpx 0; border-radius: 25rpx; background: #2e5147; color: #fffdf7; font-size: 29rpx; font-weight: 900; }
.daily-steps { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8rpx; }.daily-steps button { display: flex; flex-direction: column; align-items: center; padding: 12rpx 3rpx; min-height: 138rpx; border-radius: 18rpx; background: #ffffff88; }.daily-steps button > view { display: flex; justify-content: center; align-items: center; width: 44rpx; height: 44rpx; border-radius: 50%; background: #e0e7d6; font-size: 23rpx; font-weight: 800; color: #879579; }.daily-steps button > .daily-steps__done { background: #7fa186; color: white; }.daily-steps text { font-size: 21rpx; font-weight: 800; color: #63745c; margin-top: 10rpx; }.daily-steps text + text { font-size: 19rpx; font-weight: 400; color: #9a9e89; margin-top: 5rpx; }
.continue-card,.review-card { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; width: 100%; padding: 24rpx; margin-top: 20rpx; border-radius: 26rpx; text-align: left; }.continue-card { background: #e8eff3; }.review-card { background: #fff0d7; }.continue-card > view,.review-card > view { flex: 1; min-width: 0; }.small-tag { display: block; color: #9a876c; font-size: 18rpx; margin-bottom: 8rpx; }.card-title { display: block; font-size: 27rpx; font-weight: 900; line-height: 1.5; }.card-note { display: block; margin-top: 8rpx; color: #9a8c78; font-size: 21rpx; line-height: 1.5; }.card-arrow { flex: none; color: #9b835c; font-size: 23rpx; font-weight: 800; }
.section-head { margin: 32rpx 0 18rpx; }.play-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16rpx; }.play-card { padding: 26rpx 20rpx; border-radius: 28rpx; text-align: left; }.play-card--learn { background: #eee9f5; }.play-card--town { background: #f7e8db; }.play-card__icon { display: flex; align-items: center; justify-content: center; width: 80rpx; height: 70rpx; background: #fffdf688; border-radius: 20rpx; margin-bottom: 16rpx; font-size: 29rpx; font-weight: 900; color: #a593af; }.play-card--town .play-card__icon { color: #b99877; }.play-card__link { display: block; margin-top: 24rpx; font-size: 20rpx; color: #94836d; font-weight: 800; }
.explore-section { margin-top: 24rpx; padding: 24rpx; border: 1rpx solid #e9e1d4; border-radius: 26rpx; background: #fffdf8; }.explore-toggle { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; width: 100%; text-align: left; }.explore-toggle > text { flex: none; color: #a4947e; font-size: 21rpx; }.explore-links { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12rpx; margin-top: 20rpx; }.explore-links button { min-height: 88rpx; padding: 18rpx 8rpx; border-radius: 18rpx; font-size: 24rpx; color: #887b68; background: #f4f0e6; }
.parent-summary { display: flex; align-items: center; justify-content: space-between; gap: 10rpx; width: 100%; text-align: left; padding: 26rpx 8rpx; margin-top: 8rpx; }.parent-summary > text { flex: none; font-size: 21rpx; color: #9a8c78; }.parent-summary .card-title { font-size: 24rpx; }.parent-summary .card-note { font-size: 20rpx; }.home-footnote { display: block; text-align: center; color: #afa28d; font-size: 19rpx; line-height: 1.5; padding-bottom: 12rpx; }
</style>
