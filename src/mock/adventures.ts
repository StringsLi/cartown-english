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
  yes: { text: "Yes!", audio: `${adventureAudioRoot}/yes.mp3` },
  threeApples: { text: "Three apples, please!", audio: `${adventureAudioRoot}/three-apples.mp3` },
  twoBananas: { text: "Two bananas, please!", audio: `${adventureAudioRoot}/two-bananas.mp3` },
  twoStrawberries: { text: "Two strawberries, please!", audio: `${adventureAudioRoot}/two-strawberries.mp3` },
  dirtyCar: { text: "My car is dirty.", audio: `${adventureAudioRoot}/dirty-car.mp3` },
  letsWash: { text: "Let's wash it!", audio: `${adventureAudioRoot}/lets-wash.mp3` },
  washWash: { text: "Wash, wash, wash!", audio: `${adventureAudioRoot}/wash-wash.mp3` },
  allClean: { text: "All clean!", audio: `${adventureAudioRoot}/all-clean.mp3` },
  youreWelcome: { text: "You're welcome!", audio: `${adventureAudioRoot}/youre-welcome.mp3` },
  howCanHelp: { text: "How can I help?", audio: `${adventureAudioRoot}/how-can-help.mp3` },
  carWontGo: { text: "My car won't go.", audio: `${adventureAudioRoot}/car-wont-go.mp3` },
  checkWheels: { text: "Let's check the wheels.", audio: `${adventureAudioRoot}/check-wheels.mp3` },
  okay: { text: "Okay!", audio: `${adventureAudioRoot}/okay.mp3` },
  allFixed: { text: "All fixed!", audio: `${adventureAudioRoot}/all-fixed.mp3` },
  fillItUp: { text: "Fill it up, please!", audio: `${adventureAudioRoot}/fill-it-up.mp3` },
  allDone: { text: "All done!", audio: `${adventureAudioRoot}/all-done.mp3` },
  niceDay: { text: "Have a nice day!", audio: `${adventureAudioRoot}/nice-day.mp3` },
  goodbye: { text: "Goodbye!", audio: `${adventureAudioRoot}/goodbye.mp3` }
};
export type AdventurePhraseId = keyof typeof adventurePhrases;
export type DestinationId = "park" | "zoo" | "garden";
export type CarId = "red" | "blue" | "yellow";
export type FruitId = "apple" | "banana" | "strawberry";
export type ActivityId = "wash" | "repair" | "fuel";
export type AdventureChapterId = "first-trip" | "car-life";
export const adventureVehicles = {
  "red-hatchback": { label: "红色小轿车", art: `${adventureArtRoot}/red-hatchback.png` },
  "blue-suv": { label: "蓝色越野车", art: `${adventureArtRoot}/blue-suv.png` },
  "yellow-taxi": { label: "黄色出租车", art: `${adventureArtRoot}/yellow-taxi.png` },
  "green-bus": { label: "绿色小巴士", art: `${adventureArtRoot}/green-bus.png` },
  "purple-pickup": { label: "紫色小皮卡", art: `${adventureArtRoot}/purple-pickup.png` },
  "delivery-van": { label: "橙色送货车", art: `${adventureArtRoot}/delivery-van.png` }
};
export type AdventureVehicleId = keyof typeof adventureVehicles;
export const deliveryCarVehicles: Record<CarId, AdventureVehicleId> = { red: "red-hatchback", blue: "blue-suv", yellow: "yellow-taxi" };
export const deliveryCars: Array<{ id: CarId; label: string; model: string; art: string }> = [
  { id: "red", label: "红色小车", model: "小轿车", art: adventureVehicles["red-hatchback"].art },
  { id: "blue", label: "蓝色小车", model: "越野车", art: adventureVehicles["blue-suv"].art },
  { id: "yellow", label: "黄色小车", model: "出租车", art: adventureVehicles["yellow-taxi"].art }
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
  chapter?: AdventureChapterId;
}
export const deliveryMissions: DeliveryMission[] = [
  { id: "picnic", title: "小狗的野餐篮", subtitle: "去公园，送一份水果点心", tint: "#edf2e4", recipientArt: `${adventureArtRoot}/animals-dog.png`, car: "red", fruit: "apple", quantity: 2, destination: "park", carPhrase: "redCar", orderPhrase: "twoApples", destinationPhrase: "toPark", offlineTask: "把两个玩具或积木当成苹果。家长说 “Two apples, please!”，孩子开玩具车送过来，说 “Here you are!”。" },
  { id: "zoo-snack", title: "猴子的午餐快递", subtitle: "去动物园，给新朋友送午餐", tint: "#fff1d6", recipientArt: `${adventureArtRoot}/animals-monkey.png`, car: "blue", fruit: "banana", quantity: 3, destination: "zoo", carPhrase: "blueCar", orderPhrase: "threeBananas", destinationPhrase: "toZoo", offlineTask: "让玩具动物当顾客，用三个积木当香蕉。听家长下订单，再把点心送到玩具动物身边。" },
  { id: "garden-party", title: "小狮子的花园派对", subtitle: "去花园，分享甜甜的小点心", tint: "#fbe9ed", recipientArt: `${adventureArtRoot}/animals-lion.png`, car: "yellow", fruit: "strawberry", quantity: 1, destination: "garden", carPhrase: "yellowCar", orderPhrase: "oneStrawberry", destinationPhrase: "toGarden", offlineTask: "画一颗草莓，放上玩具车。孩子把它送给家长，轮流说 “Here you are!” 和 “Thank you!”。" },
  { id: "elephant-breakfast", chapter: "car-life", title: "大象的森林早餐", subtitle: "给森林朋友，送一份小早餐", tint: "#edf2e4", recipientArt: `${adventureArtRoot}/animals-elephant.png`, car: "yellow", fruit: "apple", quantity: 3, destination: "park", carPhrase: "yellowCar", orderPhrase: "threeApples", destinationPhrase: "toPark", offlineTask: "把三个积木当成苹果，排好后一起数。家长说 “Three apples, please!”，孩子用玩具车把早餐送到纸画的公园。" },
  { id: "penguin-lunch", chapter: "car-life", title: "企鹅的水果便当", subtitle: "开着红车车，送一份小午餐", tint: "#e8f0f5", recipientArt: `${adventureArtRoot}/animals-penguin.png`, car: "red", fruit: "banana", quantity: 2, destination: "zoo", carPhrase: "redCar", orderPhrase: "twoBananas", destinationPhrase: "toZoo", offlineTask: "用两张黄色纸片当香蕉，装进小盒子。家长扮演企鹅下订单，孩子送到后说 “Here you are!”，再交换角色。" },
  { id: "dog-tea-party", chapter: "car-life", title: "小狗的花园茶会", subtitle: "带上小点心，和朋友一起分享", tint: "#f8e9e8", recipientArt: `${adventureArtRoot}/animals-dog.png`, car: "blue", fruit: "strawberry", quantity: 2, destination: "garden", carPhrase: "blueCar", orderPhrase: "twoStrawberries", destinationPhrase: "toGarden", offlineTask: "画两颗草莓，分别送给两个玩具朋友。家长说 “Two strawberries, please!”，孩子摆好点心，和朋友轮流说谢谢。" }
];
export interface RoleplayLine { role: "first" | "second"; phrase: AdventurePhraseId; translation: string; action: string; }
export interface RoleplayScene {
  id: string; title: string; subtitle: string; tint: string; destination: DestinationId;
  roles: { first: string; second: string }; lines: RoleplayLine[]; offlineTask: string;
  chapter?: AdventureChapterId; activity?: ActivityId; vehicle: AdventureVehicleId;
}
export const roleplayScenes: RoleplayScene[] = [
  { id: "taxi-zoo", vehicle: "yellow-taxi", title: "车车去动物园", subtitle: "小司机和乘客的一趟旅行", tint: "#e8f1f7", destination: "zoo", roles: { first: "司机", second: "乘客" }, lines: [
    { role: "first", phrase: "hello", translation: "你好！", action: "挥挥手，和乘客打个招呼。" },
    { role: "second", phrase: "hello", translation: "你好！", action: "挥挥手，回应小司机。" },
    { role: "first", phrase: "whereTo", translation: "去哪里？", action: "假装握住方向盘，问一问。" },
    { role: "second", phrase: "toZoo", translation: "请去动物园。", action: "指一指动物园，告诉司机目的地。" },
    { role: "first", phrase: "letsGo", translation: "出发吧！", action: "转一转想象中的方向盘。" },
    { role: "second", phrase: "thankYou", translation: "谢谢！", action: "到站啦，笑着谢谢司机。" }
  ], offlineTask: "两把椅子当小汽车，家长和孩子轮流当司机、乘客。先去动物园，再用中文商量一个新的目的地。" },
  { id: "fruit-shop", vehicle: "purple-pickup", title: "开一家水果小店", subtitle: "小店员和顾客买卖水果", tint: "#eef2e3", destination: "park", roles: { first: "店员", second: "顾客" }, lines: [
    { role: "first", phrase: "hello", translation: "你好！", action: "摆好水果，笑着欢迎顾客。" },
    { role: "second", phrase: "hello", translation: "你好！", action: "走进小店，和店员打个招呼。" },
    { role: "first", phrase: "whatWould", translation: "你想要什么？", action: "指着水果，问一问。" },
    { role: "second", phrase: "twoApples", translation: "请给我两个苹果！", action: "伸出两根手指，下一个小订单。" },
    { role: "first", phrase: "hereYouAre", translation: "给你！", action: "把两个假装的苹果递给顾客。" },
    { role: "second", phrase: "thankYou", translation: "谢谢！", action: "接过水果，和店员说谢谢。" }
  ], offlineTask: "用积木、纸片或真实水果摆一个小摊。家长和孩子交换角色，练习下订单和递东西。" },
  { id: "bus-trip", vehicle: "green-bus", title: "坐上快乐小巴士", subtitle: "听懂一句，做一个小动作", tint: "#fff0df", destination: "garden", roles: { first: "司机", second: "乘客" }, lines: [
    { role: "first", phrase: "hello", translation: "你好！", action: "挥挥手，欢迎乘客上车。" },
    { role: "second", phrase: "hello", translation: "你好！", action: "找把椅子坐好，回应司机。" },
    { role: "first", phrase: "ready", translation: "准备好了吗？", action: "看看乘客，问一问。" },
    { role: "second", phrase: "yes", translation: "准备好了！", action: "点点头，开心地回应。" },
    { role: "first", phrase: "letsGo", translation: "出发吧！", action: "转转方向盘，假装开巴士。" },
    { role: "second", phrase: "thankYou", translation: "谢谢！", action: "到花园啦，和司机说谢谢。" }
  ], offlineTask: "把椅子排成小巴士，带上玩具乘客。家长问 “Ready?”，孩子点头说 “Yes!” 后一起出发。" },
  { id: "car-wash", vehicle: "red-hatchback", chapter: "car-life", activity: "wash", title: "泡泡洗车屋", subtitle: "小车脏了，洗出亮晶晶", tint: "#e5f1f2", destination: "park", roles: { first: "小司机", second: "洗车员" }, lines: [
    { role: "first", phrase: "dirtyCar", translation: "我的小车脏了。", action: "指一指玩具小车，看看哪里需要清洁。" },
    { role: "second", phrase: "letsWash", translation: "我们来洗洗它吧！", action: "拿起想象中的小海绵，准备洗车。" },
    { role: "first", phrase: "washWash", translation: "洗一洗，洗一洗！", action: "和家长一起轻轻擦擦玩具车。" },
    { role: "second", phrase: "allClean", translation: "全都干净啦！", action: "张开双手，把干净的小车展示出来。" },
    { role: "first", phrase: "thankYou", translation: "谢谢！", action: "笑一笑，谢谢洗车员。" },
    { role: "second", phrase: "youreWelcome", translation: "不客气！", action: "摆摆手，和小司机打个招呼。" }
  ], offlineTask: "用干净的干布擦一辆玩具车，轮流当司机和洗车员。一边擦一边说 “Wash, wash, wash!”，擦好后一起说 “All clean!”。" },
  { id: "repair-shop", vehicle: "blue-suv", chapter: "car-life", activity: "repair", title: "修车小工坊", subtitle: "车车不走了，一起找找原因", tint: "#fff0dc", destination: "park", roles: { first: "修车师傅", second: "小司机" }, lines: [
    { role: "first", phrase: "howCanHelp", translation: "需要我帮什么忙？", action: "看看小司机，伸出手表示愿意帮忙。" },
    { role: "second", phrase: "carWontGo", translation: "我的小车开不动了。", action: "指着玩具车，请师傅一起看看。" },
    { role: "first", phrase: "checkWheels", translation: "我们检查一下车轮吧。", action: "指一指玩具车的轮子，轻轻转一转。" },
    { role: "second", phrase: "okay", translation: "好呀！", action: "点点头，把小车交给师傅。" },
    { role: "first", phrase: "allFixed", translation: "修好啦！", action: "把小车轻轻推过去，假装已经修好了。" },
    { role: "second", phrase: "thankYou", translation: "谢谢！", action: "接过小车，笑着谢谢师傅。" }
  ], offlineTask: "用纸盒当修车店，玩具车停进去。家长和孩子轮流指车轮、推小车，假装修理，不需要拆零件或使用真正的工具。" },
  { id: "fuel-stop", vehicle: "delivery-van", chapter: "car-life", activity: "fuel", title: "小小加油站", subtitle: "补充能量，礼貌道别再出发", tint: "#eaf0e2", destination: "park", roles: { first: "加油员", second: "小司机" }, lines: [
    { role: "first", phrase: "hello", translation: "你好！", action: "挥挥手，欢迎小车停靠。" },
    { role: "second", phrase: "fillItUp", translation: "请加满！", action: "把玩具车停好，礼貌地提出请求。" },
    { role: "first", phrase: "allDone", translation: "加好啦！", action: "假装用纸画的加油枪给玩具车补充能量。" },
    { role: "second", phrase: "thankYou", translation: "谢谢！", action: "点点头，谢谢加油员。" },
    { role: "first", phrase: "niceDay", translation: "祝你今天愉快！", action: "挥挥手，送小司机出发。" },
    { role: "second", phrase: "goodbye", translation: "再见！", action: "挥手告别，推着玩具车继续旅行。" }
  ], offlineTask: "用纸盒搭一个加油站，纸画的加油枪给玩具车假装加油。一个人说 “Fill it up, please!”，另一个人说 “All done!”，最后挥手道别。" }
];
export function getDeliveryMission(id: string) { return deliveryMissions.find(mission => mission.id === id); }
export function getNextDeliveryMission(mission: DeliveryMission, completedIds: string[]) {
  const remaining = deliveryMissions.filter(item => item.id !== mission.id && !completedIds.includes(item.id));
  const chapter = mission.chapter || "first-trip";
  return remaining.find(item => (item.chapter || "first-trip") === chapter) || remaining[0];
}
export function getRoleplayScene(id: string) { return roleplayScenes.find(scene => scene.id === id); }
export function checkDeliveryCargo(mission: DeliveryMission, cargo: FruitId[]): "correct" | "fruit" | "quantity" {
  if (cargo.some(fruit => fruit !== mission.fruit)) return "fruit";
  return cargo.length === mission.quantity ? "correct" : "quantity";
}
