<template>
  <view class="page wordbook-page">
    <PageTopbar section="听过的词，慢慢变熟悉" fallback="/pkg-user/parent/index" />
    <view class="pocket-hero">
      <view class="pocket-hero__copy"><text class="section-kicker">MY WORD POCKET</text><text class="page-title">我的单词本</text><text class="pocket-hero__note">把喜欢的词装进口袋，想听就再听一次。</text></view>
      <view class="pocket-symbol" aria-hidden="true">Aa<text class="pocket-symbol__star">✦</text></view>
    </view>
    <view class="pocket-summary"><text>听过 {{ counts.heard }} / {{ entries.length }} 个词</text><text>独立找对 {{ independentCount }} 个</text></view>
    <AudioFeedback />
    <view class="word-search"><input v-model="query" :maxlength="40" placeholder="搜索英文或中文，例如 red / 红色" aria-label="搜索单词" confirm-type="search" @input="cancelPlayback" /><button v-if="query" role="button" aria-label="清空搜索" @tap="clearSearch">清空</button></view>
    <view class="pocket-filters"><button v-for="tab in tabs" :key="tab.id" role="button" :class="{ 'pocket-filter--active': status === tab.id }" :aria-pressed="status === tab.id" @tap="selectStatus(tab.id)"><text>{{ tab.title }}</text><text class="pocket-filter__count">{{ counts[tab.id] }}</text></button></view>
    <view class="theme-filters"><button role="button" :class="{ 'theme-filter--active': topicId === 'all' }" :aria-pressed="topicId === 'all'" @tap="selectTopic('all')">全部主题</button><button v-for="topic in playgroundTopics" :key="topic.id" role="button" :class="{ 'theme-filter--active': topicId === topic.id }" :aria-pressed="topicId === topic.id" @tap="selectTopic(topic.id)">{{ topic.title }}</button></view>
    <view class="pocket-results" role="status" aria-live="polite"><text>找到 {{ filteredEntries.length }} 个小伙伴</text><button v-if="hasFilters" role="button" @tap="resetFilters">重置筛选 ↻</button></view>
    <view v-if="filteredEntries.length" class="pocket-grid">
      <view v-for="item in filteredEntries" :key="item.key" class="word-card">
        <view class="word-card__art" :style="{ backgroundColor: item.tint }"><CachedImage :src="item.art" :alt="item.label" mode="aspectFit" /></view>
        <button role="button" class="word-card__favorite" :class="{ 'word-card__favorite--active': item.favorite }" :aria-label="(item.favorite ? '取消收藏 ' : '收藏 ') + item.word" :aria-pressed="item.favorite" @tap="favorite(item.key)">{{ item.favorite ? '★' : '☆' }}</button>
        <view class="word-card__copy"><text class="word-card__english">{{ item.word }}</text><text class="word-card__translation">{{ item.label }} · {{ item.topicTitle }}</text><text class="word-card__state" :class="{ 'word-card__state--review': item.review }">{{ item.review ? '该复习啦' : item.independent ? '独立找对过' : item.heard ? '已经听过' : '还没点读' }}</text></view>
        <button role="button" class="word-card__listen" :aria-label="'听 ' + item.word" @tap="listen(item.key)">▶ 听一听</button>
        <button role="button" class="word-card__practice" :aria-label="'去练习' + item.topicTitle" @tap="practice(item.key)">{{ item.review ? '复习这个主题 ›' : '去主题找图 ›' }}</button>
      </view>
    </view>
    <view v-else class="pocket-empty" role="status"><text class="pocket-empty__symbol">✦</text><text class="pocket-empty__title">{{ emptyTitle }}</text><text class="pocket-empty__note">{{ emptyNote }}</text><button v-if="hasFilters" role="button" @tap="resetFilters">看看全部单词 ›</button></view>
    <text class="pocket-footnote">点读记录会同步今天的听词活动。收藏不代表学会，想听几遍都可以。</text>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow, onHide, onUnload } from "@dcloudio/uni-app";
import PageTopbar from "@/components/PageTopbar.vue";
import AudioFeedback from "@/components/AudioFeedback.vue";
import CachedImage from "@/components/CachedImage.vue";
import { usePageShare } from "@/composables/usePageShare";
import { playgroundTopics } from "@/mock/playground";
import { playAudio, stopAudio, getAudioVolume } from "@/services/audioService";
import { navigate } from "@/services/navigationService";
import { getCartownProgress, recordPlaygroundWord, flushCartownProgress } from "@/services/cartownProgressService";
import { getPlaygroundLearning, getReviewWordIds, flushPlaygroundLearning } from "@/services/playgroundLearningService";
import { getFavoriteWords, getWordbookEntries, toggleFavoriteWord } from "@/pkg-user/services/wordbookService";

