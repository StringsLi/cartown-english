<template>
  <view class="page adventure-page delivery-page">
    <view class="adventure-topbar"><button role="button" class="adventure-back" @tap="backToAdventure">‹ 小冒险</button><text class="adventure-topbar__note">送货小司机</text></view>
    <text class="section-kicker">A LITTLE DELIVERY</text><text class="page-title">{{ mission.title }}</text><text class="page-subtitle">{{ mission.subtitle }}</text>
    <AudioFeedback />
    <view v-if="step !== 1 || finished" class="delivery-scene" :style="{ backgroundColor: mission.tint }"><AdventureScene :destination="mission.destination" :car="selectedCar || mission.car" :arrived="finished" /><view class="delivery-scene__caption"><image :src="mission.recipientArt" mode="aspectFit" /><text>{{ finished ? '谢谢你，小司机！' : '有一位小伙伴在等水果点心。' }}</text></view></view>
    <view class="adventure-stepper"><view v-for="(label, index) in steps" :key="label" class="adventure-stepper__step" :class="{ 'adventure-stepper__step--active': !finished && step === index, 'adventure-stepper__step--done': finished || step > index }"><text>{{ finished || step > index ? '✓' : index + 1 }}</text><text>{{ label }}</text></view></view>

    <view v-if="!finished" class="adventure-card delivery-task">
      <text class="adventure-kicker">{{ step === 0 ? '先选一辆小汽车' : step === 1 ? '听订单，点水果装车' : '听一听，开车去哪里？' }}</text>
      <text class="adventure-prompt">{{ currentPhrase.text }}</text>
      <button role="button" class="adventure-listen" @tap="listen"><text>▶</text><text>{{ step === 0 ? '听选车提示' : step === 1 ? '听水果订单' : '听目的地' }}</text></button>

      <view v-if="step === 0" class="delivery-choices">
        <button role="button" v-for="car in deliveryCars" :key="car.id" class="delivery-choice car-choice" :aria-label="car.label" @tap="chooseCar(car.id)"><image :src="car.art" mode="aspectFit" /><text>{{ car.label }}</text><text class="car-choice__model">{{ car.model }}</text></button>
      </view>
      <view v-else-if="step === 1">
        <view class="delivery-choices"><button role="button" v-for="fruit in deliveryFruits" :key="fruit.id" class="delivery-choice fruit-choice" :aria-label="`装一个${fruit.label}`" @tap="addFruit(fruit.id)"><image :src="fruit.art" mode="aspectFit" /><text>＋ {{ fruit.label }}</text></button></view>
        <view class="cargo-head"><text>我的小货箱 · {{ cargo.length }} 件</text><button role="button" @tap="clearCargo">清空重装</button></view>
        <view class="cargo-box"><view v-for="index in 3" :key="index" class="cargo-slot"><button role="button" v-if="cargo[index - 1]" :aria-label="`取出第${index}件${fruitFor(cargo[index - 1]).label}`" @tap="removeFruit(index - 1)"><image :src="fruitFor(cargo[index - 1]).art" mode="aspectFit" /><text>×</text></button><text v-else class="cargo-slot__empty">·</text></view></view>
        <text class="cargo-note">点货箱里的水果，可以取出来。</text>
      </view>
      <view v-else class="delivery-choices destination-choices"><button role="button" v-for="destination in deliveryDestinations" :key="destination.id" class="delivery-choice destination-choice" :aria-label="`送到${destination.label}`" @tap="chooseDestination(destination.id)"><view v-if="destination.id === 'park'" class="destination-park"><view /><view /><view /></view><image v-else-if="destination.id === 'zoo'" :src="`${adventureArtRoot}/animals-lion.png`" mode="aspectFit" /><view v-else class="destination-garden"><text>✿</text><text>✿</text></view><text>{{ destination.label }}</text><text class="destination-choice__english">{{ destination.english }}</text></button></view>
      <text class="adventure-feedback" aria-live="polite">{{ feedback || '慢慢听，想听几遍都可以。' }}</text>
      <button role="button" v-if="step === 1" class="adventure-primary cargo-submit" @tap="submitCargo">装好了，去送货 ›</button>
      <button role="button" class="adventure-text-button" @tap="restart">从头再来</button>
    </view>

    <view v-else class="adventure-card adventure-complete">
      <text class="adventure-complete__star">★</text><text class="adventure-complete__title">送到啦！</text><text class="adventure-complete__note">{{ earned ? '收集一枚送达印章，获得 1 颗小星星。' : '又完成了一趟送货，老朋友很开心。' }}</text>
      <button role="button" class="adventure-listen" @tap="playPhrase('hereYouAre')">▶ Here you are!</button>
      <view class="adventure-offline"><text>拿出玩具，接着玩</text><text>{{ mission.offlineTask }}</text></view>
      <button role="button" v-if="nextMission" class="adventure-primary next-mission" @tap="openNext">下一趟 · {{ nextMission.title }}</button>
      <button role="button" class="adventure-text-button" @tap="restart">再送一次</button><button role="button" class="adventure-text-button" @tap="backToAdventure">返回小冒险</button>
    </view>
  </view>
