import type { Book, BookLevel, BookPage, BookTheme, Hotspot, ParentTip, VehicleStoryId, Word } from "@/types/book";
import { highResolutionAsset } from "@/services/assetService";

export type ThemeFilterValue = BookTheme | "All";

export const themeLabelMap: Record<BookTheme, string> = {
  Animals: "动物",
  Colors: "颜色",
  Food: "食物",
  Family: "家人",
  Toys: "玩具",
  Actions: "动作",
  Bedtime: "睡前",
  "Daily Life": "生活习惯",
  Vehicles: "交通工具"
};

export const themeFilters: Array<{ label: string; value: ThemeFilterValue }> = [
  { label: "全部", value: "All" },
  { label: "动物", value: "Animals" },
  { label: "颜色", value: "Colors" },
  { label: "食物", value: "Food" },
  { label: "家人", value: "Family" },
  { label: "玩具", value: "Toys" },
  { label: "动作", value: "Actions" },
  { label: "睡前", value: "Bedtime" },
  { label: "生活习惯", value: "Daily Life" },
  { label: "交通", value: "Vehicles" }
];

export const levelLabels: Record<BookLevel, string> = {
  A: "Level A",
  B: "Level B",
  C: "Level C"
};

export const mockBooks: Book[] = ([
  {
    id: "book_cat_001",
    title: "I See a Cat",
    cover: "/static/books/cat/cover.jpg",
    level: "A",
    ageRange: "3-5",
    theme: "Animals",
    description: "A simple story about a little black cat.",
    keywords: ["cat", "black", "jump"],
    targetSentence: "I see a cat.",
    pageCount: 5,
    isPublished: true,
    sort: 1
  },
  {
    id: "book_apple_001",
    title: "Red Apple",
    cover: "/static/books/apple/cover.webp",
    level: "A",
    ageRange: "3-5",
    theme: "Food",
    description: "A warm first reader about a red apple.",
    keywords: ["apple", "red", "eat"],
    targetSentence: "I see an apple.",
    pageCount: 5,
    isPublished: true,
    sort: 2
  },
  {
    id: "book_bear_001",
    title: "My Teddy Bear",
    cover: "/static/books/bear/cover.webp",
    level: "A",
    ageRange: "3-5",
    theme: "Toys",
    description: "A bedtime-friendly story about a soft teddy bear.",
    keywords: ["bear", "soft", "hug"],
    targetSentence: "This is my bear.",
    pageCount: 5,
    isPublished: true,
    sort: 3
  },
  {
    id: "book_mom_001",
    title: "This Is My Mom",
    cover: "/static/books/mom/cover.webp",
    level: "A",
    ageRange: "3-5",
    theme: "Family",
    description: "A gentle family story for parent-child reading.",
    keywords: ["mom", "love", "hug"],
    targetSentence: "This is my mom.",
    pageCount: 5,
    isPublished: true,
    sort: 4
  },
  {
    id: "book_jump_001",
    title: "I Can Jump",
    cover: "/static/books/jump/cover.webp",
    level: "A",
    ageRange: "3-5",
    theme: "Actions",
    description: "A movement story with short action sentences.",
    keywords: ["jump", "run", "clap"],
    targetSentence: "I can jump.",
    pageCount: 5,
    isPublished: true,
    sort: 5
  },
  {
    id: "book_red_car_001",
    title: "Red Car Comes Home",
    cover: "/static/books/red-car/cover.jpg",
    level: "A",
    ageRange: "3-6",
    theme: "Vehicles",
    description: "A careful little red car travels home through town.",
    keywords: ["car", "stop", "rain"],
    targetSentence: "Red Car goes down the road.",
    pageCount: 5,
    isPublished: true,
    sort: 6,
    vehicleStoryId: "red-car"
  },
  {
    id: "book_digger_001",
    title: "Digger Builds a Park",
    cover: "/static/books/digger/cover.jpg",
    level: "A",
    ageRange: "3-6",
    theme: "Vehicles",
    description: "A friendly digger works step by step to build a park.",
    keywords: ["digger", "dig", "park"],
    targetSentence: "Digger digs a big hole.",
    pageCount: 5,
    isPublished: true,
    sort: 7,
    vehicleStoryId: "digger"
  },
  {
    id: "book_fire_truck_001",
    title: "Fire Truck Is Ready",
    cover: "/static/books/fire-truck/cover.jpg",
    level: "A",
    ageRange: "3-6",
    theme: "Vehicles",
    description: "The fire truck answers the bell and helps a little cat.",
    keywords: ["fire truck", "ladder", "safe"],
    targetSentence: "Fire Truck is ready.",
    pageCount: 5,
    isPublished: true,
    sort: 8,
    vehicleStoryId: "fire-truck"
  },
  {
    id: "book_city_bus_001",
    title: "Good Night, City Bus",
    cover: "/static/books/city-bus/cover.jpg",
    level: "A",
    ageRange: "3-6",
    theme: "Vehicles",
    description: "A warm city ride from the busy morning to bedtime.",
    keywords: ["bus", "bridge", "home"],
    targetSentence: "The bus goes over the bridge.",
    pageCount: 5,
    isPublished: true,
    sort: 9,
    vehicleStoryId: "city-bus"
  }
] satisfies Book[]).map((book) => ({ ...book, cover: highResolutionAsset(book.cover) }));

