<template>
  <view class="space-page">
    <view class="space-nav"><button role="button" @tap="backTo('/pkg-learning/playground/index')">‹ 英语乐园</button><text>SPACE EXPLORER</text><button role="button" aria-label="返回首页" @tap="home">⌂</button></view>
    <view class="title-row"><view><text class="eyebrow">新的小宇宙 · 亲子英语系列</text><text class="space-title">太阳系小旅行</text><text class="subtitle">抬头看星星，也听听它们的英文名字。</text></view><text class="little-star">✦</text></view>
    <view class="map-card">
      <view class="map-heading"><text>SOLAR SYSTEM</text><button role="button" :aria-pressed="paused" @tap="paused = !paused">{{ paused ? '▶ 继续转动' : 'Ⅱ 暂停转动' }}</button></view>
      <view class="space-map">
        <view v-for="(planet,i) in planets" :key="`ring-${planet.id}`" class="orbit-ring" :style="ringStyle(i)" />
        <view v-for="(planet,i) in planets" :key="planet.id" class="orbit-track" :style="trackStyle(i)">
          <button role="button" class="orbit-planet" :style="counterStyle(i)" :aria-label="`认识${planet.nameCn} ${planet.name}`" @tap.stop="openBody(planet.id)"><view class="orbit-art"><PlanetArt :body="planet" /></view><text class="orbit-label">{{ planet.nameCn }}</text></button>
        </view>
        <button role="button" class="map-sun" aria-label="认识太阳 Sun" @tap="openBody('sun')"><PlanetArt :body="spaceBodies[0]" /><text>Sun · 太阳</text></button>
      </view>
      <view class="map-caption"><text>点一颗星球，开启图鉴</text><text>大小、距离与转动速度为示意</text></view>
    </view>
    <view class="explorer-progress"><view><text class="progress-title">我的太空护照</text><text class="muted">已点读 {{ progress.heardIds.length }} / 10 位太空朋友</text></view><text class="progress-number">{{ progress.completedSeriesIds.length }}<text class="muted"> / 3 枚印章</text></text></view>
    <view class="section-heading"><text>三站，慢慢探索</text><text>每站约 3–5 分钟</text></view>
    <view v-for="(series,i) in spaceSeries" :key="series.id" class="series-card">
      <view class="series-heading"><text class="series-number" :style="{color:series.color}">0{{ i + 1 }}</text><view><text class="series-title">{{ series.title }}</text><text class="series-english">{{ series.english }}</text></view><text class="stamp" :class="{'stamp--done':progress.completedSeriesIds.includes(series.id)}">{{ progress.completedSeriesIds.includes(series.id) ? '★' : '✧' }}</text></view>
      <text class="muted series-note">{{ series.note }}</text>
      <view class="series-bodies"><button role="button" v-for="body in seriesBodies(series.id)" :key="body.id" @tap="openBody(body.id,series.id)"><view class="mini-art"><PlanetArt :body="body" /></view><text>{{ body.nameCn }}</text><text class="mini-name">{{ body.name }}</text></button></view>
      <view class="series-actions"><button role="button" @tap="openBody(series.bodyIds[0],series.id)">点图听英语 ↗</button><button role="button" class="quiz-entry" @tap="openQuiz(series.id)">听音找星球 ›</button></view>
    </view>
    <view class="section-heading"><text>十位太空朋友</text><text>恒星 · 行星 · 卫星</text></view>
    <view class="body-grid"><button role="button" v-for="body in spaceBodies" :key="body.id" class="body-card" @tap="openBody(body.id)"><view class="grid-art"><PlanetArt :body="body" /></view><text class="body-name">{{ body.nameCn }}</text><text class="body-english">{{ body.name }}</text><text class="body-kind">{{ kindName(body.kind) }} {{ progress.heardIds.includes(body.id) ? '· ✓ 已点读' : '' }}</text></button></view>
    <view class="parent-note"><text>陪孩子一起抬头</text><text>用手臂画一个太阳，用小球扮演行星。先听名字，再一起指一指、说一句。</text><text>小知识：太阳是一颗恒星，月球是地球的卫星，太阳系有八颗行星。</text></view>
    <button role="button" class="credits" @tap="showCredits">图片来源与科普说明 ↗</button>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { onShow, onHide, onUnload } from '@dcloudio/uni-app';
