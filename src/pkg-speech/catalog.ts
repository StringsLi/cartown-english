import topics from './content.json';
import audioManifest from './audio-manifest.json';
export type SpeechLanguage = 'zh' | 'en';
export const speechLessons = topics.flatMap((topic, index) => (['zh', 'en'] as const).map(language => ({
  id: `${language}-${topic.key}`, language, day: index + 1,
  title: language === 'zh' ? topic.title : topic.englishTitle, subtitle: topic.title,
  symbol: topic.symbol, skill: topic.skill, cues: topic.cues, question: topic.question,
  paragraphs: topic[language], meanings: language === 'en' ? topic.meanings : [],
  audio: `/${language === 'zh' ? 'pkg-speech' : 'pkg-voice'}/static/audio/${topic.key}.mp3`
})));
export type SpeechLesson = typeof speechLessons[number];
export const getSpeechLesson = (id: string) => speechLessons.find(lesson => lesson.id === id);
export function speechAudioSource(lesson: SpeechLesson): string {
  let source = lesson.audio;
  // #ifdef H5
  const version = audioManifest.find(item => item.id === lesson.id)?.audioHash;
  if (version) source += '?v=' + version.slice(0, 12);
  // #endif
  return source;
}