export const mockWords: Word[] = ([
  { id: "word_cat", word: "cat", phonetic: "/kæt/", meaning: "猫", image: "/static/books/cat/word-cat.webp", audio: "/static/audio/words/cat.mp3", level: "A", theme: "Animals" },
  { id: "word_black", word: "black", phonetic: "/blæk/", meaning: "黑色", image: "/static/books/cat/word-black.webp", audio: "/static/audio/words/black.mp3", level: "A", theme: "Colors" },
  { id: "word_jump", word: "jump", phonetic: "/dʒʌmp/", meaning: "跳", image: "/static/books/jump/word-jump.webp", audio: "/static/audio/words/jump.mp3", level: "A", theme: "Actions" },
  { id: "word_apple", word: "apple", phonetic: "/ˈæpl/", meaning: "苹果", image: "/static/books/apple/word-apple.webp", audio: "/static/audio/words/apple.mp3", level: "A", theme: "Food" },
  { id: "word_red", word: "red", phonetic: "/red/", meaning: "红色", image: "/static/books/apple/word-red.webp", audio: "/static/audio/words/red.mp3", level: "A", theme: "Colors" },
  { id: "word_eat", word: "eat", phonetic: "/iːt/", meaning: "吃", image: "/static/books/apple/word-eat.webp", audio: "/static/audio/words/eat.mp3", level: "A", theme: "Actions" },
  { id: "word_bear", word: "bear", phonetic: "/ber/", meaning: "熊", image: "/static/books/bear/word-bear.webp", audio: "/static/audio/words/bear.mp3", level: "A", theme: "Toys" },
  { id: "word_soft", word: "soft", phonetic: "/sɔːft/", meaning: "柔软的", image: "/static/books/bear/word-soft.webp", audio: "/static/audio/words/soft.mp3", level: "A", theme: "Toys" },
  { id: "word_hug", word: "hug", phonetic: "/hʌɡ/", meaning: "拥抱", image: "/static/books/bear/word-hug.webp", audio: "/static/audio/words/hug.mp3", level: "A", theme: "Family" },
  { id: "word_mom", word: "mom", phonetic: "/mɑːm/", meaning: "妈妈", image: "/static/books/mom/word-mom.webp", audio: "/static/audio/words/mom.mp3", level: "A", theme: "Family" },
  { id: "word_love", word: "love", phonetic: "/lʌv/", meaning: "爱", image: "/static/books/mom/word-love.webp", audio: "/static/audio/words/love.mp3", level: "A", theme: "Family" },
  { id: "word_run", word: "run", phonetic: "/rʌn/", meaning: "跑", image: "/static/books/jump/word-run.webp", audio: "/static/audio/words/run.mp3", level: "A", theme: "Actions" },
  { id: "word_clap", word: "clap", phonetic: "/klæp/", meaning: "拍手", image: "/static/books/jump/word-clap.webp", audio: "/static/audio/words/clap.mp3", level: "A", theme: "Actions" },
  { id: "word_car", word: "car", phonetic: "/kɑːr/", meaning: "小汽车", image: "/static/topic-icons/vehicles/car.webp", audio: "/static/audio/words/car.mp3", level: "A", theme: "Vehicles" },
  { id: "word_stop", word: "stop", phonetic: "/stɑːp/", meaning: "停下", image: "/static/topic-icons/vehicles/car.webp", audio: "/static/audio/words/stop.mp3", level: "A", theme: "Vehicles" },
  { id: "word_rain", word: "rain", phonetic: "/reɪn/", meaning: "雨", image: "/static/topic-icons/vehicles/car.webp", audio: "/static/audio/words/rain.mp3", level: "A", theme: "Vehicles" },
  { id: "word_digger", word: "digger", phonetic: "/ˈdɪɡər/", meaning: "挖掘机", image: "/static/topic-icons/vehicles/excavator.webp", audio: "/static/audio/words/digger.mp3", level: "A", theme: "Vehicles" },
  { id: "word_dig", word: "dig", phonetic: "/dɪɡ/", meaning: "挖", image: "/static/topic-icons/vehicles/excavator.webp", audio: "/static/audio/words/dig.mp3", level: "A", theme: "Vehicles" },
  { id: "word_park", word: "park", phonetic: "/pɑːrk/", meaning: "公园", image: "/static/topic-icons/vehicles/excavator.webp", audio: "/static/audio/words/park.mp3", level: "A", theme: "Vehicles" },
  { id: "word_fire_truck", word: "fire truck", phonetic: "/ˈfaɪər trʌk/", meaning: "消防车", image: "/static/topic-icons/vehicles/fire-truck.webp", audio: "/static/audio/words/fire-truck.mp3", level: "A", theme: "Vehicles" },
  { id: "word_ladder", word: "ladder", phonetic: "/ˈlædər/", meaning: "梯子", image: "/static/topic-icons/vehicles/fire-truck.webp", audio: "/static/audio/words/ladder.mp3", level: "A", theme: "Vehicles" },
  { id: "word_safe", word: "safe", phonetic: "/seɪf/", meaning: "安全的", image: "/static/topic-icons/vehicles/fire-truck.webp", audio: "/static/audio/words/safe.mp3", level: "A", theme: "Vehicles" },
  { id: "word_bus", word: "bus", phonetic: "/bʌs/", meaning: "公共汽车", image: "/static/topic-icons/vehicles/bus.webp", audio: "/static/audio/words/bus.mp3", level: "A", theme: "Vehicles" },
  { id: "word_bridge", word: "bridge", phonetic: "/brɪdʒ/", meaning: "桥", image: "/static/topic-icons/vehicles/bus.webp", audio: "/static/audio/words/bridge.mp3", level: "A", theme: "Vehicles" },
  { id: "word_home", word: "home", phonetic: "/hoʊm/", meaning: "家", image: "/static/topic-icons/vehicles/bus.webp", audio: "/static/audio/words/home.mp3", level: "A", theme: "Vehicles" }
] satisfies Word[]).map((word) => ({
  ...word,
  image: highResolutionAsset(word.image),
  audio: highResolutionAsset(word.audio)
}));

