<template>
  <view class="page speech-page">
    <PageTopbar section="每天一小段，表达自己的想法" />
    <StorageFeedback />
    <view class="speech-heading"><text class="section-kicker">MY LITTLE VOICE · 4–5 岁</text><text class="page-title">小小演说家</text><text class="speech-note">每天选中文或英文一篇。先听，再说给自己听。</text></view>
    <view class="language-tabs"><button role="button" :disabled="busy" :aria-pressed="state.language === 'zh'" :class="{selected:state.language === 'zh'}" @tap="changeLanguage('zh')">中文 · 10 篇</button><button role="button" :disabled="busy" :aria-pressed="state.language === 'en'" :class="{selected:state.language === 'en'}" @tap="changeLanguage('en')">English · 10 篇</button></view>
    <view class="today-card">
      <view class="today-head"><text>{{ lesson.id === today.id ? '今天的一分钟' : '自由选篇 · 可以反复练习' }}</text><button v-if="lesson.id !== today.id" role="button" :disabled="busy" @tap="choose(today.id)">回到今日推荐 ›</button></view>
      <text class="speech-symbol" aria-hidden="true">{{ lesson.symbol }}</text>
      <text class="speech-title">{{ lesson.title }}</text><text v-if="state.language === 'en'" class="speech-note">{{ lesson.subtitle }}</text>
      <text class="speech-meta">第 {{ lesson.day }} / 10 篇 · 示范 {{ sampleSeconds }} 秒 · {{ lesson.skill }}</text>
      <text v-if="voiceProfile" class="voice-profile">{{ voiceProfile }}</text>
      <view class="journey"><text :class="{done:state.ready}">{{ state.ready ? '✓' : '1' }} 听示范</text><text>→</text><text :class="{done:todayRecord}">{{ todayRecord ? '✓' : '2' }} 录下来</text><text>→</text><text>3 回听鼓励</text></view>
      <button role="button" class="primary sample-button" :disabled="busy" @tap="practice.listen">{{ sampleLabel }}</button>
      <view class="sample-progress" role="progressbar" aria-label="示范播放进度" :aria-valuenow="Math.floor(state.position)" :aria-valuemax="sampleSeconds" aria-valuemin="0"><view :style="{width:Math.min(100, state.position / (state.duration || sampleSeconds) * 100) + '%'}" /></view>
      <text class="sample-time">{{ clock(state.position) }} / {{ clock(state.duration || sampleSeconds) }}</text>
      <text class="speech-status" role="status" aria-live="polite">{{ state.note }}</text>
      <button v-if="state.note.includes('音量')" role="button" class="quiet-button" :disabled="busy" @tap="restoreVolume">恢复示范音量并重听</button>
    </view>
    <view class="speech-section">
      <view class="section-head"><text class="section-title">记住三件小事</text><button role="button" :aria-pressed="showText" @tap="showText = !showText">{{ showText ? '收起全文 ↑' : '展开演讲稿 ↓' }}</button></view>
      <view class="cue-cards"><view v-for="(cue,index) in lesson.cues" :key="cue"><text>{{ index + 1 }}</text><text>{{ cue }}</text></view></view>
      <text class="speech-note">可以照着说，也可以换成自己的故事。先说喜欢的几句就很好。</text>
      <view v-if="showText" class="speech-script"><view v-for="(paragraph,index) in lesson.paragraphs" :key="paragraph"><text class="paragraph-number">{{ index + 1 }} / {{ lesson.paragraphs.length }}</text><text class="paragraph-text" :class="{'paragraph-text--english':state.language === 'en'}">{{ paragraph }}</text><text v-if="showMeaning && lesson.meanings[index]" class="speech-note">{{ lesson.meanings[index] }}</text></view></view>
      <button v-if="state.language === 'en' && showText" role="button" class="quiet-button" :aria-pressed="showMeaning" @tap="showMeaning = !showMeaning">{{ showMeaning ? '收起中文提示' : '给家长看中文提示' }}</button>
    </view>
    <view id="speech-record" class="speech-section record-card" :class="{'record-card--active':state.recording === 'recording'}">
      <text class="section-title">轮到我的小声音</text><text class="speech-note">约 1 分钟，说完随时停止；最多 90 秒。示范和录音不会同时播放。</text>
      <text class="record-clock">{{ clock(state.seconds) }} <text>/ 1:30</text></text>
      <!-- #ifdef H5 --><text class="web-note">网页可听示范、看讲稿和回听；录音请打开微信小程序。</text><!-- #endif -->
      <button role="button" class="primary record-button" :disabled="recordDisabled" @tap="practice.record">{{ recordLabel }}</button>
      <text v-if="!state.ready" class="speech-note">在微信小程序内，完整听完本篇示范即可录音。</text>
      <button v-if="state.permissionDenied" role="button" class="quiet-button" @tap="openSettings">麦克风授权设置 ›</button>
      <view v-if="state.unsaved" class="unsaved-card" role="alert"><text>这段声音还没保存好，先保存再换篇。</text><button role="button" :disabled="state.recording !== 'idle'" @tap="practice.retrySave">重新保存录音</button></view>
      <view v-if="state.recordedPath" class="playback-actions"><button role="button" :disabled="busy" @tap="replay">{{ replayActive ? '■ 停止回听' : '▶ 听我的演说' }}</button><button role="button" :disabled="busy" @tap="openRecordings">保存 / 导出 ›</button></view>
      <text v-if="state.recordedPath" class="speech-note" role="status">{{ replayNote }}</text>
    </view>
    <view class="parent-tip"><text class="section-title">给倾听的大人</text><text>{{ lesson.question }}</text><text>等孩子说完，先回应一句具体的鼓励，例如“你把小车的样子说清楚了”。不要求背熟，也不做发音评分。</text></view>
    <view class="speech-section"><view class="section-head"><text class="section-title">{{ state.language === 'zh' ? '中文' : '英文' }}演说小书架</text><text>10 篇原创</text></view><button v-for="item in library" :key="item.id" role="button" class="lesson-row" :class="{'lesson-row--current':lesson.id === item.id}" :disabled="busy" :aria-pressed="lesson.id === item.id" @tap="choose(item.id)"><text class="lesson-day">{{ String(item.day).padStart(2,'0') }}</text><view><text>{{ item.title }}</text><text>{{ item.skill }}{{ dayStatus.recorded.includes(item.id) ? ' · 今天录过' : dayStatus.heard.includes(item.id) ? ' · 今天听过' : '' }}</text></view><text>›</text></button></view>
    <button role="button" class="archive-link" :disabled="busy" @tap="openRecordings">孩子的录音小册 · 回听与备份 ›</button>
    <text class="privacy-note">每天推荐一篇，10 天后可循环巩固。中英文和其他跟读共用最近 30 条本机录音，请及时导出珍藏。录音不会自动上传。</text>
  </view>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app';
