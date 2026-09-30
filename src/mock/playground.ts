export type PlaygroundTopicId = "colors" | "animals" | "food" | "actions";

export interface PlaygroundItem {
  id: string;
  word: string;
  label: string;
  symbol: string;
  prompt: string;
  audio: string;
  color?: string;
}

export interface PlaygroundTopic {
  id: PlaygroundTopicId;
  title: string;
  english: string;
  symbol: string;
  description: string;
  tint: string;
  items: PlaygroundItem[];
  parentPhrase: string;
  parentTip: string;
  offlineTask: string;
  story: string;
  storyAudio: string;
  chantTitle: string;
  chantLyrics: string[];
  chantAudio: string;
}

const audioRoot = "/pkg-learning/static/playground-audio";

export const playgroundTopics: PlaygroundTopic[] = [
  {
    id: "colors",
    title: "颜色",
    english: "Colors",
    symbol: "🎨",
    description: "看看车车是什么颜色",
    tint: "#fff0db",
    items: [
      { id: "red", word: "red", label: "红色", symbol: "🚗", color: "#df5c51", prompt: "Find something red.", audio: `${audioRoot}/colors-red.wav` },
      { id: "blue", word: "blue", label: "蓝色", symbol: "🚙", color: "#477db8", prompt: "Find something blue.", audio: `${audioRoot}/colors-blue.wav` },
      { id: "yellow", word: "yellow", label: "黄色", symbol: "🚕", color: "#efc548", prompt: "Find something yellow.", audio: `${audioRoot}/colors-yellow.wav` },
      { id: "green", word: "green", label: "绿色", symbol: "🚗", color: "#6ea66e", prompt: "Find something green.", audio: `${audioRoot}/colors-green.wav` }
    ],
    parentPhrase: "Find something blue!",
    parentTip: "在家里找一件蓝色的东西，找到后一起说 “I found it!”。",
    offlineTask: "找两件蓝色物品，和家长比一比谁先找到。",
    story: "I see a blue car. I see a red apple. Colors are everywhere!",
    storyAudio: `${audioRoot}/colors-story.wav`,
    chantTitle: "彩色车车歌",
    chantLyrics: ["Red car, blue car, drive around!", "Yellow car, green car, slow down!"],
    chantAudio: `${audioRoot}/colors-chant.wav`
  },
  {
    id: "animals",
    title: "动物",
    english: "Animals",
    symbol: "🦁",
    description: "找一找动物朋友",
    tint: "#fff3d2",
    items: [
      { id: "lion", word: "lion", label: "狮子", symbol: "🦁", prompt: "Find the lion.", audio: `${audioRoot}/animals-lion.wav` },
      { id: "elephant", word: "elephant", label: "大象", symbol: "🐘", prompt: "Find the elephant.", audio: `${audioRoot}/animals-elephant.wav` },
      { id: "monkey", word: "monkey", label: "猴子", symbol: "🐒", prompt: "Find the monkey.", audio: `${audioRoot}/animals-monkey.wav` },
      { id: "penguin", word: "penguin", label: "企鹅", symbol: "🐧", prompt: "Find the penguin.", audio: `${audioRoot}/animals-penguin.wav` }
    ],
    parentPhrase: "Where is the lion?",
    parentTip: "拿玩具或绘本里的动物来玩，找到后模仿它的动作或叫声。",
    offlineTask: "找一只玩具动物，用英语说出名字，再学它走路。",
    story: "Here is a lion. The lion can run. Hello, lion!",
    storyAudio: `${audioRoot}/animals-story.wav`,
    chantTitle: "动物朋友歌",
    chantLyrics: ["Lion, lion, wave hello!", "Monkey, penguin, here we go!"],
    chantAudio: `${audioRoot}/animals-chant.wav`
  },
  {
    id: "food",
    title: "食物",
    english: "Food",
    symbol: "🍎",
    description: "认识喜欢的水果",
    tint: "#e9f4e4",
    items: [
      { id: "apple", word: "apple", label: "苹果", symbol: "🍎", prompt: "Find the apple.", audio: `${audioRoot}/food-apple.wav` },
      { id: "banana", word: "banana", label: "香蕉", symbol: "🍌", prompt: "Find the banana.", audio: `${audioRoot}/food-banana.wav` },
      { id: "grapes", word: "grapes", label: "葡萄", symbol: "🍇", prompt: "Find the grapes.", audio: `${audioRoot}/food-grapes.wav` },
      { id: "watermelon", word: "watermelon", label: "西瓜", symbol: "🍉", prompt: "Find the watermelon.", audio: `${audioRoot}/food-watermelon.wav` }
    ],
    parentPhrase: "Do you like apples?",
    parentTip: "吃水果时问一问，孩子可以用点头、摇头或 “Yes!” 回答。",
    offlineTask: "点心时间指一指真正的水果，说 “I like apples.”。",
    story: "I have an apple. Yum! I like apples.",
    storyAudio: `${audioRoot}/food-story.wav`,
    chantTitle: "水果点心歌",
    chantLyrics: ["Apple, banana, yum, yum, yum!", "Grapes and watermelon, here they come!"],
    chantAudio: `${audioRoot}/food-chant.wav`
  },
  {
    id: "actions",
    title: "动作",
    english: "Actions",
    symbol: "👏",
    description: "听指令，动起来",
    tint: "#e5f0f4",
    items: [
      { id: "clap", word: "clap", label: "拍手", symbol: "👏", prompt: "Clap your hands!", audio: `${audioRoot}/actions-clap.wav` },
      { id: "wave", word: "wave", label: "挥手", symbol: "👋", prompt: "Wave hello!", audio: `${audioRoot}/actions-wave.wav` },
      { id: "jump", word: "jump", label: "跳一跳", symbol: "🦘", prompt: "Jump!", audio: `${audioRoot}/actions-jump.wav` },
      { id: "stomp", word: "stomp", label: "跺脚", symbol: "🦶", prompt: "Stomp your feet!", audio: `${audioRoot}/actions-stomp.wav` }
    ],
    parentPhrase: "Clap your hands!",
    parentTip: "点完图片，全家一起做动作。听懂并做出来就很好。",
    offlineTask: "家长随机说两个动作，让孩子做给你看，然后交换角色。",
    story: "Clap your hands. Wave hello. Jump up high. Great job!",
    storyAudio: `${audioRoot}/actions-story.wav`,
    chantTitle: "动起来歌",
    chantLyrics: ["Clap and wave, then jump up high!", "Stomp your feet and touch the sky!"],
    chantAudio: `${audioRoot}/actions-chant.wav`
  }
];

export function getPlaygroundTopic(id: string): PlaygroundTopic | undefined {
  return playgroundTopics.find((topic) => topic.id === id);
}