usePageShare({ title: "我的单词本，和孩子再听一遍喜欢的英语词" });
type Filter = "all" | "heard" | "review" | "favorite";
const tabs: { id: Filter; title: string }[] = [{ id: "all", title: "全部" }, { id: "heard", title: "听过" }, { id: "review", title: "待复习" }, { id: "favorite", title: "收藏" }];
const status = ref<Filter>("all"), topicId = ref("all"), query = ref("");
const entries = ref(getWordbookEntries([], {}, [], []));
let visible = false, request = 0;
const counts = computed(() => ({ all: entries.value.length, heard: entries.value.filter(item => item.heard).length, review: entries.value.filter(item => item.review).length, favorite: entries.value.filter(item => item.favorite).length }));
const independentCount = computed(() => entries.value.filter(item => item.independent).length);
const filteredEntries = computed(() => {
  const search = query.value.trim().toLowerCase();
  return entries.value.filter(item => (topicId.value === "all" || item.topicId === topicId.value)
    && (status.value === "all" || item[status.value])
    && (!search || `${item.word} ${item.label}`.toLowerCase().includes(search)))
    .sort((a, b) => status.value === "review" ? getReviewWordIds().indexOf(a.key) - getReviewWordIds().indexOf(b.key) : 0);
});
const hasFilters = computed(() => status.value !== "all" || topicId.value !== "all" || !!query.value);
const emptyTitle = computed(() => query.value.trim() || topicId.value !== "all" ? "没有找到这个小伙伴" : status.value === "favorite" ? "口袋里还没有收藏" : status.value === "review" ? "暂时没有待复习的词" : "还没听过这些小伙伴");
const emptyNote = computed(() => query.value.trim() || topicId.value !== "all" ? "试试其他词，或重置筛选看看。" : status.value === "favorite" ? "点单词卡上的星星，下次就能更快找到它。" : status.value === "review" ? "可以重听喜欢的词，也可以去主题里认识新朋友。" : "切到全部，选一张图片，听听它的英语名字。");
function refresh() { entries.value = getWordbookEntries(getCartownProgress().playgroundHeardWordIds, getPlaygroundLearning().words, getFavoriteWords(), getReviewWordIds()); }
function cancelPlayback() { request++; stopAudio(); }
function leave() { visible = false; cancelPlayback(); flushPlaygroundLearning(); flushCartownProgress(); }
onShow(() => { visible = true; refresh(); });
onHide(leave); onUnload(leave);
function selectStatus(value: Filter) { cancelPlayback(); status.value = value; refresh(); }
function selectTopic(value: string) { cancelPlayback(); topicId.value = value; }
function clearSearch() { cancelPlayback(); query.value = ""; }
function resetFilters() { cancelPlayback(); status.value = "all"; topicId.value = "all"; query.value = ""; refresh(); }
function favorite(key: string) { toggleFavoriteWord(key); refresh(); }
function listen(key: string) {
  const item = entries.value.find(entry => entry.key === key);
  if (!item) return;
  cancelPlayback(); const token = request;
  playAudio(item.wordAudio, item.word, () => {
    if (!visible || token !== request) return;
    if (getAudioVolume() === 0) { uni.showToast({ title: "现在是静音，请调大音量后再听", icon: "none" }); return; }
    recordPlaygroundWord(item.topicId, item.id); refresh();
  });
}
function practice(key: string) {
  const item = entries.value.find(entry => entry.key === key);
  if (!item) return;
  navigate({ url: `/pkg-learning/playground-game/index?topic=${item.topicId}&mode=quiz${getReviewWordIds().includes(key) ? "&review=1" : ""}` });
}
</script>