const pageContent: Array<{
  bookId: string;
  folder: string;
  sentences: string[];
  sentenceCn: string[];
  hotspotWords: string[];
  vehicleStoryId?: VehicleStoryId;
}> = [
  {
    bookId: "book_cat_001",
    folder: "cat",
    sentences: ["I see a cat.", "The cat is black.", "The cat can jump.", "The cat is happy.", "Bye-bye, little cat."],
    sentenceCn: ["我看见一只猫。", "这只猫是黑色的。", "这只猫会跳。", "这只猫很开心。", "再见，小猫。"],
    hotspotWords: ["cat", "black", "jump", "cat", "cat"]
  },
  {
    bookId: "book_apple_001",
    folder: "apple",
    sentences: ["I see an apple.", "The apple is red.", "I like the apple.", "I eat the apple.", "Yummy, yummy apple."],
    sentenceCn: ["我看见一个苹果。", "这个苹果是红色的。", "我喜欢这个苹果。", "我吃苹果。", "好吃，好吃的苹果。"],
    hotspotWords: ["apple", "red", "apple", "eat", "apple"]
  },
  {
    bookId: "book_bear_001",
    folder: "bear",
    sentences: ["This is my bear.", "My bear is soft.", "I hug my bear.", "My bear is happy.", "Good night, bear."],
    sentenceCn: ["这是我的小熊。", "我的小熊软软的。", "我抱抱我的小熊。", "我的小熊很开心。", "晚安，小熊。"],
    hotspotWords: ["bear", "soft", "hug", "bear", "bear"]
  },
  {
    bookId: "book_mom_001",
    folder: "mom",
    sentences: ["This is my mom.", "Mom smiles at me.", "I hug my mom.", "Mom loves me.", "I love mom."],
    sentenceCn: ["这是我的妈妈。", "妈妈对我微笑。", "我抱抱妈妈。", "妈妈爱我。", "我爱妈妈。"],
    hotspotWords: ["mom", "mom", "hug", "love", "love"]
  },
  {
    bookId: "book_jump_001",
    folder: "jump",
    sentences: ["I can jump.", "I can run.", "I can clap.", "I can turn around.", "Look at me!"],
    sentenceCn: ["我会跳。", "我会跑。", "我会拍手。", "我会转一圈。", "看我！"],
    hotspotWords: ["jump", "run", "clap", "jump", "jump"]
  },
  {
    bookId: "book_red_car_001",
    folder: "vehicles",
    vehicleStoryId: "red-car",
    sentences: [
      "This is Red Car.",
      "Red Car goes down the road.",
      "Red Car stops for the ducks.",
      "Red Car drives slowly in the rain.",
      "Red Car is home. Beep, beep!"
    ],
    sentenceCn: ["这是红色小汽车。", "红色小汽车沿着道路前进。", "红色小汽车停下来让小鸭子通过。", "红色小汽车在雨中慢慢开。", "红色小汽车到家啦。嘀嘀！"],
    hotspotWords: ["car", "car", "stop", "rain", "home"]
  },
  {
    bookId: "book_digger_001",
    folder: "vehicles",
    vehicleStoryId: "digger",
    sentences: [
      "This is Digger.",
      "Digger digs a big hole.",
      "Digger lifts the rocks.",
      "Digger makes the ground flat.",
      "The new park is ready!"
    ],
    sentenceCn: ["这是挖掘机。", "挖掘机挖了一个大洞。", "挖掘机把石头举起来。", "挖掘机把地面铺平。", "新公园建好啦！"],
    hotspotWords: ["digger", "dig", "digger", "digger", "park"]
  },
  {
    bookId: "book_fire_truck_001",
    folder: "vehicles",
    vehicleStoryId: "fire-truck",
    sentences: [
      "Fire Truck is ready.",
      "Ring, ring! The bell rings.",
      "Fire Truck goes down the road.",
      "The ladder goes up.",
      "The little cat is safe."
    ],
    sentenceCn: ["消防车准备好了。", "铃铃！警铃响了。", "消防车沿着道路前进。", "梯子升起来了。", "小猫安全了。"],
    hotspotWords: ["fire truck", "fire truck", "fire truck", "ladder", "safe"]
  },
  {
    bookId: "book_city_bus_001",
    folder: "vehicles",
    vehicleStoryId: "city-bus",
    sentences: [
      "The yellow bus is busy.",
      "The bus stops at the school.",
      "The bus goes over the bridge.",
      "The last child goes home.",
      "Good night, City Bus."
    ],
    sentenceCn: ["黄色巴士忙碌起来了。", "巴士停在学校门口。", "巴士开过小桥。", "最后一个孩子回家了。", "晚安，城市巴士。"],
    hotspotWords: ["bus", "stop", "bridge", "home", "bus"]
  }
];

