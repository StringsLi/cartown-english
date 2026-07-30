export interface TopicWord {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  sentence: string;
  sentenceCn: string;
  image: string;
  audio: string;
  group: string;
}

export interface TopicGroup {
  id: string;
  title: string;
  subtitle: string;
  words: TopicWord[];
}
