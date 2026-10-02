<template>
  <view class="page adventure-page adventure-hub">
    <view class="adventure-topbar"><button class="adventure-back" @tap="goBack">‹ 返回乐园</button><text class="adventure-topbar__note">和家长一起玩</text></view>
    <text class="section-kicker">LITTLE TOWN, BIG ADVENTURES</text>
    <text class="page-title">车车英语小冒险</text>
    <text class="page-subtitle">{{ activeChapter === "car-life" ? "洗车、修车、再出发，一起演生活里的英语。" : "开一辆小车，把英语玩进故事里。" }}</text>
    <AudioFeedback />
    <view class="town-hero">
      <view class="town-hero__copy"><text>今天的小司机，准备好了吗？</text><text>听一句 · 动一动 · 一起演</text></view>
      <AdventureScene destination="park" :vehicle="activeChapter === 'car-life' ? 'delivery-van' : 'red-hatchback'" />
      <view class="town-stats"><view><text>{{ deliveryCount }} / {{ deliveryMissions.length }}</text><text>水果送到了</text></view><view><text>{{ roleplayCount }} / {{ roleplayScenes.length }}</text><text>小剧场演过了</text></view><view><text>★ {{ progress.stars }}</text><text>我的小星星</text></view></view>
    </view>
    <view class="chapter-tabs" role="tablist"><button v-for="chapter in chapters" :key="chapter.id" class="chapter-tab" :class="{ 'chapter-tab--active': activeChapter === chapter.id }" role="tab" :aria-selected="activeChapter === chapter.id" @tap="switchChapter(chapter.id)">{{ chapter.label }}<text v-if="chapter.id === 'car-life'">新</text></button></view>
    <view class="section-head"><view><text class="section-kicker">SPECIAL DELIVERY</text><text class="section-title">送货小司机</text></view><text class="section-caption">每趟 3 个小任务</text></view>
    <button v-for="mission in visibleMissions" :key="mission.id" class="mission-entry" :style="{ backgroundColor: mission.tint }" @tap="openDelivery(mission.id)">
      <image class="mission-entry__art" :src="mission.recipientArt" mode="aspectFit" />
      <view class="mission-entry__copy"><text class="mission-entry__badge">{{ progress.completedDeliveryMissionIds.includes(mission.id) ? '✓ 送达印章' : '选车 → 装货 → 送达' }}</text><text class="mission-entry__title">{{ mission.title }}</text><text class="mission-entry__note">{{ mission.subtitle }}</text></view><text class="mission-entry__arrow">↗</text>
    </button>
    <view class="section-head"><view><text class="section-kicker">LET'S PRETEND</text><text class="section-title">亲子小剧场</text></view><text class="section-caption">一人一个角色</text></view>
    <view class="theater-list">
      <button v-for="(scene, index) in visibleScenes" :key="scene.id" class="theater-entry" @tap="openRoleplay(scene.id)">
        <view class="theater-entry__ticket" :style="{ backgroundColor: scene.tint }"><text>0{{ index + 1 }}</text><text>{{ ticketFor(scene) }}</text></view>
        <view class="theater-entry__copy"><text class="theater-entry__title">{{ scene.title }}</text><text class="theater-entry__roles">{{ scene.roles.first }} × {{ scene.roles.second }} · {{ scene.lines.length }} 句对话</text><text class="theater-entry__note">{{ progress.completedRoleplaySceneIds.includes(scene.id) ? '✓ 演过啦，换角色再来一遍' : '点一句听一句，再一起演出来' }}</text></view><text class="mission-entry__arrow">↗</text>
      </button>
    </view>
    <view class="adventure-offline"><text>留一点时间，去真实的小世界里玩</text><text>屏幕里的小任务结束后，拿出玩具车或积木，再演一遍。想停就停，随时回来接着玩。</text></view>
    <text class="hub-footnote">离线语音 · 进度保存在本机 · 每个故事首次完成 +1 ★</text>
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow, onHide, onUnload } from "@dcloudio/uni-app";
import AudioFeedback from "@/components/AudioFeedback.vue";
import AdventureScene from "../components/AdventureScene.vue";
import { deliveryMissions, roleplayScenes, type AdventureChapterId, type RoleplayScene } from "@/mock/adventures";
import { getCartownProgress } from "@/services/cartownProgressService";
import { stopAudio } from "@/services/audioService";
import { usePageShare } from "@/composables/usePageShare";
usePageShare();
const progress = ref(getCartownProgress());
const chapters: Array<{id: AdventureChapterId; label: string}> = [{ id: "first-trip", label: "初次出发" }, { id: "car-life", label: "小车生活篇" }];
const activeChapter = ref<AdventureChapterId>("car-life");
const visibleMissions = computed(() => deliveryMissions.filter(m => (m.chapter || "first-trip") === activeChapter.value));
const visibleScenes = computed(() => roleplayScenes.filter(s => (s.chapter || "first-trip") === activeChapter.value));
function switchChapter(id: AdventureChapterId) { stopAudio(); activeChapter.value = id; }
function ticketFor(scene: RoleplayScene) { return scene.activity ? { wash: "WASH", repair: "FIX", fuel: "FUEL" }[scene.activity] : scene.id === "fruit-shop" ? "SHOP" : "TRIP"; }
const deliveryCount = computed(() => deliveryMissions.filter(m => progress.value.completedDeliveryMissionIds.includes(m.id)).length);
const roleplayCount = computed(() => roleplayScenes.filter(s => progress.value.completedRoleplaySceneIds.includes(s.id)).length);
onShow(() => { progress.value = getCartownProgress(); });
onHide(stopAudio); onUnload(stopAudio);
function openDelivery(id: string) { stopAudio(); uni.navigateTo({ url: `/pkg-adventure/delivery/index?mission=${id}` }); }
function openRoleplay(id: string) { stopAudio(); uni.navigateTo({ url: `/pkg-adventure/roleplay/index?scene=${id}` }); }
function goBack() { stopAudio(); if (getCurrentPages().length > 1) uni.navigateBack(); else uni.reLaunch({ url: "/pkg-learning/playground/index" }); }
</script>
<style scoped lang="scss">
@use "../adventure.scss";
.town-hero { margin-top: 28rpx; overflow: hidden; border: 1rpx solid #eee4d6; border-radius: 32rpx; background: #f1f3e9; }
.town-hero__copy { padding: 28rpx 28rpx 10rpx; }.town-hero__copy text { display: block; font-size: 27rpx; font-weight: 800; }.town-hero__copy text + text { margin-top: 12rpx; font-size: 21rpx; font-weight: 400; color: #879179; }
.town-stats { display: flex; justify-content: space-around; padding: 24rpx 10rpx; background: #fffdf9; }.town-stats view { text-align: center; }.town-stats text { display: block; font-size: 30rpx; font-weight: 900; color: #7c8a68; }.town-stats text + text { margin-top: 8rpx; font-size: 18rpx; font-weight: 400; color: #958b7d; }
.chapter-tabs { display: flex; gap: 8rpx; padding: 8rpx; margin-top: 24rpx; border-radius: 24rpx; background: #eee8de; }.chapter-tab { display: flex; justify-content: center; align-items: center; gap: 12rpx; flex: 1; min-height: 80rpx; border-radius: 18rpx; color: #948571; font-size: 26rpx; font-weight: 800; }.chapter-tab--active { background: #fffdf9; color: #263d59; box-shadow: 0 4rpx 12rpx #7a61310a; }.chapter-tab text { font-size: 16rpx; padding: 6rpx 9rpx; border-radius: 8rpx; background: #f4e2bb; color: #a38348; }
.section-caption { font-size: 20rpx; color: #998a75; }.section-head { margin: 32rpx 0 18rpx; }
.mission-entry { display: flex; align-items: center; width: 100%; gap: 14rpx; margin-bottom: 16rpx; padding: 22rpx; border-radius: 28rpx; text-align: left; }
.mission-entry__art { flex: none; width: 128rpx; height: 124rpx; }.mission-entry__copy,.theater-entry__copy { flex: 1; min-width: 0; }.mission-entry__copy text { display: block; }.mission-entry__badge { font-size: 17rpx; color: #8e896e; }.mission-entry__title { margin: 12rpx 0 8rpx; font-size: 28rpx; font-weight: 900; }.mission-entry__note { font-size: 20rpx; line-height: 1.5; color: #918271; }.mission-entry__arrow { flex: none; font-size: 31rpx; color: #a58b62; }
.theater-list { overflow: hidden; border: 1rpx solid #eee4d6; border-radius: 28rpx; background: #fffdf9; }.theater-entry { display: flex; align-items: center; gap: 22rpx; width: 100%; padding: 24rpx; text-align: left; }.theater-entry + .theater-entry { border-top: 1rpx dashed #e9dfcf; }.theater-entry__ticket { flex: none; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6rpx; width: 90rpx; height: 112rpx; border-radius: 16rpx; }.theater-entry__ticket text:first-child { font-family: Georgia, serif; font-size: 38rpx; color: #8e7c61; }.theater-entry__ticket text + text { font-size: 14rpx; letter-spacing: 2rpx; color: #a59278; }.theater-entry__copy text { display: block; }.theater-entry__title { font-size: 27rpx; font-weight: 900; }.theater-entry__roles { margin-top: 10rpx; font-size: 20rpx; color: #8b7c68; }.theater-entry__note { margin-top: 8rpx; font-size: 18rpx; color: #a39684; line-height: 1.5; }.hub-footnote { display: block; text-align: center; font-size: 17rpx; color: #a39789; line-height: 1.7; }
</style>