function findWord(word: string): Word | undefined {
  return mockWords.find((item) => item.word === word);
}

function makeHotspot(word: string, pageIndex: number): Hotspot {
  const wordInfo = findWord(word);

  return {
    word,
    wordCn: wordInfo?.meaning ?? word,
    phonetic: wordInfo?.phonetic ?? "",
    audio: wordInfo?.audio ?? highResolutionAsset(`/static/audio/words/${word}.mp3`),
    x: pageIndex % 2 === 0 ? 52 : 22,
    y: 34 + (pageIndex % 3) * 9,
    width: 28,
    height: 24
  };
}

export const mockBookPages: BookPage[] = pageContent.flatMap((book) =>
  book.sentences.map((sentence, pageOffset) => {
    const pageIndex = pageOffset + 1;
    const pageNumber = String(pageIndex).padStart(2, "0");

    return {
      id: `page_${book.bookId}_${pageNumber}`,
      bookId: book.bookId,
      pageIndex,
      image: highResolutionAsset(`/static/books/${book.vehicleStoryId ?? book.folder}/page${pageNumber}.jpg`),
      sentence,
      sentenceCn: book.sentenceCn[pageOffset],
      audio: highResolutionAsset(`/static/audio/${book.vehicleStoryId ?? book.folder}/page${pageNumber}.mp3`),
      hotspots: [makeHotspot(book.hotspotWords[pageOffset], pageIndex)],
      vehicleStoryId: book.vehicleStoryId
    };
  })
);

