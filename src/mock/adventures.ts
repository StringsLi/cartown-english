export const adventureAudioRoot = "/pkg-adventure/static/audio";
export const adventureArtRoot = "/pkg-adventure/static/art";

export const adventurePhrases = {
  redCar: { text: "Take the red car.", audio: `${adventureAudioRoot}/red-car.mp3` },
  blueCar: { text: "Take the blue car.", audio: `${adventureAudioRoot}/blue-car.mp3` },
  yellowCar: { text: "Take the yellow car.", audio: `${adventureAudioRoot}/yellow-car.mp3` },
  twoApples: { text: "Two apples, please!", audio: `${adventureAudioRoot}/two-apples.mp3` },
  threeBananas: { text: "Three bananas, please!", audio: `${adventureAudioRoot}/three-bananas.mp3` },
  oneStrawberry: { text: "One strawberry, please!", audio: `${adventureAudioRoot}/one-strawberry.mp3` },
  toPark: { text: "To the park!", audio: `${adventureAudioRoot}/to-park.mp3` },
  toZoo: { text: "To the zoo, please.", audio: `${adventureAudioRoot}/to-zoo.mp3` },
  toGarden: { text: "To the garden!", audio: `${adventureAudioRoot}/to-garden.mp3` },
  hello: { text: "Hello!", audio: `${adventureAudioRoot}/hello.mp3` },
  whereTo: { text: "Where to?", audio: `${adventureAudioRoot}/where-to.mp3` },
  letsGo: { text: "Let's go!", audio: `${adventureAudioRoot}/lets-go.mp3` },
  thankYou: { text: "Thank you!", audio: `${adventureAudioRoot}/thank-you.mp3` },
  whatWould: { text: "What would you like?", audio: `${adventureAudioRoot}/what-would.mp3` },
  hereYouAre: { text: "Here you are!", audio: `${adventureAudioRoot}/here-you-are.mp3` },
  ready: { text: "Ready?", audio: `${adventureAudioRoot}/ready.mp3` },
  yes: { text: "Yes!", audio: `${adventureAudioRoot}/yes.mp3` }
};
export type AdventurePhraseId = keyof typeof adventurePhrases;
export type DestinationId = "park" | "zoo" | "garden";
export type CarId = "red" | "blue" | "yellow";
export type FruitId = "apple" | "banana" | "strawberry";
export const deliveryCars: Array<{ id: CarId; label: string; art: string }> = [
  { id: "red", label: "红色小车", art: `${adventureArtRoot}/colors-red.png` },
  { id: "blue", label: "蓝色小车", art: `${adventureArtRoot}/colors-blue.png` },
  { id: "yellow", label: "黄色小车", art: `${adventureArtRoot}/colors-yellow.png` }
];
export const deliveryFruits: Array<{ id: FruitId; label: string; art: string }> = [
  { id: "apple", label: "苹果", art: `${adventureArtRoot}/food-apple.png` },
  { id: "banana", label: "香蕉", art: `${adventureArtRoot}/food-banana.png` },
  { id: "strawberry", label: "草莓", art: `${adventureArtRoot}/food-strawberry.png` }
];
export const deliveryDestinations: Array<{ id: DestinationId; label: string; english: string }> = [
  { id: "park", label: "公园", english: "Park" },
  { id: "zoo", label: "动物园", english: "Zoo" },
  { id: "garden", label: "花园", english: "Garden" }
];
export interface DeliveryMission {
  id: string; title: string; subtitle: string; tint: string; recipientArt: string;
  car: CarId; fruit: FruitId; quantity: number; destination: DestinationId;
  carPhrase: AdventurePhraseId; orderPhrase: AdventurePhraseId; destinationPhrase: AdventurePhraseId;
  offlineTask: string;
}
export const deliveryMissions: DeliveryMission[] = [
  { id: "picnic", title: "小狗的野餐篮", subtitle: "去公园，送一份水果点心", tint: "#edf2e4", recipientArt: `${adventureArtRoot}/animals-dog.png`, car: "red", fruit: "apple", quantity: 2, destination: "park", carPhrase: "redCar", orderPhrase: "twoApples", destinationPhrase: "toPark", offlineTask: "把两个玩具或积木当成苹果。家长说 “Two apples, please!”，孩子开玩具车送过来，说 “Here you are!”。" },
  { id: "zoo-snack", title: "猴子的午餐快递", subtitle: "去动物园，给新朋友送午餐", tint: "#fff1d6", recipientArt: `${adventureArtRoot}/animals-monkey.png`, car: "blue", fruit: "banana", quantity: 3, destination: "zoo", carPhrase: "blueCar", orderPhrase: "threeBananas", destinationPhrase: "toZoo", offlineTask: "让玩具动物当顾客，用三个积木当香蕉。听家长下订单，再把点心送到玩具动物身边。" },
  { id: "garden-party", title: "小狮子的花园派对", subtitle: "去花园，分享甜甜的小点心", tint: "#fbe9ed", recipientArt: `${adventureArtRoot}/animals-lion.png`, car: "yellow", fruit: "strawberry", quantity: 1, destination: "garden", carPhrase: "yellowCar", orderPhrase: "oneStrawberry", destinationPhrase: "toGarden", offlineTask: "画一颗草莓，放上玩具车。孩子把它送给家长，轮流说 “Here you are!” 和 “Thank you!”。" }
];
export interface RoleplayLine { role: "first" | "second"; phrase: AdventurePhraseId; translation: string; action: string; }
export interface RoleplayScene {
  id: string; title: string; subtitle: string; tint: string; destination: DestinationId;
  roles: { first: string; second: string }; lines: RoleplayLine[]; offlineTask: string;
}
export const roleplayScenes: RoleplayScene[] = [
  { id: "taxi-zoo", title: "车车去动物园", subtitle: "小司机和乘客的一趟旅行", tint: "#e8f1f7", destination: "zoo", roles: { first: "司机", second: "乘客" }, lines: [
    { role: "first", phrase: "hello", translation: "你好！", action: "挥挥手，和乘客打个招呼。" },
    { role: "second", phrase: "hello", translation: "你好！", action: "挥挥手，回应小司机。" },
    { role: "first", phrase: "whereTo", translation: "去哪里？", action: "假装握住方向盘，问一问。" },
    { role: "second", phrase: "toZoo", translation: "请去动物园。", action: "指一指动物园，告诉司机目的地。" },
    { role: "first", phrase: "letsGo", translation: "出发吧！", action: "转一转想象中的方向盘。" },
    { role: "second", phrase: "thankYou", translation: "谢谢！", action: "到站啦，笑着谢谢司机。" }
  ], offlineTask: "两把椅子当小汽车，家长和孩子轮流当司机、乘客。先去动物园，再用中文商量一个新的目的地。" },
  { id: "fruit-shop", title: "开一家水果小店", subtitle: "小店员和顾客买卖水果", tint: "#eef2e3", destination: "park", roles: { first: "店员", second: "顾客" }, lines: [
    { role: "first", phrase: "hello", translation: "你好！", action: "摆好水果，笑着欢迎顾客。" },
    { role: "second", phrase: "hello", translation: "你好！", action: "走进小店，和店员打个招呼。" },
    { role: "first", phrase: "whatWould", translation: "你想要什么？", action: "指着水果，问一问。" },
    { role: "second", phrase: "twoApples", translation: "请给我两个苹果！", action: "伸出两根手指，下一个小订单。" },
    { role: "first", phrase: "hereYouAre", translation: "给你！", action: "把两个假装的苹果递给顾客。" },
    { role: "second", phrase: "thankYou", translation: "谢谢！", action: "接过水果，和店员说谢谢。" }
  ], offlineTask: "用积木、纸片或真实水果摆一个小摊。家长和孩子交换角色，练习下订单和递东西。" },
  { id: "bus-trip", title: "坐上快乐小巴士", subtitle: "听懂一句，做一个小动作", tint: "#fff0df", destination: "garden", roles: { first: "司机", second: "乘客" }, lines: [
    { role: "first", phrase: "hello", translation: "你好！", action: "挥挥手，欢迎乘客上车。" },
    { role: "second", phrase: "hello", translation: "你好！", action: "找把椅子坐好，回应司机。" },
    { role: "first", phrase: "ready", translation: "准备好了吗？", action: "看看乘客，问一问。" },
    { role: "second", phrase: "yes", translation: "准备好了！", action: "点点头，开心地回应。" },
    { role: "first", phrase: "letsGo", translation: "出发吧！", action: "转转方向盘，假装开巴士。" },
    { role: "second", phrase: "thankYou", translation: "谢谢！", action: "到花园啦，和司机说谢谢。" }
  ], offlineTask: "把椅子排成小巴士，带上玩具乘客。家长问 “Ready?”，孩子点头说 “Yes!” 后一起出发。" }
];
export function getDeliveryMission(id: string) { return deliveryMissions.find(mission => mission.id === id); }
export function getRoleplayScene(id: string) { return roleplayScenes.find(scene => scene.id === id); }
export function checkDeliveryCargo(mission: DeliveryMission, cargo: FruitId[]): "correct" | "fruit" | "quantity" {
  if (cargo.some(fruit => fruit !== mission.fruit)) return "fruit";
  return cargo.length === mission.quantity ? "correct" : "quantity";
}
