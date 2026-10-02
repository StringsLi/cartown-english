export type PlaygroundTopicId = "colors" | "animals" | "food" | "actions" | "numbers" | "shapes" | "weather" | "feelings";

export interface PlaygroundItem {
  id: string;
  word: string;
  label: string;
  symbol: string;
  prompt: string;
  audio: string;
  wordAudio: string;
  art: string;
}

export interface PlaygroundTopic {
  id: PlaygroundTopicId;
  title: string;
  english: string;
  symbol: string;
  description: string;
  tint: string;
  accent: string;
  items: PlaygroundItem[];
  parentPhrase: string;
  parentTip: string;
  offlineTask: string;
  storyTitle: string;
  story: string;
  storyTranslation: string;
  storyAudio: string;
  chantTitle: string;
  chantLyrics: string[];
  chantAudio: string;
}

const audioRoot = "/pkg-learning/static/playground-audio";
const artRoot = "/pkg-learning/static/playground/art";

export const playgroundTopics: PlaygroundTopic[] = [
  {
    id: "colors",
    title: "颜色车车",
    english: "Colors",
    symbol: "🎨",
    description: "给小汽车找一找颜色",
    tint: "#fff0e7",
    accent: "#d57451",
    items: [
      { id: "red", word: "red", label: "红色", symbol: "🚗", prompt: "Find something red.", audio: `${audioRoot}/colors-red.mp3`, wordAudio: `${audioRoot}/colors-red-word.mp3`, art: `${artRoot}/red-hatchback.png` },
      { id: "blue", word: "blue", label: "蓝色", symbol: "🚙", prompt: "Find something blue.", audio: `${audioRoot}/colors-blue.mp3`, wordAudio: `${audioRoot}/colors-blue-word.mp3`, art: `${artRoot}/blue-suv.png` },
      { id: "yellow", word: "yellow", label: "黄色", symbol: "🚕", prompt: "Find something yellow.", audio: `${audioRoot}/colors-yellow.mp3`, wordAudio: `${audioRoot}/colors-yellow-word.mp3`, art: `${artRoot}/yellow-taxi.png` },
      { id: "green", word: "green", label: "绿色", symbol: "🚗", prompt: "Find something green.", audio: `${audioRoot}/colors-green.mp3`, wordAudio: `${audioRoot}/colors-green-word.mp3`, art: `${artRoot}/green-bus.png` },
      { id: "purple", word: "purple", label: "紫色", symbol: "🚗", prompt: "Find something purple.", audio: `${audioRoot}/colors-purple.mp3`, wordAudio: `${audioRoot}/colors-purple-word.mp3`, art: `${artRoot}/purple-pickup.png` }
    ],
    parentPhrase: "Find something blue!",
    parentTip: "在家里找一件蓝色的东西，找到后一起说 “I found it!”。",
    offlineTask: "找两件蓝色物品，和家长比一比谁先找到。",
    storyTitle: "车车的彩色旅程",
    story: "I see a blue car. I see a red apple. Colors are everywhere!",
    storyAudio: `${audioRoot}/colors-story.mp3`,
    storyTranslation: "蓝色小车遇见红色苹果。原来，颜色藏在生活的每个角落。",
    chantTitle: "彩色车车歌",
    chantLyrics: ["Red car, blue car, drive around!", "Yellow car, green car, slow down!"],
    chantAudio: `${audioRoot}/colors-chant.mp3`
  },
  {
    id: "animals",
    title: "动物朋友",
    english: "Animals",
    symbol: "🦁",
    description: "和可爱的动物打招呼",
    tint: "#fff4d8",
    accent: "#b88938",
    items: [
      { id: "lion", word: "lion", label: "狮子", symbol: "🦁", prompt: "Find the lion.", audio: `${audioRoot}/animals-lion.mp3`, wordAudio: `${audioRoot}/animals-lion-word.mp3`, art: `${artRoot}/animals-lion.png` },
      { id: "elephant", word: "elephant", label: "大象", symbol: "🐘", prompt: "Find the elephant.", audio: `${audioRoot}/animals-elephant.mp3`, wordAudio: `${audioRoot}/animals-elephant-word.mp3`, art: `${artRoot}/animals-elephant.png` },
      { id: "monkey", word: "monkey", label: "猴子", symbol: "🐒", prompt: "Find the monkey.", audio: `${audioRoot}/animals-monkey.mp3`, wordAudio: `${audioRoot}/animals-monkey-word.mp3`, art: `${artRoot}/animals-monkey.png` },
      { id: "penguin", word: "penguin", label: "企鹅", symbol: "🐧", prompt: "Find the penguin.", audio: `${audioRoot}/animals-penguin.mp3`, wordAudio: `${audioRoot}/animals-penguin-word.mp3`, art: `${artRoot}/animals-penguin.png` },
      { id: "dog", word: "dog", label: "小狗", symbol: "🐶", prompt: "Find the dog.", audio: `${audioRoot}/animals-dog.mp3`, wordAudio: `${audioRoot}/animals-dog-word.mp3`, art: `${artRoot}/animals-dog.png` }
    ],
    parentPhrase: "Where is the lion?",
    parentTip: "拿玩具或绘本里的动物来玩，找到后模仿它的动作或叫声。",
    offlineTask: "找一只玩具动物，用英语说出名字，再学它走路。",
    storyTitle: "和小狮子说你好",
    story: "Here is a lion. The lion can run. Hello, lion!",
    storyAudio: `${audioRoot}/animals-story.mp3`,
    storyTranslation: "小狮子会跑。挥挥手，和这位新朋友说你好吧。",
    chantTitle: "动物朋友歌",
    chantLyrics: ["Lion, lion, wave hello!", "Monkey, penguin, here we go!"],
    chantAudio: `${audioRoot}/animals-chant.mp3`
  },
  {
    id: "food",
    title: "水果野餐",
    english: "Fruit",
    symbol: "🍎",
    description: "装满一篮子美味水果",
    tint: "#edf4e4",
    accent: "#71965a",
    items: [
      { id: "apple", word: "apple", label: "苹果", symbol: "🍎", prompt: "Find the apple.", audio: `${audioRoot}/food-apple.mp3`, wordAudio: `${audioRoot}/food-apple-word.mp3`, art: `${artRoot}/food-apple.png` },
      { id: "banana", word: "banana", label: "香蕉", symbol: "🍌", prompt: "Find the banana.", audio: `${audioRoot}/food-banana.mp3`, wordAudio: `${audioRoot}/food-banana-word.mp3`, art: `${artRoot}/food-banana.png` },
      { id: "grapes", word: "grapes", label: "葡萄", symbol: "🍇", prompt: "Find the grapes.", audio: `${audioRoot}/food-grapes.mp3`, wordAudio: `${audioRoot}/food-grapes-word.mp3`, art: `${artRoot}/food-grapes.png` },
      { id: "watermelon", word: "watermelon", label: "西瓜", symbol: "🍉", prompt: "Find the watermelon.", audio: `${audioRoot}/food-watermelon.mp3`, wordAudio: `${audioRoot}/food-watermelon-word.mp3`, art: `${artRoot}/food-watermelon.png` },
      { id: "strawberry", word: "strawberry", label: "草莓", symbol: "🍓", prompt: "Find the strawberry.", audio: `${audioRoot}/food-strawberry.mp3`, wordAudio: `${audioRoot}/food-strawberry-word.mp3`, art: `${artRoot}/food-strawberry.png` }
    ],
    parentPhrase: "Do you like apples?",
    parentTip: "吃水果时问一问，孩子可以用点头、摇头或 “Yes!” 回答。",
    offlineTask: "点心时间指一指真正的水果，说 “I like apples.”。",
    storyTitle: "苹果点心时间",
    story: "I have an apple. Yum! I like apples.",
    storyAudio: `${audioRoot}/food-story.mp3`,
    storyTranslation: "咬一口苹果，真好吃！你最喜欢哪一种水果？",
    chantTitle: "水果点心歌",
    chantLyrics: ["Apple, banana, yum, yum, yum!", "Grapes and watermelon, here they come!"],
    chantAudio: `${audioRoot}/food-chant.mp3`
  },
  {
    id: "actions",
    title: "动起来吧",
    english: "Actions",
    symbol: "👏",
    description: "听一听，身体动起来",
    tint: "#e8f2f3",
    accent: "#518895",
    items: [
      { id: "clap", word: "clap", label: "拍手", symbol: "👏", prompt: "Clap your hands!", audio: `${audioRoot}/actions-clap.mp3`, wordAudio: `${audioRoot}/actions-clap-word.mp3`, art: `${artRoot}/actions-clap.png` },
      { id: "wave", word: "wave", label: "挥手", symbol: "👋", prompt: "Wave hello!", audio: `${audioRoot}/actions-wave.mp3`, wordAudio: `${audioRoot}/actions-wave-word.mp3`, art: `${artRoot}/actions-wave.png` },
      { id: "jump", word: "jump", label: "跳一跳", symbol: "🦘", prompt: "Jump!", audio: `${audioRoot}/actions-jump.mp3`, wordAudio: `${audioRoot}/actions-jump-word.mp3`, art: `${artRoot}/actions-jump.png` },
      { id: "stomp", word: "stomp", label: "跺脚", symbol: "🦶", prompt: "Stomp your feet!", audio: `${audioRoot}/actions-stomp.mp3`, wordAudio: `${audioRoot}/actions-stomp-word.mp3`, art: `${artRoot}/actions-stomp.png` },
      { id: "dance", word: "dance", label: "跳舞", symbol: "💃", prompt: "Dance with me!", audio: `${audioRoot}/actions-dance.mp3`, wordAudio: `${audioRoot}/actions-dance-word.mp3`, art: `${artRoot}/actions-dance.png` }
    ],
    parentPhrase: "Clap your hands!",
    parentTip: "点完图片，全家一起做动作。听懂并做出来就很好。",
    offlineTask: "家长随机说两个动作，让孩子做给你看，然后交换角色。",
    storyTitle: "小小运动会",
    story: "Clap your hands. Wave hello. Jump up high. Great job!",
    storyAudio: `${audioRoot}/actions-story.mp3`,
    storyTranslation: "拍手、挥手、跳一跳。你已经听懂好多小指令了！",
    chantTitle: "动起来歌",
    chantLyrics: ["Clap and wave, then jump up high!", "Stomp your feet and touch the sky!"],
    chantAudio: `${audioRoot}/actions-chant.mp3`
  },
  {
    id: "numbers",
    title: "数字星球",
    english: "Numbers",
    symbol: "🔢",
    description: "数一数，藏着几个星星",
    tint: "#eeeafa",
    accent: "#8a75b7",
    items: [
      { id: "one", word: "one", label: "一", symbol: "1", prompt: "Find one star.", audio: `${audioRoot}/numbers-one.mp3`, wordAudio: `${audioRoot}/numbers-one-word.mp3`, art: `${artRoot}/numbers-one.png` },
      { id: "two", word: "two", label: "二", symbol: "2", prompt: "Find two stars.", audio: `${audioRoot}/numbers-two.mp3`, wordAudio: `${audioRoot}/numbers-two-word.mp3`, art: `${artRoot}/numbers-two.png` },
      { id: "three", word: "three", label: "三", symbol: "3", prompt: "Find three stars.", audio: `${audioRoot}/numbers-three.mp3`, wordAudio: `${audioRoot}/numbers-three-word.mp3`, art: `${artRoot}/numbers-three.png` },
      { id: "four", word: "four", label: "四", symbol: "4", prompt: "Find four stars.", audio: `${audioRoot}/numbers-four.mp3`, wordAudio: `${audioRoot}/numbers-four-word.mp3`, art: `${artRoot}/numbers-four.png` },
      { id: "five", word: "five", label: "五", symbol: "5", prompt: "Find five stars.", audio: `${audioRoot}/numbers-five.mp3`, wordAudio: `${audioRoot}/numbers-five-word.mp3`, art: `${artRoot}/numbers-five.png` }
    ],
    parentPhrase: "How many stars?",
    parentTip: "先用手指或积木数一数，再慢慢说数字。可以让孩子给你一个、两个或三个积木。",
    offlineTask: "摆出五个积木，家长说一个数字，孩子取出对应数量。",
    storyTitle: "五颗星星",
    story: "One star. Two stars. Three, four, five! I see five stars.",
    storyAudio: `${audioRoot}/numbers-story.mp3`,
    storyTranslation: "一颗、两颗，一直数到五颗。用手指帮忙数一数吧。",
    chantTitle: "星星数数歌",
    chantLyrics: ["One, two, three, stars for me!", "Four and five, shine up high!"],
    chantAudio: `${audioRoot}/numbers-chant.mp3`
  },
  {
    id: "shapes",
    title: "形状工坊",
    english: "Shapes",
    symbol: "🔶",
    description: "用小形状拼出大世界",
    tint: "#fcebdd",
    accent: "#cd9361",
    items: [
      { id: "circle", word: "circle", label: "圆形", symbol: "●", prompt: "Find the circle.", audio: `${audioRoot}/shapes-circle.mp3`, wordAudio: `${audioRoot}/shapes-circle-word.mp3`, art: `${artRoot}/shapes-circle.png` },
      { id: "square", word: "square", label: "正方形", symbol: "■", prompt: "Find the square.", audio: `${audioRoot}/shapes-square.mp3`, wordAudio: `${audioRoot}/shapes-square-word.mp3`, art: `${artRoot}/shapes-square.png` },
      { id: "triangle", word: "triangle", label: "三角形", symbol: "▲", prompt: "Find the triangle.", audio: `${audioRoot}/shapes-triangle.mp3`, wordAudio: `${audioRoot}/shapes-triangle-word.mp3`, art: `${artRoot}/shapes-triangle.png` },
      { id: "star", word: "star", label: "星形", symbol: "★", prompt: "Find the star.", audio: `${audioRoot}/shapes-star.mp3`, wordAudio: `${audioRoot}/shapes-star-word.mp3`, art: `${artRoot}/shapes-star.png` },
      { id: "heart", word: "heart", label: "心形", symbol: "♥", prompt: "Find the heart.", audio: `${audioRoot}/shapes-heart.mp3`, wordAudio: `${audioRoot}/shapes-heart-word.mp3`, art: `${artRoot}/shapes-heart.png` }
    ],
    parentPhrase: "Can you find a circle?",
    parentTip: "从杯口、窗户、积木里找形状。孩子指对了就可以，不急着让他读出来。",
    offlineTask: "在家里找一个圆形和一个正方形，再用手比一个心形。",
    storyTitle: "形状搭搭屋",
    story: "A circle rolls. A square stays. A triangle is a roof. I made a house!",
    storyAudio: `${audioRoot}/shapes-story.mp3`,
    storyTranslation: "圆形会滚，正方形稳稳站住。三角形变成屋顶，一起搭座小房子。",
    chantTitle: "形状搭搭歌",
    chantLyrics: ["Circle, square, shapes everywhere!", "Triangle, star, a heart to share!"],
    chantAudio: `${audioRoot}/shapes-chant.mp3`
  },
  {
    id: "weather",
    title: "天气旅行",
    english: "Weather",
    symbol: "☀️",
    description: "看看今天的天空",
    tint: "#e7f1fc",
    accent: "#5b8fbd",
    items: [
      { id: "sunny", word: "sunny", label: "晴天", symbol: "☀️", prompt: "Find the sunny sky.", audio: `${audioRoot}/weather-sunny.mp3`, wordAudio: `${audioRoot}/weather-sunny-word.mp3`, art: `${artRoot}/weather-sunny.png` },
      { id: "cloudy", word: "cloudy", label: "多云", symbol: "☁️", prompt: "Find the cloudy sky.", audio: `${audioRoot}/weather-cloudy.mp3`, wordAudio: `${audioRoot}/weather-cloudy-word.mp3`, art: `${artRoot}/weather-cloudy.png` },
      { id: "rainy", word: "rainy", label: "雨天", symbol: "🌧️", prompt: "Find the rainy sky.", audio: `${audioRoot}/weather-rainy.mp3`, wordAudio: `${audioRoot}/weather-rainy-word.mp3`, art: `${artRoot}/weather-rainy.png` },
      { id: "snowy", word: "snowy", label: "雪天", symbol: "❄️", prompt: "Find the snowy sky.", audio: `${audioRoot}/weather-snowy.mp3`, wordAudio: `${audioRoot}/weather-snowy-word.mp3`, art: `${artRoot}/weather-snowy.png` },
      { id: "windy", word: "windy", label: "刮风", symbol: "🌬️", prompt: "Find the windy sky.", audio: `${audioRoot}/weather-windy.mp3`, wordAudio: `${audioRoot}/weather-windy-word.mp3`, art: `${artRoot}/weather-windy.png` }
    ],
    parentPhrase: "Is it sunny today?",
    parentTip: "出门前一起看窗外。用一个天气词描述今天的天空，再选适合的衣服。",
    offlineTask: "站在窗前说说天气；晴天比太阳，雨天比撑伞，刮风时吹一口气。",
    storyTitle: "小车的雨天旅行",
    story: "It is sunny. Now it is cloudy. Here comes the rain. Let's take an umbrella!",
    storyAudio: `${audioRoot}/weather-story.mp3`,
    storyTranslation: "太阳躲进云里，下雨天啦。出门前别忘了小雨伞。",
    chantTitle: "天气变变歌",
    chantLyrics: ["Sunny, cloudy, look up high!", "Rainy, snowy, windy sky!"],
    chantAudio: `${audioRoot}/weather-chant.mp3`
  },
  {
    id: "feelings",
    title: "心情花园",
    english: "Feelings",
    symbol: "😊",
    description: "说说今天的小心情",
    tint: "#fbe9ed",
    accent: "#c78195",
    items: [
      { id: "happy", word: "happy", label: "开心", symbol: "😊", prompt: "Find the happy face.", audio: `${audioRoot}/feelings-happy.mp3`, wordAudio: `${audioRoot}/feelings-happy-word.mp3`, art: `${artRoot}/feelings-happy.png` },
      { id: "sad", word: "sad", label: "难过", symbol: "😢", prompt: "Find the sad face.", audio: `${audioRoot}/feelings-sad.mp3`, wordAudio: `${audioRoot}/feelings-sad-word.mp3`, art: `${artRoot}/feelings-sad.png` },
      { id: "sleepy", word: "sleepy", label: "困了", symbol: "😴", prompt: "Find the sleepy face.", audio: `${audioRoot}/feelings-sleepy.mp3`, wordAudio: `${audioRoot}/feelings-sleepy-word.mp3`, art: `${artRoot}/feelings-sleepy.png` },
      { id: "excited", word: "excited", label: "兴奋", symbol: "🤩", prompt: "Find the excited face.", audio: `${audioRoot}/feelings-excited.mp3`, wordAudio: `${audioRoot}/feelings-excited-word.mp3`, art: `${artRoot}/feelings-excited.png` },
      { id: "calm", word: "calm", label: "平静", symbol: "😌", prompt: "Find the calm face.", audio: `${audioRoot}/feelings-calm.mp3`, wordAudio: `${audioRoot}/feelings-calm-word.mp3`, art: `${artRoot}/feelings-calm.png` }
    ],
    parentPhrase: "How do you feel?",
    parentTip: "做一个表情，请孩子选相同的脸。所有心情都可以被说出来，难过时可以抱一抱。",
    offlineTask: "对着镜子做开心、困倦和平静的表情，用一个英语词说说现在的心情。",
    storyTitle: "一个温暖的拥抱",
    story: "I feel sad. Mom gives me a hug. I feel calm. Now I am happy.",
    storyAudio: `${audioRoot}/feelings-story.mp3`,
    storyTranslation: "有点难过时，妈妈给了我一个拥抱。慢慢平静下来，又开心起来了。",
    chantTitle: "心情抱抱歌",
    chantLyrics: ["Happy, sad, how do you feel?", "Take a breath, your feelings are real!"],
    chantAudio: `${audioRoot}/feelings-chant.mp3`
  }
];

export const playgroundWordCount = playgroundTopics.reduce((total, topic) => total + topic.items.length, 0);

export function getPlaygroundTopic(id: string): PlaygroundTopic | undefined {
  return playgroundTopics.find((topic) => topic.id === id);
}

export function getSuggestedPlaygroundTopic(completedIds: string[], day = new Date().getDate()): PlaygroundTopic {
  const start = day % playgroundTopics.length;
  for (let offset = 0; offset < playgroundTopics.length; offset += 1) {
    const topic = playgroundTopics[(start + offset) % playgroundTopics.length];
    if (!completedIds.includes(topic.id)) return topic;
  }
  return playgroundTopics[start];
}
