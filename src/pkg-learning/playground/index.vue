<template>
  <view class="page playground-page screen-with-nav">
    <view class="welcome-row">
      <view><text class="section-kicker">HELLO, LITTLE EXPLORER</text><text class="page-title">小小英语乐园</text></view>
      <view class="star-pocket"><text>★</text><text>{{ stars }}</text></view>
    </view>
    <text class="welcome-subtitle">把英语，藏进每天的小冒险里。</text>

    <view class="content-tabs" role="tablist">
      <button v-for="tab in tabs" :key="tab.id" class="content-tabs__tab" :class="{ 'content-tabs__tab--active': activeTab === tab.id }" role="tab" :aria-selected="activeTab === tab.id" :aria-controls="tab.id + '-panel'" @tap="switchTab(tab.id)">{{ tab.label }}</button>
    </view>
    <AudioFeedback />
    <view v-if="activeTab === 'topics'" id="topics-panel" role="tabpanel">

      <view class="daily-card" :style="{ backgroundColor: suggestedTopic.tint }">
        <view class="daily-card__copy">
          <text class="daily-card__tag">今日小冒险 · 约 5–10 分钟</text>
          <text class="daily-card__title">{{ suggestedTopic.title }}</text>
          <text class="daily-card__subtitle">{{ suggestedTopic.description }}</text>
          <button role="button" class="daily-card__button" @tap="openTopic(suggestedTopic.id)">一起出发 <text>↗</text></button>
        </view>
        <image class="daily-card__art" :src="sceneArt(suggestedTopic.id)" mode="aspectFit" />
        <text class="daily-card__spark">✦</text>
      </view>

      <button role="button" v-if="reviewTopic" class="review-entry" @tap="openReview"><view><text>老朋友，再见面</text><text>{{ reviewTopic.title }} · 今天先复习 {{ reviewCount }} 个词</text></view><text>去听听 ›</text></button>
      <view class="progress-card">
        <view class="progress-card__head"><text>我们的探索地图</text><text class="progress-card__count">{{ completedCount }} / {{ playgroundTopics.length }} 个主题</text></view>
        <view class="progress-track"><view class="progress-track__fill" :style="{ width: `${completedCount / playgroundTopics.length * 100}%` }" /></view>
        <text class="progress-card__note">已点读 {{ heardCount }} / {{ playgroundWordCount }} 个词 · 完成找图，收集一枚印章</text>
      </view>

      <button role="button" class="town-entry" @tap="openAdventure"><view><text>去车车小镇冒险</text><text>开车送水果，和家长演一出小故事</text></view><text>↗</text></button>

      <button role="button" class="space-entry" @tap="openSpace"><view><text>✦ 新主题 · 太阳系小旅行</text><text>太阳、八大行星与月球 · 点读和找图</text></view><text>出发 ↗</text></button>
      <view class="section-head"><text class="section-title">今天想去哪里？</text><text class="section-caption">8 站，慢慢探索</text></view>
      <view class="topic-grid">
        <button role="button" v-for="topic in playgroundTopics" :key="topic.id" class="topic-card" :style="{ backgroundColor: topic.tint }" :aria-label="`开始${topic.title}英语游戏`" @tap="openTopic(topic.id)">
          <text class="topic-card__stamp" :class="{ 'topic-card__stamp--done': completedIds.includes(topic.id) }">{{ completedIds.includes(topic.id) ? '✓ 已探索' : `${topic.items.length} 个小伙伴` }}</text>
          <image class="topic-card__art" :src="sceneArt(topic.id)" mode="aspectFit" />
          <view class="topic-card__head"><text class="topic-card__title">{{ topic.title }}</text><text class="topic-card__arrow" :style="{ color: topic.accent }">↗</text></view>
          <text class="topic-card__english" :style="{ color: topic.accent }">{{ topic.english }}</text>
          <text class="topic-card__description">{{ topic.description }}</text>
        </button>
      </view>
      <view class="section-head"><text class="section-title">我的探险印章</text><text class="section-caption">每站一枚 ★</text></view>
      <view class="stamp-grid">
        <view v-for="topic in playgroundTopics" :key="`stamp-${topic.id}`" class="stamp" :class="{ 'stamp--done': completedIds.includes(topic.id) }">
          <image class="stamp__art" :src="topic.items[0].art" mode="aspectFit" /><text>{{ topic.title.slice(0, 2) }}</text><text class="stamp__status">{{ completedIds.includes(topic.id) ? '★' : '·' }}</text>
        </view>
      </view>
    </view>

    <view v-else-if="activeTab === 'chants'" id="chants-panel" role="tabpanel">
      <view class="section-head"><text class="section-title">小小儿歌电台</text><text class="section-caption">{{ playgroundTopics.length }} 首原创跟读儿歌</text></view>
      <text class="section-intro">听着轻柔的旋律，和孩子一起念、一起动。</text>
      <view v-for="topic in playgroundTopics" :key="`chant-${topic.id}`" class="chant-card" :style="{ backgroundColor: topic.tint }">
        <view class="chant-card__heading"><image class="chant-card__art" :src="topic.items[0].art" mode="aspectFit" /><view><text class="chant-card__title">{{ topic.chantTitle }}</text><text class="chant-card__tag">{{ topic.english }} · 节奏跟读</text></view><button role="button" class="round-play" :aria-label="`播放${topic.chantTitle}`" @tap="playChant(topic.chantAudio, topic.chantTitle)">▶</button></view>
        <text v-for="line in topic.chantLyrics" :key="line" class="chant-card__lyric">{{ line }}</text>
        <button role="button" class="chant-card__link" @tap="openTopic(topic.id)">去认识这首歌的小伙伴 ›</button>
      </view>
      <button role="button" class="stop-button" @tap="stopAudio">■ 停止播放</button>
    </view>

    <view v-else id="parent-panel" role="tabpanel">
      <view class="section-head"><text class="section-title">英语，玩进生活里</text></view>
      <view class="routine-card"><text class="routine-card__title">今天的陪玩小配方</text><view class="routine-steps"><view><text class="routine-steps__number">01</text><text>点图听词</text></view><text class="routine-steps__arrow">›</text><view><text class="routine-steps__number">02</text><text>听音找图</text></view><text class="routine-steps__arrow">›</text><view><text class="routine-steps__number">03</text><text>离屏玩一玩</text></view></view><text class="section-intro">孩子指出来、做出动作就很好。跟着兴趣走，想停就停。</text></view>
      <view v-for="topic in playgroundTopics" :key="`parent-${topic.id}`" class="parent-topic">
        <view class="parent-topic__head"><image :src="topic.items[0].art" mode="aspectFit" /><text>{{ topic.title }}</text><text class="parent-topic__tag">生活小任务</text></view>
        <text class="parent-topic__phrase">“{{ topic.parentPhrase }}”</text><text class="parent-topic__tip">{{ topic.parentTip }}</text><view class="parent-topic__task"><text>一起试试</text><text>{{ topic.offlineTask }}</text></view>
      </view>
    </view>
    <view class="gentle-note"><text>♡</text><text>每天一点点，开心比答对更重要。</text></view>
    <text class="privacy-note">音频随小程序离线提供；探索进度保存在当前设备。</text>
    <BottomNav active="learn" />
  </view>