import PageTopbar from '@/components/PageTopbar.vue';
import StorageFeedback from '@/components/StorageFeedback.vue';
import { navigate } from '@/services/navigationService';
import { recordPlaybackState, stopRecordPlayback } from '@/services/recordService';
import { setAudioVolume } from '@/services/audioService';
import { usePageShare } from '@/composables/usePageShare';
import { speechLessons, type SpeechLanguage } from '../catalog';
import audioManifest from '../audio-manifest.json';
import { dailySpeech, speechDay } from '../services/speechProgress';
import { createSpeechPractice } from '../services/speechPractice';
const practice = createSpeechPractice(), state = practice.state;
const showText = ref(false), showMeaning = ref(false), dayStatus = ref(speechDay()), dayClock = ref(Date.now());
const lesson = computed(() => practice.current()), busy = computed(() => state.value.recording !== 'idle' || !!state.value.unsaved);
const today = computed(() => { void dayClock.value; return dailySpeech(state.value.language); });
const todayRecord = computed(() => dayStatus.value.recorded.includes(lesson.value.id));
const library = computed(() => speechLessons.filter(item => item.language === state.value.language));
const sampleSeconds = computed(() => Math.round(audioManifest.find(item => item.id === lesson.value.id)?.seconds || 60));
const voiceProfile = computed(() => { const item=audioManifest.find(item => item.id === lesson.value.id); return item && 'profile' in item ? String(item.profile) : ''; });
const sampleLabel = computed(() => ({loading:'取消加载',playing:'Ⅱ 暂停示范',paused:'▶ 继续听示范',ended:'↻ 再听完整示范',error:'↻ 重试示范'}[state.value.sample] || '▶ 先听一分钟示范'));
const recordLabel = computed(() => ({starting:'正在准备麦克风…',recording:'■ 说完了，停止并保存',saving:'正在保存声音…'}[state.value.recording] || (state.value.recordedPath ? '● 再录一次' : '● 开始我的演说')));
const recordDisabled = computed(() => {
  // #ifdef H5
  return true;
  // #endif
  return !state.value.ready || ['starting','saving'].includes(state.value.recording) || !!state.value.unsaved;
});
const replayActive = computed(() => recordPlaybackState.value.path === state.value.recordedPath && ['loading','playing'].includes(recordPlaybackState.value.phase));
const replayNote = computed(() => recordPlaybackState.value.path === state.value.recordedPath ? ({idle:'录音已保存在本机。',loading:'正在准备回听…',playing:'正在回听自己的演说 ♪',ended:'听完啦！找一句你喜欢的表达。',error:'这段录音暂时无法回听，请重试或从备份恢复。'}[recordPlaybackState.value.phase]) : '录音已保存在本机，可以回听或再录一次。');
function clock(value: number) { const seconds=Math.max(0,Math.floor(value)); return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`; }
function choose(id: string) { practice.choose(id); dayStatus.value = speechDay(); }
function changeLanguage(language: SpeechLanguage) { practice.changeLanguage(language); showText.value = false; showMeaning.value = false; dayStatus.value = speechDay(); }
function replay() { if (replayActive.value) stopRecordPlayback(); else practice.replay(); }
function openSettings() { uni.openSetting({}); }
function restoreVolume() { setAudioVolume(1); void practice.listen(); }
function openRecordings() { if (!practice.busy()) { practice.stopSample(); stopRecordPlayback(); navigate({url:'/pkg-reading/recordings/index'}); } }
let refreshTimer: ReturnType<typeof setInterval> | undefined;
onLoad(query => { if (typeof query?.id === 'string') choose(query.id); else if(query?.lang === 'en') changeLanguage('en'); });
watch(() => [state.value.ready, state.value.recordedPath], () => { dayStatus.value=speechDay(); });
onShow(() => { practice.show(); dayStatus.value=speechDay(); clearInterval(refreshTimer); refreshTimer=setInterval(() => { practice.refresh(); dayStatus.value=speechDay(); dayClock.value=Date.now(); },30000); });
function hide() { clearInterval(refreshTimer); refreshTimer=undefined; practice.hide(); }
onHide(hide); onUnload(() => { clearInterval(refreshTimer); practice.dispose(); });
usePageShare({title:'小小演说家 · 每天一分钟，听一听再说一说',path:()=>`/pkg-speech/index/index?id=${lesson.value.id}`});
</script>
<style scoped lang="scss">
.speech-page { background:#faf8f1; padding-bottom:60rpx; color:#3c554a; }.speech-page button { margin:0; min-height:44px; line-height:1.6; font-size:25rpx; }.speech-page button::after { border:0; }.speech-page button[disabled] { opacity:.45; }.speech-heading { padding:14rpx 0 24rpx; }.speech-heading .section-kicker { font-size:19rpx; color:#9a815b; letter-spacing:2rpx; }.speech-heading .page-title { margin-top:12rpx; font-size:43rpx; }.speech-note { display:block; margin-top:14rpx; font-size:24rpx; line-height:1.8; color:#768072; }.language-tabs { display:flex; gap:14rpx; margin:8rpx 0 24rpx; }.language-tabs button { flex:1; border-radius:20rpx; padding:17rpx; background:#ebe9df; color:#6e7869; }.language-tabs button.selected { background:#375e4e; color:#fffdf1; }
.today-card { padding:30rpx; border-radius:32rpx; background:#edf1e3; border:1rpx solid #dce4cf; text-align:center; }.today-head { display:flex; align-items:center; justify-content:space-between; gap:12rpx; font-size:22rpx; color:#778164; text-align:left; }.today-head button { background:transparent; padding:4rpx; font-size:21rpx; color:#5b7754; }.speech-symbol { display:block; font-size:72rpx; margin-top:24rpx; color:#ad8753; }.speech-title { display:block; font-size:38rpx; line-height:1.4; font-weight:800; margin-top:12rpx; }.speech-meta { display:block; font-size:21rpx; line-height:1.8; margin-top:15rpx; color:#7a806d; }.journey { display:flex; justify-content:space-between; align-items:center; gap:5rpx; margin:24rpx 0; color:#909783; font-size:20rpx; }.journey .done { color:#456c45; font-weight:800; }.primary { display:flex; align-items:center; justify-content:center; width:100%; padding:23rpx 12rpx; border-radius:22rpx; background:#3b604d; color:#fffdf1; font-weight:800; }.sample-progress { margin-top:22rpx; height:8rpx; border-radius:8rpx; overflow:hidden; background:#d7dfcb; }.sample-progress > view { height:100%; background:#7d9867; }.sample-time { display:block; font-size:21rpx; color:#79816c; margin-top:10rpx; }.speech-status { display:block; margin-top:18rpx; font-size:24rpx; line-height:1.8; color:#617455; }
.speech-section { margin-top:25rpx; padding:27rpx; border-radius:28rpx; border:1rpx solid #e8e3d6; background:#fffdf8; }.section-head { display:flex; justify-content:space-between; align-items:center; gap:12rpx; margin-bottom:18rpx; }.section-title { display:block; font-size:29rpx; font-weight:800; line-height:1.5; }.section-head button { padding:7rpx 0 7rpx 10rpx; background:transparent; color:#917a56; font-size:22rpx; }.section-head > text + text { font-size:20rpx; color:#8b8c7b; }.cue-cards { display:flex; flex-direction:column; gap:12rpx; }.cue-cards > view { display:flex; align-items:center; gap:18rpx; padding:20rpx; border-radius:18rpx; background:#f5efdf; font-size:25rpx; }.cue-cards text:first-child { font-family:Georgia,serif; font-size:36rpx; color:#ad9066; }.speech-script > view { padding:22rpx 0; border-bottom:1rpx solid #eee9df; }.paragraph-number { display:block; font-size:20rpx; color:#a1957e; margin-bottom:10rpx; }.paragraph-text { display:block; font-size:29rpx; line-height:1.95; }.paragraph-text--english { font-size:31rpx; line-height:1.8; overflow-wrap:anywhere; }.quiet-button { width:100%; background:#f0ede4; color:#748166; padding:16rpx; border-radius:18rpx; margin-top:18rpx!important; }
.voice-profile { display:block; margin-top:10rpx; font-size:21rpx; color:#947b55; line-height:1.6; }
.record-card { text-align:center; }.record-card--active { background:#fbf0e6; border-color:#d8b58b; }.record-clock { display:block; margin:28rpx 0; font-family:Georgia,serif; font-size:66rpx; color:#a57952; }.record-clock text { font-size:27rpx; color:#a19a89; }.record-button { background:#a57952; }.web-note { display:block; font-size:22rpx; color:#957852; line-height:1.7; padding:14rpx; margin-bottom:18rpx; background:#f7f0df; border-radius:14rpx; }.playback-actions { display:grid; grid-template-columns:1fr 1fr; gap:12rpx; margin-top:22rpx; }.playback-actions button { padding:18rpx 10rpx; background:#e9eee2; color:#5a7455; border-radius:18rpx; font-size:23rpx; }.unsaved-card { padding:20rpx; margin-top:20rpx; border-radius:18rpx; background:#fff0d5; color:#8e6538; font-size:24rpx; line-height:1.8; }.unsaved-card button { width:100%; margin-top:14rpx; background:#fffdf7; color:#8e6538; }
.parent-tip { padding:27rpx; margin-top:25rpx; border-radius:26rpx; background:#eee9f2; color:#7d738c; }.parent-tip > text + text { display:block; font-size:24rpx; line-height:1.85; margin-top:16rpx; }.lesson-row { display:flex; width:100%; align-items:center; gap:18rpx; padding:20rpx 8rpx; background:transparent; text-align:left; color:#4e6857; border-bottom:1rpx solid #eee9df; }.lesson-row--current { background:#eff2e6; border-radius:16rpx; }.lesson-day { font-family:Georgia,serif; font-size:32rpx; color:#a2977f; }.lesson-row > view { flex:1; min-width:0; }.lesson-row > view text { display:block; font-size:25rpx; line-height:1.7; }.lesson-row > view text + text { font-size:21rpx; color:#8a917b; }.archive-link { display:block; width:100%; margin-top:24rpx!important; padding:20rpx; border-radius:23rpx; background:#e6ece8; color:#577261; }.privacy-note { display:block; font-size:21rpx; line-height:1.85; text-align:center; color:#90917e; margin:25rpx 8rpx 0; }
@media(max-width:350px) { .today-card,.speech-section { padding:23rpx; }.journey { font-size:19rpx; }.section-head { flex-wrap:wrap; } }
</style>