export const parentTips: ParentTip[] = [
  {
    bookId: "book_cat_001",
    title: "今日陪读卡：I See a Cat",
    questions: [
      { en: "What do you see?", cn: "你看到了什么？" },
      { en: "What color is the cat?", cn: "小猫是什么颜色？" },
      { en: "Can you jump like a cat?", cn: "你能像小猫一样跳一跳吗？" }
    ],
    activity: "和孩子一起做一个小猫跳跳的动作。"
  },
  {
    bookId: "book_apple_001",
    title: "今日陪读卡：Red Apple",
    questions: [
      { en: "What do you see?", cn: "你看到了什么？" },
      { en: "Is the apple red?", cn: "苹果是红色的吗？" },
      { en: "Do you like apples?", cn: "你喜欢苹果吗？" }
    ],
    activity: "拿一个水果，让孩子说 apple 或 red。"
  },
  {
    bookId: "book_bear_001",
    title: "今日陪读卡：My Teddy Bear",
    questions: [
      { en: "Where is the bear?", cn: "小熊在哪里？" },
      { en: "Is the bear soft?", cn: "小熊软软的吗？" },
      { en: "Can you hug the bear?", cn: "你可以抱抱小熊吗？" }
    ],
    activity: "让孩子抱一抱玩具，说 hug。"
  },
  {
    bookId: "book_mom_001",
    title: "今日陪读卡：This Is My Mom",
    questions: [
      { en: "Who is this?", cn: "这是谁？" },
      { en: "Can you hug mom?", cn: "你可以抱抱妈妈吗？" },
      { en: "Can you say I love mom?", cn: "你能说 I love mom 吗？" }
    ],
    activity: "给妈妈一个拥抱，再说 love。"
  },
  {
    bookId: "book_jump_001",
    title: "今日陪读卡：I Can Jump",
    questions: [
      { en: "Can you jump?", cn: "你会跳吗？" },
      { en: "Can you run?", cn: "你会跑吗？" },
      { en: "Can you clap?", cn: "你会拍手吗？" }
    ],
    activity: "一起做 jump、run、clap 三个动作。"
  },
  {
    bookId: "book_red_car_001",
    title: "今日陪读卡：Red Car Comes Home",
    questions: [
      { en: "What color is the car?", cn: "小汽车是什么颜色？" },
      { en: "Why does Red Car stop?", cn: "红色小汽车为什么停下来？" },
      { en: "Can you say beep, beep?", cn: "你能说 beep, beep 吗？" }
    ],
    activity: "和孩子用玩具小车练习 go、slow、stop 三个动作。"
  },
  {
    bookId: "book_digger_001",
    title: "今日陪读卡：Digger Builds a Park",
    questions: [
      { en: "What does Digger dig?", cn: "挖掘机挖了什么？" },
      { en: "Can Digger lift the rocks?", cn: "挖掘机能举起石头吗？" },
      { en: "Is the park ready?", cn: "公园建好了吗？" }
    ],
    activity: "用积木搭一个小公园，边搭边说 dig、lift、flat。"
  },
  {
    bookId: "book_fire_truck_001",
    title: "今日陪读卡：Fire Truck Is Ready",
    questions: [
      { en: "What do you hear?", cn: "你听到了什么？" },
      { en: "Where is the ladder?", cn: "梯子在哪里？" },
      { en: "Is the little cat safe?", cn: "小猫安全了吗？" }
    ],
    activity: "一起模仿警铃和升梯子的动作，练习 ring、up、safe。"
  },
  {
    bookId: "book_city_bus_001",
    title: "今日陪读卡：Good Night, City Bus",
    questions: [
      { en: "Where does the bus stop?", cn: "巴士停在哪里？" },
      { en: "Does the bus cross a bridge?", cn: "巴士开过小桥了吗？" },
      { en: "Where do the children go?", cn: "孩子们去哪里？" }
    ],
    activity: "用椅子排成一辆小巴士，一起说 stop、bridge、home。"
  }
];