</template>

<script setup lang="ts">
import { navigate } from "@/services/navigationService";
import { computed, ref } from "vue";
import AudioFeedback from "@/components/AudioFeedback.vue";
import { getReviewTopic, getReviewItems } from "@/services/playgroundLearningService";
import { onLoad, onHide, onShow, onUnload } from "@dcloudio/uni-app";
import BottomNav from "@/components/BottomNav.vue";
import { playgroundTopics, playgroundWordCount, getSuggestedPlaygroundTopic, type PlaygroundTopicId } from "@/mock/playground";
import { getCartownProgress } from "@/services/cartownProgressService";
import { usePageShare } from "@/composables/usePageShare";
import { playAudio, stopAudio } from "@/services/audioService";

usePageShare();
type TabId = "topics" | "chants" | "parent";
const tabs: Array<{ id: TabId; label: string }> = [{ id: "topics", label: "主题小世界" }, { id: "chants", label: "儿歌电台" }, { id: "parent", label: "亲子任务" }];
const activeTab = ref<TabId>("topics");
onLoad(options => {
  const requested = options?.tab;
  activeTab.value = typeof requested === "string" && tabs.some(tab => tab.id === requested) ? requested as TabId : "topics";
});
const reviewTopic = ref(getReviewTopic());
const reviewCount = ref(reviewTopic.value ? getReviewItems(reviewTopic.value.id).length : 0);
const completedIds = ref<string[]>([]);
const heardIds = ref<string[]>([]);
const stars = ref(0);
const completedCount = computed(() => playgroundTopics.filter(topic => completedIds.value.includes(topic.id)).length);
const heardCount = computed(() => playgroundTopics.reduce((count, topic) => count + topic.items.filter(item => heardIds.value.includes(`${topic.id}:${item.id}`)).length, 0));
const suggestedTopic = computed(() => getSuggestedPlaygroundTopic(completedIds.value));
const sceneArt = (id: string) => `/pkg-learning/static/playground/art/${id === "colors" ? "blue-suv" : `scene-${id}`}.png`;
onShow(() => {
  reviewTopic.value = getReviewTopic();
  reviewCount.value = reviewTopic.value ? getReviewItems(reviewTopic.value.id).length : 0;
  const progress = getCartownProgress();
  completedIds.value = [...progress.playgroundCompletedTopicIds];
  heardIds.value = [...progress.playgroundHeardWordIds];
  stars.value = progress.stars;
});
onHide(stopAudio);
onUnload(stopAudio);
function openSpace() { navigate({ url: "/pkg-space/index/index" }); }
function openReview() { if (reviewTopic.value) navigate({ url: `/pkg-learning/playground-game/index?topic=${reviewTopic.value.id}&mode=quiz&review=1` }); }
function openTopic(topicId: PlaygroundTopicId) { stopAudio(); navigate({ url: `/pkg-learning/playground-game/index?topic=${topicId}` }); }
function switchTab(id: TabId) { stopAudio(); activeTab.value = id; }
function playChant(audio: string, title: string) { playAudio(audio, title); }
function openAdventure() { stopAudio(); navigate({ url: "/pkg-adventure/index/index" }); }
</script>

