<template>
  <view class="body-page">
    <view class="body-nav"><button role="button" @tap="backTo('/pkg-space/index/index')">‹ 太阳系</button><text>PLANET ATLAS</text><text>{{ index + 1 }} / {{ journey.length }}</text></view>
    <text v-if="invalidLink" class="link-note">未找到指定天体，先认识太阳吧。</text>
    <view class="planet-stage"><text class="stage-star stage-star--one">✦</text><text class="stage-star stage-star--two">·</text><view class="large-planet"><PlanetArt :body="body" /></view><text class="type-label">{{ kindName }}</text></view>
    <view class="body-title"><text class="english-title">{{ body.name }}</text><text class="chinese-title">{{ body.nameCn }}</text><text v-if="progress.heardIds.includes(body.id)" class="heard-badge">✓ 已点读</text></view>
    <button role="button" class="listen-name" :aria-label="`听${body.name}的英文发音`" @tap="listenName">{{ audioPlaybackState.phase === 'loading' ? '正在准备声音…' : '▶ 听英文名字' }}</button>
    <text class="audio-note" role="status">{{ audioNote }}</text>
    <view class="sentence-card"><text class="card-kicker">和我说一句 · SAY IT WITH ME</text><text class="sentence">{{ body.sentence }}</text><text class="sentence-cn">{{ body.sentenceCn }}</text><button role="button" @tap="listenSentence">▶ 听这句话</button></view>
    <view class="fact-card"><text class="card-title">这颗星球的小秘密</text><text class="fact-copy">{{ body.fact }}</text></view>
    <view class="family-card"><text class="card-title">离开屏幕，玩一下</text><text class="fact-copy">{{ body.parentTask }}</text></view>
    <view class="journey-controls"><button role="button" :disabled="index === 0" @tap="move(-1)">‹ 上一位</button><button role="button" :disabled="index === journey.length - 1" @tap="move(1)">下一位 ›</button></view>
    <button role="button" class="quiz-button" @tap="openQuiz">认识了，去听音找星球 ↗</button>
    <text class="visual-note">纹理复用自 ORBIT / Solar System Scope，球体为视觉示意。</text>
  </view>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { backTo, navigate } from '@/services/navigationService';
