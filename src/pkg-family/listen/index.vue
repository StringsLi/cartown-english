<template>
  <view class="page family-page" :class="{ 'family-page--quiet': quiet }">
    <PageTopbar v-if="!quiet" section="把手机放在一旁，听一段小故事" />
    <StorageFeedback />
    <view class="family-heading"><text class="section-kicker">LITTLE LISTENING ROOM</text><text class="page-title">故事陪听室</text><text class="family-subtitle">故事和儿歌排好队，陪你慢慢听。</text></view>
    <view class="listen-player">
      <text class="listen-player__symbol" aria-hidden="true">{{ track?.symbol || '☾' }}</text>
      <text class="listen-player__eyebrow">{{ state.ids.length ? `第 ${state.index + 1} / ${state.ids.length} 段 · ${track?.kind === 'story' ? '小故事' : '儿歌'}` : '还没有加入声音' }}</text>
      <text class="listen-player__title">{{ track?.title || '选几段喜欢的声音吧' }}</text>
      <text class="listen-player__status" role="status" aria-live="polite">{{ state.note }}</text>
      <slider :value="Math.floor(state.position)" :max="Math.max(1, Math.ceil(state.duration))" :disabled="!state.duration" activeColor="#b8cba2" backgroundColor="#ffffff30" block-color="#e5d9b9" :block-size="18" aria-label="播放进度" @change="seek" />
      <view class="listen-player__time"><text>{{ clock(state.position) }}</text><text>{{ state.duration ? clock(state.duration) : '--:--' }}</text></view>
      <view class="play-controls">
        <button role="button" :disabled="!track || (!state.repeat && state.index === 0)" aria-label="上一段" @tap="player.skip(-1)">上一段</button>
        <button role="button" class="play-controls__main" :disabled="!track" @tap="togglePlayback">{{ state.phase === 'loading' ? '取消加载' : state.phase === 'playing' ? 'Ⅱ 暂停' : state.phase === 'error' ? '↻ 重试播放' : '▶ 继续播放' }}</button>
        <button role="button" :disabled="!track || (!state.repeat && state.index >= state.ids.length - 1)" aria-label="下一段" @tap="player.skip(1)">下一段</button>
      </view>
      <text v-if="state.timerMinutes" class="listen-player__countdown">定时剩余 {{ clock(state.remainingMs / 1000) }} · 暂停时不计时</text>
      <text v-else class="listen-player__countdown">{{ state.repeat ? '循环播放，随时可以暂停' : '听完列表后停止' }}</text>
      <button role="button" class="quiet-toggle" @tap="toggleQuiet">{{ quiet ? '☀ 返回完整界面' : '☾ 开启暗色陪听' }}</button>
    </view>
    <text class="listen-boundary">保持此页打开即可连续听；锁屏、切后台或离开页面会暂停，再回来点继续播放。</text>
    <view v-if="!quiet">
      <view class="family-section">
        <text class="family-section__title">听多久，由你决定</text>
        <view class="timer-options"><button v-for="minutes in [0, 5, 10, 15]" :key="minutes" role="button" :aria-pressed="state.timerMinutes === minutes" :class="{ selected: state.timerMinutes === minutes }" @tap="player.setTimer(minutes)">{{ minutes ? minutes + ' 分钟' : '不定时' }}</button></view>
        <button role="button" class="repeat-toggle" :aria-pressed="state.repeat" @tap="player.toggleRepeat()">{{ state.repeat ? '✓' : '○' }} 循环播放列表</button>
      </view>
      <view class="family-section">
        <view class="family-section__head"><text class="family-section__title">我的播放列表</text><text>{{ state.ids.length }} 段</text></view>
        <text v-if="queue.length" class="queue-hint">添加、排序或移除其他声音，都可以边听边选。</text>
        <text v-if="!queue.length" class="family-subtitle">列表是空的，到下面的声音库添加故事或儿歌。</text>
        <view v-for="(item, index) in queue" :key="item.id" class="queue-row" :class="{ 'queue-row--current': index === state.index }">
          <button role="button" class="queue-row__title" :aria-label="'播放' + item.title" @tap="player.choose(index, true)"><text class="queue-row__number">{{ index + 1 }}</text><view><text>{{ item.title }}</text><text class="queue-row__kind">{{ item.kind === 'story' ? '小故事' : '儿歌' }}{{ index === state.index ? ' · 当前选择' : '' }}</text></view></button>
          <button role="button" class="queue-row__action" :disabled="index === 0" :aria-label="'上移' + item.title" @tap="player.move(index, -1)">↑</button>
          <button role="button" class="queue-row__action" :aria-label="'移除' + item.title" @tap="player.toggle(item.id)">×</button>
        </view>
      </view>
      <view class="family-section">
        <text class="family-section__title">声音小书架</text>
        <view class="library-tabs"><button v-for="tab in libraryTabs" :key="tab.id" role="button" :aria-pressed="filter === tab.id" :class="{ selected: filter === tab.id }" @tap="filter = tab.id">{{ tab.label }}</button></view>
        <view v-for="item in library" :key="item.id" class="library-row"><view><text class="library-row__title">{{ item.symbol }} {{ item.title }}</text><text class="family-subtitle">{{ item.kind === 'story' ? '双语主题小故事' : '原创节奏儿歌' }}</text></view><button role="button" :aria-label="(state.ids.includes(item.id) ? '移除' : '加入') + item.title" :aria-pressed="state.ids.includes(item.id)" @tap="player.toggle(item.id)">{{ state.ids.includes(item.id) ? '✓ 已加入' : '＋ 加入' }}</button></view>
      </view>
      <view v-if="track" class="family-section transcript"><text class="family-section__title">这一段在说什么</text><text class="transcript__english">{{ track.english }}</text><text class="family-subtitle">{{ track.translation }}</text></view>
      <text class="family-footnote">列表和续听位置保存在本机。陪听不计为独立找对，也不会额外获得星星。</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { onHide, onShow, onUnload } from "@dcloudio/uni-app";