<style scoped lang="scss">
.wordbook-page { background:#faf8f1; }
.pocket-hero { display:flex; align-items:center; gap:24rpx; padding:28rpx 0 18rpx; }
.pocket-hero__copy { flex:1; min-width:0; }.pocket-hero .page-title { font-size:42rpx; color:#314f43; }
.pocket-hero__note { display:block; margin-top:14rpx; color:#768171; font-size:24rpx; line-height:1.7; }
.pocket-symbol { position:relative; display:flex; flex:none; align-items:center; justify-content:center; width:124rpx; height:140rpx; background:#e5ecdf; color:#486d53; border-radius:22rpx 22rpx 46rpx 46rpx; font-family:Georgia,serif; font-size:55rpx; }
.pocket-symbol__star { position:absolute; top:-13rpx; right:-6rpx; color:#be8e3e; font-size:40rpx; }
.pocket-summary { display:flex; flex-wrap:wrap; gap:12rpx 26rpx; padding:18rpx 24rpx; border-radius:18rpx; background:#edf1e6; color:#607458; font-size:23rpx; line-height:1.7; }
.word-search { display:flex; align-items:center; gap:10rpx; margin-top:28rpx; padding:0 20rpx; border:1rpx solid #e2e4d8; border-radius:22rpx; background:#fffdf8; }.word-search input { flex:1; min-width:0; min-height:48px; font-size:24rpx; }.word-search button { min-height:44px; flex:none; padding:0 8rpx; color:#657e64; font-size:23rpx; }
.pocket-filters { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10rpx; margin-top:22rpx; }.pocket-filters button { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:58px; gap:6rpx; padding:10rpx 2rpx; border:1rpx solid #e6e4d8; border-radius:20rpx; background:#fffdf8; color:#78806f; font-size:24rpx; line-height:1.5; }.pocket-filters .pocket-filter--active { background:#385e4e; border-color:#385e4e; color:#fffdf4; }.pocket-filter__count { font-size:29rpx; font-weight:800; }
.theme-filters { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8rpx; margin-top:20rpx; }.theme-filters button { min-height:44px; padding:8rpx 4rpx; border-radius:14rpx; background:#f0eee4; color:#7c7e70; font-size:21rpx; line-height:1.5; }.theme-filters .theme-filter--active { background:#e0e9d9; color:#406442; font-weight:800; }
.pocket-results { display:flex; align-items:center; justify-content:space-between; min-height:44px; margin:16rpx 0; color:#7c806f; font-size:22rpx; }.pocket-results button { min-height:44px; padding:4rpx 0 4rpx 12rpx; color:#657e64; font-size:22rpx; }
.pocket-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18rpx; }.word-card { position:relative; min-width:0; padding:14rpx; border:1rpx solid #e6e4d9; border-radius:26rpx; background:#fffdf8; }.word-card__art { height:180rpx; border-radius:18rpx; overflow:hidden; }.word-card__favorite { position:absolute; top:18rpx; right:18rpx; display:flex; align-items:center; justify-content:center; width:44px; height:44px; padding:0; border-radius:50%; background:#fffdf7ee; color:#8b8e7d; font-size:38rpx; }.word-card__favorite--active { color:#a87b32; background:#fbefd0; }.word-card__copy { padding:16rpx 6rpx 12rpx; }.word-card__english { display:block; overflow-wrap:anywhere; color:#365144; font-size:32rpx; font-weight:900; line-height:1.5; }.word-card__translation { display:block; margin-top:3rpx; color:#7c8273; font-size:20rpx; line-height:1.6; }.word-card__state { display:block; margin-top:10rpx; color:#6c8a68; font-size:21rpx; line-height:1.5; }.word-card__state--review { color:#a17b40; }.word-card__listen,.word-card__practice { display:flex; align-items:center; justify-content:center; width:100%; min-height:44px; padding:8rpx 4rpx; border-radius:16rpx; font-size:23rpx; line-height:1.5; }.word-card__listen { background:#e9efe2; color:#486e4e; font-weight:800; }.word-card__practice { margin-top:4rpx; background:transparent; color:#838876; font-size:21rpx; }
.pocket-empty { padding:35rpx 30rpx; border:1rpx dashed #d7dfcd; border-radius:26rpx; text-align:center; background:#f1f3e9; }.pocket-empty__symbol { display:block; color:#c29d53; font-size:60rpx; }.pocket-empty__title { display:block; margin-top:18rpx; color:#4e6851; font-size:30rpx; font-weight:800; }.pocket-empty__note { display:block; margin-top:14rpx; color:#7c8473; font-size:24rpx; line-height:1.8; }.pocket-empty button { min-height:44px; margin-top:18rpx; padding:10rpx; color:#496b50; font-size:25rpx; }
.pocket-footnote { display:block; padding:30rpx 8rpx; text-align:center; color:#8a8c7d; font-size:21rpx; line-height:1.8; }
</style>