import { usePageShare } from '@/composables/usePageShare';
import { playAudio, audioPlaybackState } from '@/services/audioService';
import PlanetArt from '../components/PlanetArt.vue';
import { spaceBodies, spaceSeries, getSpaceBody, seriesBodies } from '@/mock/solarSystem';
import { getSpaceProgress, markSpaceHeard } from '@/services/spaceLearningService';
const bodyId = ref('sun'), seriesId = ref('home'), scopedJourney = ref(false), invalidLink = ref(false), progress = ref(getSpaceProgress());
const body = computed(() => getSpaceBody(bodyId.value) || spaceBodies[0]);
const journey = computed(() => scopedJourney.value ? seriesBodies(seriesId.value) : spaceBodies);
const index = computed(() => Math.max(0,journey.value.findIndex(item => item.id === body.value.id)));
const kindName = computed(() => body.value.kind === 'star' ? '恒星 · STAR' : body.value.kind === 'moon' ? '天然卫星 · MOON' : '行星 · PLANET');
const audioNote = computed(() => ({idle:'点一下，和孩子一起听。',loading:'正在准备离线英语音频…',playing:'正在播放 ♪',ended:'听完啦，再说一次也很好。',error:'声音暂时没播出来，请再点播放按钮。'})[audioPlaybackState.value.phase]);
usePageShare({title:()=>`${body.value.nameCn} ${body.value.name}，一起认识太空朋友`});
onLoad(options => {
  const id = typeof options?.id === 'string' ? options.id : 'sun'; invalidLink.value = !getSpaceBody(id); bodyId.value = getSpaceBody(id)?.id || 'sun';
  const requested = spaceSeries.find(series => series.id === options?.series && series.bodyIds.includes(bodyId.value));
  scopedJourney.value = !!requested; seriesId.value = requested?.id || spaceSeries.find(series => series.bodyIds.includes(bodyId.value))!.id;
});
onShow(() => { progress.value = getSpaceProgress(); });
function listenName() { const item = body.value; playAudio(item.audio,item.name,()=>{progress.value=markSpaceHeard(item.id);}); }
function listenSentence() { const item = body.value; playAudio(item.sentenceAudio,item.sentence,()=>{progress.value=markSpaceHeard(item.id);}); }
function move(step: number) { const next = journey.value[index.value + step]; if(next) navigate({url:`/pkg-space/body/index?id=${next.id}${scopedJourney.value ? '&series='+seriesId.value : ''}`},'redirectTo'); }
function openQuiz() { navigate({url:`/pkg-space/quiz/index?series=${seriesId.value}`}); }
</script>
<style scoped>
.body-page { min-height:100vh; box-sizing:border-box; padding:24rpx 34rpx 50rpx; background:#0e182a; color:#f1eee6; }.body-nav { display:flex; justify-content:space-between; align-items:center; }.body-nav button { min-height:44px; color:#becde1; font-size:24rpx; padding:0; }.body-nav text { color:#7e95b5; font-size:18rpx; letter-spacing:2rpx; }.link-note { display:block; margin-top:20rpx; color:#d8be91; font-size:22rpx; }.planet-stage { position:relative; height:450rpx; margin-top:20rpx; background:radial-gradient(ellipse at center,#22344e,transparent 65%); }.large-planet { position:absolute; width:390rpx; height:390rpx; top:15rpx; left:50%; margin-left:-195rpx; }.type-label { position:absolute; bottom:0; width:100%; text-align:center; letter-spacing:3rpx; color:#829bbc; font-size:18rpx; }.stage-star { position:absolute; color:#c0a576; }.stage-star--one { top:65rpx; left:40rpx; font-size:32rpx; }.stage-star--two { top:130rpx; right:45rpx; font-size:50rpx; }.body-title { text-align:center; margin:24rpx 0 25rpx; }.english-title { display:block; font-size:62rpx; font-weight:700; letter-spacing:2rpx; }.chinese-title { display:block; font-size:32rpx; margin:12rpx 0; color:#ccd8e9; }.heard-badge { display:inline-block; font-size:19rpx; color:#9dc7b8; }.listen-name { display:flex; align-items:center; justify-content:center; min-height:max(94rpx, 44px); border-radius:24rpx; background:#dbbd84; color:#172335; font-size:27rpx; font-weight:700; }.audio-note { display:block; min-height:36rpx; font-size:21rpx; text-align:center; line-height:1.8; color:#8ba4c4; margin:15rpx 0 25rpx; }.sentence-card { padding:30rpx; border-radius:27rpx; background:#1b2b43; border:1rpx solid #344865; }.card-kicker { display:block; font-size:18rpx; letter-spacing:1rpx; color:#8eabc9; }.sentence { display:block; font-size:34rpx; line-height:1.55; font-weight:600; margin-top:18rpx; }.sentence-cn { display:block; font-size:24rpx; line-height:1.8; color:#a7b9d0; margin:12rpx 0; }.sentence-card button { display:flex; align-items:center; justify-content:center; min-height:44px; border-radius:18rpx; background:#304665; color:#d9e5f5; font-size:23rpx; margin-top:20rpx; }.fact-card,.family-card { padding:28rpx; border-radius:25rpx; margin-top:22rpx; background:#162339; }.family-card { background:#17303a; }.card-title { display:block; font-size:26rpx; font-weight:600; color:#d7e4ed; margin-bottom:12rpx; }.fact-copy { display:block; font-size:24rpx; line-height:1.85; color:#9fb5cd; }.family-card .fact-copy { color:#a6c6cb; }.journey-controls { display:flex; gap:15rpx; margin:28rpx 0 18rpx; }.journey-controls button { display:flex; align-items:center; justify-content:center; flex:1; min-height:44px; border:1rpx solid #38516e; border-radius:20rpx; color:#b5cae2; font-size:24rpx; }.journey-controls button[disabled] { opacity:.35; }.quiz-button { display:flex; align-items:center; justify-content:center; min-height:max(94rpx, 44px); border-radius:24rpx; background:#2a4856; color:#c6e0e6; font-size:25rpx; }.visual-note { display:block; text-align:center; font-size:18rpx; line-height:1.8; color:#6f86a4; margin-top:30rpx; }
</style>