import PageTopbar from "@/components/PageTopbar.vue";
import StorageFeedback from "@/components/StorageFeedback.vue";
import { usePageShare } from "@/composables/usePageShare";
import { listeningTracks } from "../catalog";
import { createListeningPlayer } from "../services/listeningService";
usePageShare({ title: "故事陪听室，把手机放在一旁一起听" });
const player = createListeningPlayer(), state = player.state;
const quiet = ref(false), filter = ref("all");
const libraryTabs = [{ id: "all", label: "全部声音" }, { id: "story", label: "小故事" }, { id: "chant", label: "儿歌" }];
const track = computed(() => player.current());
const queue = computed(() => state.value.ids.map(id => listeningTracks.find(item => item.id === id)!));
const library = computed(() => listeningTracks.filter(item => filter.value === "all" || item.kind === filter.value));
function clock(seconds: number) { const whole = Math.max(0, Math.floor(seconds)); return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`; }
function togglePlayback() { if (["playing", "loading"].includes(state.value.phase)) player.pause(); else void player.play(); }
function seek(event: { detail: { value: number } }) { player.seek(event.detail.value); }
function updateNavigation() {
  uni.setNavigationBarColor?.({ frontColor: quiet.value ? '#ffffff' : '#000000', backgroundColor: quiet.value ? '#203431' : '#FBF7EF', fail() {} });
}
function toggleQuiet() {
  quiet.value = !quiet.value; updateNavigation();
  void nextTick(() => uni.pageScrollTo({ scrollTop: 0, duration: 0 }));
}
function keepScreen(on: boolean) { uni.setKeepScreenOn?.({ keepScreenOn: on, fail() {} }); }
watch(() => state.value.phase, phase => keepScreen(phase === 'playing'));
onShow(() => { player.restore(); updateNavigation(); });
onHide(() => { player.pause("已暂停并记住位置，回来后点继续播放。"); keepScreen(false); });
onUnload(() => { player.dispose(); keepScreen(false); });
</script>
<style scoped lang="scss">
@use "../family.scss";
.family-page button { margin:0; line-height:1.5; }.family-page button::after { border:0; }
.play-controls button,.quiet-toggle,.queue-row__title,.queue-row__action,.repeat-toggle { background:transparent; }
.listen-player { padding:32rpx 26rpx; margin-top:26rpx; border-radius:34rpx; background:#293e3c; color:#f7f0db; text-align:center; }
.listen-player__symbol { display:block; font-family:Georgia,serif; font-size:92rpx; line-height:1.3; color:#e8c992; }
.listen-player__eyebrow { display:block; font-size:21rpx; margin-top:16rpx; color:#bbcabc; }.listen-player__title { display:block; font-size:36rpx; font-weight:800; line-height:1.5; margin-top:10rpx; }
.listen-player__status { display:block; min-height:3.2em; margin:12rpx 0 4rpx; font-size:22rpx; line-height:1.6; color:#d1dccb; }
.listen-player__time { display:flex; justify-content:space-between; font-size:21rpx; padding:0 12rpx; color:#b6c5b6; }
.play-controls { display:flex; gap:10rpx; margin-top:22rpx; align-items:center; }.play-controls button { min-height:48px; padding:12rpx 10rpx; font-size:22rpx; border-radius:20rpx; color:#e3e9d8; flex:1; }.play-controls .play-controls__main { flex:2; font-weight:800; background:#e8d8b5; color:#324d43; font-size:25rpx; }.play-controls button[disabled] { opacity:.35; }
.listen-player__countdown { display:block; font-size:21rpx; line-height:1.7; margin-top:22rpx; color:#d3d8c5; }.quiet-toggle { min-height:44px; color:#d3d8c5; font-size:23rpx; margin-top:8rpx; padding:12rpx; }
.listen-boundary { display:block; margin:22rpx 8rpx; font-size:22rpx; line-height:1.8; color:#778171; }
.timer-options { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8rpx; margin-top:20rpx; }.timer-options button,.library-tabs button { min-height:44px; padding:8rpx; border-radius:15rpx; background:#eeede3; color:#727765; font-size:22rpx; }.timer-options .selected,.library-tabs .selected { background:#365c4c; color:#fff9e9; }.repeat-toggle { min-height:44px; padding:14rpx 0; margin-top:8rpx; text-align:left; color:#667a60; font-size:24rpx; }
.queue-row { display:flex; align-items:center; gap:4rpx; border-bottom:1rpx solid #eeeade; padding:8rpx 0; }.queue-row--current { background:#edf1e6; border-radius:16rpx; }.queue-row__title { display:flex; flex:1; min-width:0; align-items:center; gap:14rpx; padding:14rpx 8rpx; min-height:44px; color:#435b4b; font-size:24rpx; text-align:left; }.queue-row__title view { flex:1; min-width:0; }.queue-row__title text { display:block; line-height:1.6; }.queue-row__number { flex:none; min-width:25rpx; font-size:21rpx; color:#8c9b80; }.queue-row__kind { font-size:19rpx; color:#7d8775; }.queue-row__action { flex:none; width:44px; min-height:44px; padding:0; color:#7a886c; font-size:32rpx; }.queue-row__action[disabled] { opacity:.25; }
.queue-hint { display:block; margin:12rpx 0 8rpx; color:#7b8370; font-size:21rpx; line-height:1.7; }
.library-tabs { display:flex; gap:10rpx; margin:20rpx 0; }.library-tabs button { flex:1; }.library-row { display:flex; align-items:center; gap:16rpx; padding:20rpx 0; border-bottom:1rpx solid #eeeade; }.library-row > view { flex:1; min-width:0; }.library-row__title { display:block; font-size:25rpx; font-weight:700; line-height:1.6; color:#455c4c; }.library-row button { min-height:44px; flex:none; font-size:22rpx; padding:10rpx 15rpx; color:#597652; background:#e9efe1; border-radius:16rpx; }.library-row .family-subtitle { font-size:20rpx; margin-top:6rpx; }
.transcript__english { display:block; white-space:pre-line; font-size:27rpx; line-height:1.8; color:#4d6858; margin-top:18rpx; }
.family-page--quiet { background:#203431; min-height:100vh; color:#e8dfc5; }.family-page--quiet .page-title { color:#e8dfc5; }.family-page--quiet .family-subtitle,.family-page--quiet .listen-boundary { color:#c0cbb9; }.family-page--quiet .listen-player { margin-top:40rpx; }
</style>
