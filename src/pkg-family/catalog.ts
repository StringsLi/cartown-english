import { playgroundTopics } from "@/mock/playground";

export const listeningTracks = playgroundTopics.flatMap(topic => [
  { id: `story-${topic.id}`, kind: "story", title: topic.storyTitle, english: topic.story, translation: topic.storyTranslation, audio: topic.storyAudio, symbol: "☾" },
  { id: `chant-${topic.id}`, kind: "chant", title: topic.chantTitle, english: topic.chantLyrics.join("\n"), translation: "和孩子一起听节奏、做动作。", audio: topic.chantAudio, symbol: "♫" }
]);
export type ListeningTrack = typeof listeningTracks[number];

export interface RoutineStep { id: string; english: string; chinese: string; action: string; }
export interface LifeRoutine { id: string; title: string; english: string; symbol: string; time: string; tint: string; tip: string; steps: RoutineStep[]; }
export const lifeRoutines: LifeRoutine[] = [
  { id: "brush", title: "刷牙小队", english: "Brush together", symbol: "🪥", time: "早晚", tint: "#e4efeb", tip: "先听一句，再放下手机一起做。刷牙时用动作回应，刷完再开口。", steps: [
    { id: "brush-ready", english: "Pick up your toothbrush.", chinese: "拿起你的小牙刷。", action: "家长和孩子各拿起自己的牙刷，互相指一指。" },
    { id: "brush-teeth", english: "Let's brush our teeth.", chinese: "我们一起刷牙吧。", action: "家长示范刷牙动作，陪孩子按平时的习惯刷牙。" },
    { id: "brush-smile", english: "Show me your smile!", chinese: "让我看看你的笑脸！", action: "刷完后照照镜子，互相送一个大大的笑脸。" }
  ] },
  { id: "dress", title: "穿衣出发", english: "Ready to go", symbol: "👕", time: "早晨", tint: "#f4e9d8", tip: "一次只拿一件衣物，给孩子一点自己尝试的时间。", steps: [
    { id: "dress-shirt", english: "Put on your shirt.", chinese: "穿上你的上衣。", action: "找一找上衣，让孩子自己尝试穿，家长按需帮忙。" },
    { id: "dress-shoes", english: "Put on your shoes.", chinese: "穿上你的鞋子。", action: "把鞋放在面前，一起找到自己的那一双。" },
    { id: "dress-go", english: "Are you ready? Let's go!", chinese: "准备好了吗？我们出发吧！", action: "互相挥挥手，孩子可以用点头或 Ready! 回应。" }
  ] },
  { id: "meal", title: "一起吃饭", english: "At the table", symbol: "🥣", time: "用餐", tint: "#f4e4dc", tip: "先听再吃，嘴里有食物时不用跟读；用点头和指认回应也很好。", steps: [
    { id: "meal-sit", english: "Let's sit down.", chinese: "我们坐下来吧。", action: "家长和孩子一起找到自己的座位。" },
    { id: "meal-spoon", english: "Where is your spoon?", chinese: "你的小勺子在哪里？", action: "请孩子指一指或拿起自己的勺子。" },
    { id: "meal-thanks", english: "Thank you for the food.", chinese: "谢谢准备了食物。", action: "开饭前向准备饭菜的人说声谢谢。" }
  ] },
  { id: "tidy", title: "玩具回家", english: "Tidy-up time", symbol: "🧸", time: "玩耍后", tint: "#eee7f3", tip: "一次收一小类玩具，家长也一起动手。完成是陪玩记录，不是能力评分。", steps: [
    { id: "tidy-car", english: "Pick up the toy car.", chinese: "捡起玩具小车。", action: "一起找到一辆玩具小车，拿在手里。" },
    { id: "tidy-box", english: "Put it in the box.", chinese: "把它放进盒子里。", action: "指一指收纳盒，请孩子送小车回家。" },
    { id: "tidy-done", english: "We did it! Thank you!", chinese: "我们做到了！谢谢你！", action: "看看收好的玩具，和孩子轻轻击掌。" }
  ] },
  { id: "wash", title: "洗手泡泡", english: "Wash our hands", symbol: "🫧", time: "饭前／回家", tint: "#e2edf3", tip: "先在干燥处点读，再一起到洗手台。手机留在远离水的位置。", steps: [
    { id: "wash-hands", english: "Let's wash our hands.", chinese: "我们一起洗手吧。", action: "一起走到洗手台，准备按平时的步骤洗手。" },
    { id: "wash-soap", english: "Rub your hands with soap.", chinese: "用肥皂搓搓手。", action: "家长示范手心、手背和指缝的动作，孩子跟着做。" },
    { id: "wash-dry", english: "Dry your hands.", chinese: "擦干你的小手。", action: "冲洗后找到自己的毛巾，擦干双手。" }
  ] },
  { id: "bed", title: "晚安时间", english: "Good night", symbol: "🌙", time: "睡前", tint: "#e8e9f2", tip: "轻声说一句就好，不要求孩子重复。结束后放下手机。", steps: [
    { id: "bed-book", english: "Let's read a book.", chinese: "我们一起读本书吧。", action: "让孩子选一本喜欢的纸质绘本，一起翻一翻。" },
    { id: "bed-hug", english: "Would you like a hug?", chinese: "你想要一个拥抱吗？", action: "问问孩子，愿意就抱一抱，也可以选择挥挥手。" },
    { id: "bed-night", english: "Good night. Sweet dreams.", chinese: "晚安，做个好梦。", action: "互道晚安，把手机放到一边，结束今天的小活动。" }
  ] }
];
export const routineAudio = (id: string) => `/pkg-family/static/audio/${id}.wav`;