<style scoped lang="scss">
.playground-page { padding-top: 36rpx; }
.town-entry { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; width: 100%; padding: 22rpx 26rpx; margin-top: 22rpx; border: 1rpx dashed #d2b989; border-radius: 24rpx; background: #f9efd9; text-align: left; }.town-entry view text { display: block; font-size: 25rpx; font-weight: 800; }.town-entry view text + text { margin-top: 8rpx; font-size: 20rpx; font-weight: 400; color: #a08965; line-height: 1.5; }.town-entry > text { font-size: 32rpx; color: #b49966; }
.welcome-row { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.welcome-row .section-kicker { font-size: 18rpx; letter-spacing: 2rpx; margin-bottom: 12rpx; }
.welcome-row .page-title { font-size: 42rpx; }
.review-entry { display: flex; align-items: center; justify-content: space-between; gap: 14rpx; width: 100%; padding: 24rpx; margin-top: 22rpx; border-radius: 24rpx; text-align: left; background: #fff0d7; }.review-entry view text { display: block; font-size: 27rpx; font-weight: 800; }.review-entry view text + text { font-size: 21rpx; margin-top: 8rpx; font-weight: 400; color: #9c896c; }.review-entry > text { flex: none; color: #a08554; font-size: 22rpx; }
.welcome-subtitle { display: block; margin-top: 14rpx; font-size: 24rpx; color: $color-muted; }
.star-pocket { display: flex; align-items: center; gap: 10rpx; padding: 16rpx 20rpx; border-radius: 24rpx; background: #f5e9cc; font-size: 25rpx; font-weight: 800; color: #967332; }
.star-pocket text:first-child { color: #bf8e3a; }
.daily-card { position: relative; display: flex; align-items: center; min-height: 300rpx; margin-top: 30rpx; padding: 28rpx; border-radius: 32rpx; overflow: hidden; }
.daily-card__copy { position: relative; z-index: 1; width: 57%; }
.daily-card__tag,.daily-card__title,.daily-card__subtitle { display: block; }
.daily-card__tag { font-size: 18rpx; font-weight: 700; color: #787162; }
.daily-card__title { margin-top: 16rpx; font-size: 37rpx; font-weight: 900; color: $color-primary-dark; }
.daily-card__subtitle { margin-top: 10rpx; font-size: 21rpx; color: #797369; line-height: 1.5; }
.daily-card__button { display: flex; align-items: center; justify-content: space-between; gap: 28rpx; width: 226rpx; min-height: 44px; margin-top: 24rpx; padding: 0 24rpx; border-radius: 24rpx; background: $color-primary-dark; color: white; font-size: 23rpx; font-weight: 800; box-shadow: 0 8rpx 14rpx #263d5914; }
.daily-card__art { position: absolute; right: -12rpx; bottom: 24rpx; width: 325rpx; height: 236rpx; }
.daily-card__spark { position: absolute; top: 26rpx; right: 40rpx; color: #e3b771; font-size: 36rpx; }
.progress-card { margin-top: 20rpx; padding: 24rpx; background: #fffdf9; border: 1rpx solid #eee7dd; border-radius: 26rpx; }
.progress-card__head { display: flex; justify-content: space-between; gap: 10rpx; font-size: 23rpx; font-weight: 800; }
.progress-card__count { font-size: 20rpx; color: #8f7860; }
.progress-track { height: 10rpx; margin: 18rpx 0 14rpx; background: #f0ebe2; border-radius: 10rpx; overflow: hidden; }
.progress-track__fill { height: 100%; border-radius: 10rpx; background: #9ab483; transition: width .25s; }
.progress-card__note { display: block; font-size: 18rpx; color: $color-muted; line-height: 1.5; }
.content-tabs { position: sticky; top: 0; z-index: 10; display: flex; gap: 6rpx; padding: 8rpx; margin-top: 28rpx; background: #eee9e0; border-radius: 24rpx; }
.content-tabs__tab { display: flex; align-items: center; justify-content: center; flex: 1; min-height: 44px; border-radius: 18rpx; font-size: 23rpx; font-weight: 800; color: #8a8379; }
.content-tabs__tab--active { color: $color-primary-dark; background: #fffdf9; box-shadow: 0 4rpx 10rpx #63513b0a; }
.section-caption { font-size: 19rpx; color: #948779; }
.section-intro { display: block; margin: 10rpx 0 20rpx; font-size: 22rpx; color: $color-muted; line-height: 1.6; }
.topic-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18rpx; }
.topic-card { position: relative; display: flex; flex-direction: column; align-items: flex-start; padding: 20rpx 22rpx 24rpx; text-align: left; border-radius: 28rpx; border: 1rpx solid #ffffff80; }
.topic-card__stamp { padding: 7rpx 12rpx; border-radius: 12rpx; font-size: 16rpx; color: #8a8075; background: #ffffffa6; }
.topic-card__stamp--done { color: #5c835b; }
.topic-card__art { display: block; width: 100%; height: 166rpx; margin: 6rpx 0 10rpx; }
.topic-card__head { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.topic-card__title { font-size: 28rpx; font-weight: 900; color: $color-primary-dark; }
.topic-card__arrow { font-size: 28rpx; }
.topic-card__english { display: block; margin-top: 9rpx; font-size: 21rpx; font-weight: 700; }
.topic-card__description { display: block; margin-top: 9rpx; font-size: 18rpx; color: #897e71; line-height: 1.5; }
.stamp-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14rpx; padding: 22rpx; border: 1rpx solid #eee7dd; border-radius: 28rpx; background: #fffdf9; }
.stamp { position: relative; display: flex; align-items: center; flex-direction: column; color: #a29a90; font-size: 19rpx; }
.stamp__art { width: 110rpx; height: 90rpx; opacity: .28; filter: grayscale(1); }
.stamp--done .stamp__art { opacity: 1; filter: none; }
.stamp--done { color: #887153; }
.stamp__status { position: absolute; right: 10rpx; top: 0; color: #c5a252; font-size: 22rpx; }
.chant-card { padding: 24rpx; border-radius: 28rpx; margin-bottom: 18rpx; }
.chant-card__heading { display: grid; grid-template-columns: 94rpx minmax(0,1fr) 44px; align-items: center; gap: 12rpx; margin-bottom: 16rpx; }
.chant-card__art { width: 94rpx; height: 80rpx; }
.chant-card__title,.chant-card__tag,.chant-card__lyric { display: block; }
.chant-card__title { font-size: 27rpx; font-weight: 800; }
.chant-card__tag { font-size: 18rpx; color: $color-muted; margin-top: 9rpx; }
.round-play { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #fffdf9; color: $color-primary; font-size: 24rpx; }
.chant-card__lyric { font-size: 23rpx; line-height: 1.7; color: #615d56; }
.chant-card__link { display: flex; align-items: center; width: 100%; min-height: 44px; margin-top: 10rpx; font-size: 20rpx; color: #877561; text-align: left; }
.stop-button { min-height: 44px; padding: 22rpx; width: 100%; border-radius: 22rpx; background: #eee8de; font-size: 23rpx; color: #7d756a; }
.routine-card { padding: 26rpx; border-radius: 28rpx; background: #eaf0e4; }
.routine-card__title { font-size: 27rpx; font-weight: 800; }
.routine-steps { display: flex; align-items: center; justify-content: space-between; margin: 24rpx 0; }
.routine-steps view { display: flex; flex-direction: column; align-items: center; gap: 14rpx; font-size: 21rpx; }
.routine-steps__number { width: 58rpx; height: 58rpx; line-height: 58rpx; text-align: center; border-radius: 20rpx; color: #66825a; background: #fffdf9; font-size: 22rpx; font-weight: 800; }
.routine-steps__arrow { color: #8ca17f; }
.parent-topic { margin-top: 18rpx; padding: 24rpx; border: 1rpx solid #eee7dd; border-radius: 28rpx; background: #fffdf9; }
.parent-topic__head { display: flex; align-items: center; gap: 8rpx; font-size: 26rpx; font-weight: 800; }
.parent-topic__head image { width: 78rpx; height: 64rpx; }
.parent-topic__tag { margin-left: auto; font-size: 17rpx; font-weight: 400; color: #999086; }
.parent-topic__phrase { display: block; margin: 14rpx 0; font-size: 28rpx; font-weight: 800; color: $color-primary; }
.parent-topic__tip { display: block; font-size: 22rpx; color: $color-muted; line-height: 1.7; }
.parent-topic__task { display: flex; flex-direction: column; gap: 9rpx; margin-top: 18rpx; padding: 18rpx; border-radius: 20rpx; background: #f5f0e6; font-size: 22rpx; line-height: 1.6; }
.parent-topic__task text:first-child { color: #948069; font-size: 18rpx; font-weight: 800; }
.gentle-note { display: flex; align-items: center; justify-content: center; gap: 12rpx; margin: 34rpx 0 14rpx; font-size: 21rpx; color: #97836e; }
.gentle-note text:first-child { font-size: 30rpx; }
.privacy-note { display: block; text-align: center; font-size: 17rpx; color: #a09a91; line-height: 1.6; }
</style>

<style scoped>.space-entry { display:flex; justify-content:space-between; align-items:center; width:100%; min-height:120rpx; margin:24rpx 0; padding:24rpx; border-radius:26rpx; background:#16253d; color:#f1e4c9; text-align:left; box-sizing:border-box; }.space-entry text { display:block; font-size:25rpx; line-height:1.6; }.space-entry view text + text { font-size:21rpx; color:#b5c4db; }</style>