</template>
<script setup lang="ts">
import { navigate } from "@/services/navigationService";
import { computed, ref } from "vue";
import { onLoad, onHide, onUnload } from "@dcloudio/uni-app";
import AudioFeedback from "@/components/AudioFeedback.vue";
import AdventureScene from "../components/AdventureScene.vue";
import { backToAdventure } from "@/services/adventureNavigation";
import { adventureArtRoot, adventurePhrases, deliveryMissions, deliveryCars, deliveryFruits, deliveryDestinations, getDeliveryMission, getNextDeliveryMission, checkDeliveryCargo, type CarId, type FruitId, type DestinationId, type AdventurePhraseId } from "@/mock/adventures";
import { completeDeliveryMission, getCartownProgress } from "@/services/cartownProgressService";
import { playAudio, stopAudio } from "@/services/audioService";
import { usePageShare } from "@/composables/usePageShare";
const mission = ref(deliveryMissions[0]);
const steps = ["选小车", "装水果", "去送货"];
const step = ref(0), selectedCar = ref<CarId | null>(null), cargo = ref<FruitId[]>([]), feedback = ref(""), finished = ref(false), earned = ref(false);
const currentPhrase = computed(() => adventurePhrases[step.value === 0 ? mission.value.carPhrase : step.value === 1 ? mission.value.orderPhrase : mission.value.destinationPhrase]);
const nextMission = computed(() => getNextDeliveryMission(mission.value, getCartownProgress().completedDeliveryMissionIds));
usePageShare({ title: () => `和孩子一起玩：${mission.value.title}` });
onLoad(query => { mission.value = getDeliveryMission(String(query?.mission || "")) || deliveryMissions[0]; });
onHide(stopAudio); onUnload(stopAudio);
function playPhrase(id: AdventurePhraseId) { const phrase = adventurePhrases[id]; playAudio(phrase.audio, phrase.text); }
function listen() { playAudio(currentPhrase.value.audio, currentPhrase.value.text); }
function chooseCar(id: CarId) { if (finished.value || step.value !== 0) return; stopAudio(); if (id !== mission.value.car) { feedback.value = "再听一遍，找找这辆车的颜色。"; listen(); return; } selectedCar.value = id; step.value = 1; scrollToTop(); feedback.value = "小车选好了！来听水果订单。"; }
function addFruit(id: FruitId) { if (cargo.value.length >= 3) { feedback.value = "小货箱装满啦，可以先取出一个。"; return; } cargo.value.push(id); feedback.value = ""; }
function fruitFor(id: FruitId) { return deliveryFruits.find(f => f.id === id) || deliveryFruits[0]; }
function removeFruit(index: number) { cargo.value.splice(index, 1); feedback.value = ""; }
function clearCargo() { cargo.value = []; feedback.value = ""; }
function submitCargo() { if (finished.value || step.value !== 1) return; stopAudio(); const result = checkDeliveryCargo(mission.value, cargo.value); if (result !== "correct") { feedback.value = result === "fruit" ? "再听听，小伙伴想要哪种水果？" : "一起数一数，再听听订单里的数量。"; listen(); return; } step.value = 2; scrollToTop(); feedback.value = "点心装好了！听听要送到哪里。"; }
function chooseDestination(id: DestinationId) { if (finished.value || step.value !== 2) return; stopAudio(); if (id !== mission.value.destination) { feedback.value = "再听一遍，找找小伙伴等在哪里。"; listen(); return; } earned.value = completeDeliveryMission(mission.value.id).earned; finished.value = true; scrollToTop(); }
function scrollToTop() { uni.pageScrollTo({ scrollTop: 0, duration: 0 }); }
function restart() { stopAudio(); step.value = 0; selectedCar.value = null; cargo.value = []; feedback.value = ""; finished.value = false; earned.value = false; uni.pageScrollTo({ scrollTop: 0, duration: 0 }); }
function openNext() { const next = nextMission.value; if (!next) return; stopAudio(); navigate({ url: `/pkg-adventure/delivery/index?mission=${next.id}` }, "redirectTo"); }
</script>
<style scoped lang="scss">
@use "../adventure.scss";
.delivery-scene { margin-top: 24rpx; overflow: hidden; border-radius: 30rpx; }.delivery-scene__caption { display: flex; align-items: center; gap: 8rpx; padding: 8rpx 22rpx 14rpx; }.delivery-scene__caption image { width: 60rpx; height: 58rpx; }.delivery-scene__caption text { font-size: 21rpx; color: #8f806c; }
.delivery-choices { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12rpx; margin-top: 24rpx; }.delivery-choice { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 18rpx 4rpx; border: 2rpx solid #eee5d6; border-radius: 22rpx; background: #fbf7ee; min-width: 0; }.delivery-choice image { display: block; width: 100%; height: 112rpx; }.delivery-choice > text { margin-top: 12rpx; font-size: 21rpx; font-weight: 800; line-height: 1.4; }.delivery-choice:active { background: #efe7d6; border-color: #ceb48d; }
.car-choice image { height: 136rpx; }.car-choice > .car-choice__model { margin-top: 4rpx; font-size: 17rpx; font-weight: 400; color: #9b8c75; }
.cargo-head { display: flex; justify-content: space-between; align-items: center; margin: 24rpx 0 12rpx; font-size: 21rpx; color: #a08769; }.cargo-head button { display: flex; align-items: center; min-height: 60rpx; font-size: 20rpx; color: #9a8061; }.cargo-box { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12rpx; padding: 18rpx; border: 2rpx dashed #d3b792; border-radius: 24rpx; background: #f2e5d1; }.cargo-slot { display: flex; align-items: center; justify-content: center; height: 116rpx; border-radius: 16rpx; background: #fff9ed; }.cargo-slot button { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }.cargo-slot image { width: 90rpx; height: 86rpx; }.cargo-slot button text { position: absolute; top: 5rpx; right: 8rpx; font-size: 24rpx; color: #ae9473; }.cargo-slot__empty { font-size: 42rpx; color: #d2b68d; }.cargo-note { display: block; margin-top: 12rpx; text-align: center; font-size: 18rpx; color: #a4937b; }
.destination-choice { min-height: 204rpx; }.destination-choice__english { font-size: 18rpx !important; font-weight: 400 !important; color: #9b8c75; margin-top: 4rpx !important; }.destination-park { display: flex; justify-content: center; align-items: flex-end; gap: 5rpx; height: 112rpx; width: 100%; padding-bottom: 15rpx; }.destination-park view { width: 34rpx; height: 64rpx; border-radius: 50%; background: #8faa76; border-bottom: 15rpx solid #b79a73; }.destination-park view:nth-child(2) { height: 87rpx; background: #709363; }.destination-garden { display: flex; gap: 2rpx; align-items: center; justify-content: center; height: 112rpx; }.destination-garden text { font-size: 61rpx; color: #d69994; }.destination-garden text + text { color: #d4b363; font-size: 43rpx; }
</style>
