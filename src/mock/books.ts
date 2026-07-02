import type { Book, BookLevel, BookPage, BookTheme, Hotspot, ParentTip, Word } from "@/types/book";

export type ThemeFilterValue = BookTheme | "All";

export const themeLabelMap: Record<BookTheme, string> = {
  Animals: "动物",
  Colors: "颜色",
  Food: "食物",
  Family: "家人",
  Toys: "玩具",
  Actions: "动作",
  Bedtime: "睡前",
  "Daily Life": "生活习惯"
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
  { label: "生活习惯", value: "Daily Life" }
];

export const levelLabels: Record<BookLevel, string> = {
  A: "Level A",
  B: "Level B",
  C: "Level C"
};

export const mockBooks: Book[] = [
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
    cover: "/static/books/apple/cover.jpg",
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
    cover: "/static/books/bear/cover.jpg",
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
    cover: "/static/books/mom/cover.jpg",
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
    cover: "/static/books/jump/cover.jpg",
    level: "A",
    ageRange: "3-5",
    theme: "Actions",
    description: "A movement story with short action sentences.",
    keywords: ["jump", "run", "clap"],
    targetSentence: "I can jump.",
    pageCount: 5,
    isPublished: true,
    sort: 5
  }
];

export const mockWords: Word[] = [
  { id: "word_cat", word: "cat", phonetic: "/kæt/", meaning: "猫", image: "/static/books/cat/word-cat.jpg", audio: "/static/audio/words/cat.wav", level: "A", theme: "Animals" },
  { id: "word_black", word: "black", phonetic: "/blæk/", meaning: "黑色", image: "/static/books/cat/word-black.jpg", audio: "/static/audio/words/black.wav", level: "A", theme: "Colors" },
  { id: "word_jump", word: "jump", phonetic: "/dʒʌmp/", meaning: "跳", image: "/static/books/jump/word-jump.jpg", audio: "/static/audio/words/jump.wav", level: "A", theme: "Actions" },
  { id: "word_apple", word: "apple", phonetic: "/ˈæpl/", meaning: "苹果", image: "/static/books/apple/word-apple.jpg", audio: "/static/audio/words/apple.wav", level: "A", theme: "Food" },
  { id: "word_red", word: "red", phonetic: "/red/", meaning: "红色", image: "/static/books/apple/word-red.jpg", audio: "/static/audio/words/red.wav", level: "A", theme: "Colors" },
  { id: "word_eat", word: "eat", phonetic: "/iːt/", meaning: "吃", image: "/static/books/apple/word-eat.jpg", audio: "/static/audio/words/eat.wav", level: "A", theme: "Actions" },
  { id: "word_bear", word: "bear", phonetic: "/ber/", meaning: "熊", image: "/static/books/bear/word-bear.jpg", audio: "/static/audio/words/bear.wav", level: "A", theme: "Toys" },
  { id: "word_soft", word: "soft", phonetic: "/sɔːft/", meaning: "柔软的", image: "/static/books/bear/word-soft.jpg", audio: "/static/audio/words/soft.wav", level: "A", theme: "Toys" },
  { id: "word_hug", word: "hug", phonetic: "/hʌɡ/", meaning: "拥抱", image: "/static/books/bear/word-hug.jpg", audio: "/static/audio/words/hug.wav", level: "A", theme: "Family" },
  { id: "word_mom", word: "mom", phonetic: "/mɑːm/", meaning: "妈妈", image: "/static/books/mom/word-mom.jpg", audio: "/static/audio/words/mom.wav", level: "A", theme: "Family" },
  { id: "word_love", word: "love", phonetic: "/lʌv/", meaning: "爱", image: "/static/books/mom/word-love.jpg", audio: "/static/audio/words/love.wav", level: "A", theme: "Family" },
  { id: "word_run", word: "run", phonetic: "/rʌn/", meaning: "跑", image: "/static/books/jump/word-run.jpg", audio: "/static/audio/words/run.wav", level: "A", theme: "Actions" },
  { id: "word_clap", word: "clap", phonetic: "/klæp/", meaning: "拍手", image: "/static/books/jump/word-clap.jpg", audio: "/static/audio/words/clap.wav", level: "A", theme: "Actions" }
];

const pageContent: Array<{
  bookId: string;
  folder: string;
  sentences: string[];
  sentenceCn: string[];
  hotspotWords: string[];
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
    audio: wordInfo?.audio ?? `/static/audio/words/${word}.wav`,
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
      image: `/static/books/${book.folder}/page${pageNumber}.jpg`,
      sentence,
      sentenceCn: book.sentenceCn[pageOffset],
      audio: `/static/audio/${book.folder}/page${pageNumber}.wav`,
      hotspots: [makeHotspot(book.hotspotWords[pageOffset], pageIndex)]
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
  }
];