import { navigate, backTo } from '@/services/navigationService';
import { usePageShare } from '@/composables/usePageShare';
import PlanetArt from '../components/PlanetArt.vue';
import { planets, spaceBodies, spaceSeries, seriesBodies } from '@/mock/solarSystem';
import { getSpaceProgress } from '@/services/spaceLearningService';
usePageShare();
const progress = ref(getSpaceProgress()), paused = ref(false);
let wasPaused = false;
onShow(() => { progress.value = getSpaceProgress(); paused.value = wasPaused; });
onHide(() => { wasPaused = paused.value; paused.value = true; });
onUnload(() => { paused.value = true; });
const diameter = (i: number) => 220 + i * 54;
const ringStyle = (i: number) => ({ width: `${diameter(i)}rpx`, height: `${diameter(i)}rpx`, marginLeft: `-${diameter(i)/2}rpx`, marginTop: `-${diameter(i)/2}rpx` });
const orbitDelay = (i: number) => `-${((i * 137.5 + 35) % 360) / 360 * (36+i*11)}s`;
const trackStyle = (i: number) => ({ ...ringStyle(i), animationDuration: `${36+i*11}s`, animationDelay: orbitDelay(i), animationPlayState: paused.value ? 'paused' : 'running' });
const counterStyle = (i: number) => ({ animationDuration: `${36+i*11}s`, animationDelay: orbitDelay(i), animationPlayState: paused.value ? 'paused' : 'running' });
function openBody(id: string, series = '') { navigate({url:`/pkg-space/body/index?id=${id}${series ? '&series='+series : ''}`}); }
function openQuiz(series: string) { navigate({url:`/pkg-space/quiz/index?series=${series}`}); }
function home() { navigate({url:'/pages/index/index'},'reLaunch'); }
function kindName(kind: string) { return kind === 'star' ? '恒星' : kind === 'moon' ? '天然卫星' : '行星'; }
function showCredits() { uni.showModal({title:'图片与科普来源',content:'纹理：Solar System Scope（CC BY 4.0），经 ORBIT 仓库复用、缩小和 JPEG 压缩。球体明暗、土星环和轨道为科普示意。内容参考 NASA。来源：github.com/ryh842487118-bot/orbit；solarsystemscope.com/textures/；creativecommons.org/licenses/by/4.0/',showCancel:false}); }
</script>
<style scoped>
.space-page { min-height:100vh; box-sizing:border-box; padding:24rpx 30rpx 50rpx; background:#0e182a; color:#f3efe5; }.space-nav { display:flex; justify-content:space-between; align-items:center; margin-bottom:30rpx; }.space-nav button { min-height:44px; color:#d5dfed; font-size:24rpx; padding:0 10rpx; }.space-nav text { font-size:17rpx; letter-spacing:3rpx; color:#879ab8; }.title-row { display:flex; justify-content:space-between; align-items:center; }.eyebrow { display:block; font-size:20rpx; color:#d6b883; margin-bottom:12rpx; }.space-title { display:block; font-size:48rpx; font-weight:800; letter-spacing:2rpx; }.subtitle { display:block; font-size:23rpx; line-height:1.7; color:#9fb0c8; margin-top:15rpx; }.little-star { font-size:65rpx; color:#dac092; }.map-card { margin-top:30rpx; border:1rpx solid #2a3c57; border-radius:32rpx; overflow:hidden; background:radial-gradient(ellipse at 50% 45%,#20314b,#101c31 66%); }.map-heading { display:flex; align-items:center; justify-content:space-between; padding:20rpx 24rpx 0; }.map-heading text { color:#8ea3c0; font-size:18rpx; letter-spacing:3rpx; }.map-heading button { color:#e4d2ab; font-size:22rpx; min-height:44px; }.space-map { position:relative; height:650rpx; }.orbit-ring,.orbit-track { position:absolute; left:50%; top:50%; border-radius:50%; }.orbit-ring { border:1rpx solid rgba(146,172,205,.17); pointer-events:none; }.orbit-track { animation:orbit-turn linear infinite; pointer-events:none; }.orbit-planet { position:absolute; left:100%; top:50%; width:88rpx; height:88rpx; margin-left:-44rpx; margin-top:-44rpx; overflow:visible; pointer-events:auto; animation:counter-turn linear infinite; padding:0; }.orbit-art { width:72rpx; height:72rpx; margin:0 auto; }.orbit-label { display:block; font-size:17rpx; line-height:1.2; color:#b9c9df; }.map-sun { position:absolute; width:120rpx; height:120rpx; top:50%; left:50%; margin-top:-60rpx; margin-left:-60rpx; overflow:visible; padding:0; color:#eccc97; }.map-sun text { display:block; font-size:20rpx; white-space:nowrap; }.map-caption { padding:0 24rpx 24rpx; text-align:center; }.map-caption text { display:block; font-size:22rpx; line-height:1.8; color:#b0c0d7; }.map-caption text + text { font-size:18rpx; color:#697f9f; }.explorer-progress { display:flex; align-items:center; justify-content:space-between; gap:12rpx; padding:30rpx 5rpx; border-bottom:1rpx solid #293950; }.progress-title { display:block; font-size:27rpx; margin-bottom:10rpx; }.muted { color:#93a8c4; font-size:22rpx; line-height:1.7; }.progress-number { color:#d7bc8b; font-size:34rpx; }.section-heading { display:flex; align-items:center; justify-content:space-between; gap:10rpx; margin:38rpx 0 22rpx; }.section-heading text { font-size:29rpx; font-weight:700; }.section-heading text + text { font-size:19rpx; font-weight:400; color:#839ab7; }.series-card { margin-bottom:24rpx; padding:26rpx; border:1rpx solid #2e3e58; border-radius:28rpx; background:#162238; }.series-heading { display:flex; align-items:center; gap:18rpx; }.series-number { font-size:35rpx; font-weight:700; }.series-heading view { flex:1; }.series-title { display:block; font-size:28rpx; font-weight:700; }.series-english { display:block; margin-top:6rpx; font-size:18rpx; letter-spacing:1rpx; color:#8ca2bf; }.stamp { font-size:42rpx; color:#57647e; }.stamp--done { color:#e8c67e; }.series-note { display:block; margin-top:16rpx; }.series-bodies { display:flex; justify-content:space-around; margin:18rpx -10rpx; }.series-bodies button { flex:1; min-height:130rpx; padding:0; color:#d5dfef; font-size:22rpx; }.mini-art { width:105rpx; height:105rpx; margin:0 auto 6rpx; }.mini-name { display:block; font-size:18rpx; color:#839cb9; margin-top:6rpx; }.series-actions { display:flex; gap:12rpx; padding-top:18rpx; border-top:1rpx solid #2b3a53; }.series-actions button { display:flex; align-items:center; justify-content:center; flex:1; min-height:44px; border-radius:18rpx; font-size:22rpx; color:#b6c9e5; background:#253653; padding:10rpx 5rpx; }.series-actions .quiz-entry { color:#f3dfb5; background:#3c3941; }.body-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18rpx; }.body-card { padding:15rpx 12rpx 25rpx; background:#162237; border:1rpx solid #293b55; border-radius:25rpx; }.grid-art { width:200rpx; height:200rpx; margin:0 auto; }.body-name { display:block; font-size:29rpx; font-weight:700; color:#e9edf4; }.body-english { display:block; font-size:22rpx; color:#a6bad6; margin:8rpx 0; }.body-kind { display:block; font-size:18rpx; color:#7b96b6; }.parent-note { margin-top:35rpx; padding:27rpx; border-radius:25rpx; background:#172d3a; }.parent-note text { display:block; font-size:23rpx; line-height:1.8; color:#a6c6d0; }.parent-note text:first-child { color:#c4dfdf; font-size:27rpx; margin-bottom:12rpx; font-weight:700; }.parent-note text:last-child { margin-top:12rpx; font-size:21rpx; }.credits { min-height:44px; margin-top:25rpx; font-size:20rpx; color:#8396b4; }@keyframes orbit-turn { from {transform:rotate(0deg)} to {transform:rotate(360deg)} }@keyframes counter-turn { from {transform:rotate(0deg)} to {transform:rotate(-360deg)} }
</style>
