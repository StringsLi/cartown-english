<template>
  <view class="page adventure-page roleplay-page">
    <view class="adventure-topbar"><button class="adventure-back" @tap="backToAdventure">‹ 小冒险</button><text class="adventure-topbar__note">亲子小剧场</text></view>
    <text class="section-kicker">LET'S PLAY TOGETHER</text><text class="page-title">{{ scene.title }}</text><text class="page-subtitle">{{ scene.subtitle }}</text>
    <view v-if="!started || finished" class="theater-scene" :style="{ backgroundColor: scene.tint }"><AdventureScene :destination="scene.destination" car="blue" :arrived="finished" /><view class="theater-scene__caption"><text>{{ scene.roles.first }} × {{ scene.roles.second }}</text><text>你一句，我一句</text></view></view>

    <view v-if="!started && !finished" class="adventure-card role-setup">
      <text class="adventure-kicker">孩子想当谁？</text>
      <view class="role-choices"><button v-for="role in roleOptions" :key="role" class="role-choice" :class="{ 'role-choice--selected': childRole === role }" :aria-pressed="childRole === role" @tap="childRole = role"><view class="role-choice__icon">{{ role === 'first' ? '01' : '02' }}</view><text>我当{{ scene.roles[role] }}</text><text>{{ childRole === role ? '✓ 选好啦' : '点我选角色' }}</text></button></view>
      <text class="role-setup__note">家长当{{ scene.roles[parentRole] }}。不用背台词，点一句听一句，跟着说或做动作就可以。</text>
      <button class="adventure-primary role-start" @tap="start">开始表演 ›</button>
    </view>

    <view v-else-if="!finished" class="adventure-card role-dialog">
      <view class="dialog-head"><text class="adventure-kicker">{{ currentLine.role === childRole ? '轮到孩子啦' : '轮到家长啦' }}</text><text>{{ lineIndex + 1 }} / {{ scene.lines.length }} 句</text></view>
      <view class="dialog-progress"><view v-for="(_, index) in scene.lines" :key="index" :class="{ 'dialog-progress--done': index < lineIndex, 'dialog-progress--current': index === lineIndex }" /></view>
      <view class="speaker-row"><image :src="`${adventureArtRoot}/actions-wave.png`" mode="aspectFit" /><view><text>{{ scene.roles[currentLine.role] }}</text><text>{{ currentLine.role === childRole ? '孩子的角色' : '家长的角色' }}</text></view><text class="speaker-row__tag">{{ currentLine.role === childRole ? 'YOUR TURN' : 'TOGETHER' }}</text></view>
      <view class="dialog-bubble" :class="{ 'dialog-bubble--child': currentLine.role === childRole }"><text>{{ currentPhrase.text }}</text><text v-if="showTranslation" class="dialog-bubble__translation">{{ currentLine.translation }}</text></view>
      <button class="adventure-listen" @tap="listenCurrent">▶ 听这句，跟着说</button>
      <text class="dialog-action">{{ currentLine.action }}</text>
      <button class="translation-toggle" :aria-expanded="showTranslation" @tap="showTranslation = !showTranslation">{{ showTranslation ? '收起中文提示' : '家长看中文提示' }} {{ showTranslation ? '⌃' : '⌄' }}</button>
      <button class="adventure-primary dialog-next" @tap="nextLine">{{ nextLabel }}</button>
      <text class="dialog-note">一起说或做动作，准备好了再下一句。</text>
      <view class="dialog-controls"><button v-if="lineIndex > 0" @tap="previousLine">‹ 上一句</button><button @tap="swapRoles">交换角色，从头再演 ⇄</button></view>
    </view>

    <view v-else class="adventure-card adventure-complete">
      <text class="adventure-complete__star">★</text><text class="adventure-complete__title">小剧场，演完啦！</text><text class="adventure-complete__note">{{ earned ? '收集一枚剧场印章，获得 1 颗小星星。' : '又演完一个故事，熟悉的台词也能玩出新花样。' }}</text>
      <view class="adventure-offline"><text>离开屏幕，再演一遍</text><text>{{ scene.offlineTask }}</text></view>
      <button class="adventure-primary role-swap" @tap="swapRoles">交换角色，再演一遍 ⇄</button><button class="adventure-text-button" @tap="backToAdventure">返回小冒险</button>
    </view>

    <button class="adventure-text-button script-toggle" :aria-expanded="showScript" @tap="showScript = !showScript">{{ showScript ? '收起完整台词 ⌃' : '家长看完整台词 ⌄' }}</button>
    <view v-if="showScript" class="script-card"><button v-for="(line, index) in scene.lines" :key="index" class="script-line" :aria-label="`点读第${index + 1}句：${adventurePhrases[line.phrase].text}`" @tap="listenLine(index)"><text class="script-line__role">{{ scene.roles[line.role] }} · {{ line.role === childRole ? '孩子' : '家长' }}</text><text class="script-line__phrase">{{ adventurePhrases[line.phrase].text }}</text><text class="script-line__translation">{{ line.translation }}</text><text class="script-line__play">▶</text></button></view>
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onHide, onUnload } from "@dcloudio/uni-app";
import AdventureScene from "../components/AdventureScene.vue";
import { backToAdventure } from "@/services/adventureNavigation";
import { adventureArtRoot, adventurePhrases, roleplayScenes, getRoleplayScene } from "@/mock/adventures";
import { completeRoleplayScene } from "@/services/cartownProgressService";
import { playAudio, stopAudio } from "@/services/audioService";
import { usePageShare } from "@/composables/usePageShare";
type Role = "first" | "second";
const roleOptions: Role[] = ["first", "second"];
const scene = ref(roleplayScenes[0]);
const childRole = ref<Role>("first"), lineIndex = ref(0), started = ref(false), finished = ref(false), earned = ref(false), showTranslation = ref(false), showScript = ref(false);
const parentRole = computed<Role>(() => childRole.value === "first" ? "second" : "first");
const currentLine = computed(() => scene.value.lines[lineIndex.value]);
const currentPhrase = computed(() => adventurePhrases[currentLine.value.phrase]);
const nextLabel = computed(() => lineIndex.value === scene.value.lines.length - 1 ? "演完啦，收集印章 ★" : currentLine.value.role === childRole.value ? "我说好了，下一句 ›" : "家长说好了，下一句 ›");
usePageShare({ title: () => `亲子小剧场：${scene.value.title}` });
onLoad(query => { scene.value = getRoleplayScene(String(query?.scene || "")) || roleplayScenes[0]; });
onHide(stopAudio); onUnload(stopAudio);
function listenLine(index: number) { const phrase = adventurePhrases[scene.value.lines[index].phrase]; playAudio(phrase.audio, phrase.text); }
function listenCurrent() { listenLine(lineIndex.value); }
function start() { stopAudio(); lineIndex.value = 0; started.value = true; finished.value = false; earned.value = false; showScript.value = false; uni.pageScrollTo({ scrollTop: 0, duration: 0 }); }
function nextLine() { if (!started.value || finished.value) return; stopAudio(); if (lineIndex.value < scene.value.lines.length - 1) { lineIndex.value += 1; return; } earned.value = completeRoleplayScene(scene.value.id).earned; finished.value = true; uni.pageScrollTo({ scrollTop: 0, duration: 0 }); }
function previousLine() { stopAudio(); if (lineIndex.value > 0) lineIndex.value -= 1; }
function swapRoles() { childRole.value = parentRole.value; start(); }
</script>
<style scoped lang="scss">
@use "../adventure.scss";
.theater-scene { margin-top: 24rpx; overflow: hidden; border-radius: 30rpx; }.theater-scene__caption { display: flex; justify-content: space-between; padding: 18rpx 26rpx; font-size: 21rpx; color: #8f806c; }.theater-scene__caption text:first-child { font-weight: 800; }
.role-choices { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16rpx; margin: 24rpx 0; }.role-choice { display: flex; flex-direction: column; justify-content: center; align-items: center; min-width: 0; padding: 28rpx 12rpx; border: 2rpx solid #eee5d6; border-radius: 24rpx; background: #fbf7ef; }.role-choice--selected { border-color: #8bafbb; background: #eaf2f4; }.role-choice__icon { width: 78rpx; height: 78rpx; line-height: 78rpx; border-radius: 50%; font-family: Georgia, serif; font-size: 36rpx; color: #a18c69; background: #fffdf9; }.role-choice > text { margin-top: 16rpx; font-size: 29rpx; font-weight: 800; }.role-choice > text + text { margin-top: 8rpx; font-size: 19rpx; font-weight: 400; color: #8c9a99; }.role-setup__note { display: block; margin: 12rpx 0 28rpx; font-size: 23rpx; line-height: 1.75; color: #928671; }
.dialog-head { display: flex; justify-content: space-between; align-items: center; gap: 12rpx; }.dialog-head > text + text { font-size: 19rpx; color: #a3927a; }.dialog-progress { display: flex; gap: 8rpx; margin: 16rpx 0 22rpx; }.dialog-progress view { flex: 1; height: 7rpx; border-radius: 5rpx; background: #e9e2d7; }.dialog-progress .dialog-progress--done { background: #a3b28c; }.dialog-progress .dialog-progress--current { background: #d9b365; }
.speaker-row { display: flex; align-items: center; gap: 12rpx; }.speaker-row image { width: 88rpx; height: 82rpx; }.speaker-row view text { display: block; font-size: 26rpx; font-weight: 800; }.speaker-row view text + text { margin-top: 6rpx; font-size: 18rpx; font-weight: 400; color: #a39179; }.speaker-row__tag { margin-left: auto; font-size: 15rpx; letter-spacing: 1rpx; color: #8b9e9f; }
.dialog-bubble { position: relative; margin: 20rpx 0 22rpx; padding: 28rpx; border-radius: 8rpx 26rpx 26rpx 26rpx; background: #f0eadf; }.dialog-bubble--child { background: #eaf1e2; }.dialog-bubble > text { display: block; font-size: 42rpx; font-weight: 900; line-height: 1.45; }.dialog-bubble .dialog-bubble__translation { margin-top: 14rpx; font-size: 23rpx; font-weight: 400; color: #8c8d73; }
.dialog-action { display: block; margin: 22rpx 0 0; text-align: center; font-size: 24rpx; line-height: 1.6; color: #8d826f; }.translation-toggle { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 70rpx; margin-bottom: 16rpx; font-size: 19rpx; color: #a39179; }.dialog-note { display: block; margin-top: 16rpx; text-align: center; font-size: 18rpx; color: #aa9a83; line-height: 1.6; }.dialog-controls { display: flex; align-items: center; justify-content: center; gap: 28rpx; margin-top: 12rpx; }.dialog-controls button { display: flex; align-items: center; min-height: 72rpx; font-size: 21rpx; color: #9d876b; }
.script-card { overflow: hidden; border: 1rpx solid #eee4d6; border-radius: 24rpx; background: #fffdf9; }.script-line { position: relative; display: block; width: 100%; padding: 22rpx 70rpx 22rpx 24rpx; text-align: left; }.script-line + .script-line { border-top: 1rpx dashed #eee4d6; }.script-line text { display: block; }.script-line__role { font-size: 18rpx; color: #a39179; }.script-line__phrase { margin-top: 10rpx; font-size: 28rpx; font-weight: 800; }.script-line__translation { margin-top: 6rpx; font-size: 21rpx; color: #8f8779; }.script-line__play { position: absolute; right: 26rpx; top: 50rpx; font-size: 23rpx; color: #8aa0a2; }
</style>
