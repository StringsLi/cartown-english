import { useState } from 'react';
import { BigButton } from '../components/BigButton';
import { PageShell } from '../components/PageShell';
import { StoryScene } from '../components/StoryScene';
import { storyBooks } from '../data/lessons';
import { speakEnglish } from '../utils/speech';

type StoryPageProps = {
  stars: number;
  savedIndex: number;
  onHome: () => void;
  onProgress: (index: number) => void;
};

export function StoryPage({ stars, savedIndex, onHome, onProgress }: StoryPageProps) {
  const [bookIndex, setBookIndex] = useState(0);
  const [index, setIndex] = useState(() => Math.min(savedIndex, storyBooks[0].pages.length - 1));
  const [choosing, setChoosing] = useState(true);
  const book = storyBooks[bookIndex];
  const page = book.pages[index];

  const chooseBook = (nextBookIndex: number) => {
    setBookIndex(nextBookIndex);
    setIndex(0);
    onProgress(0);
    setChoosing(false);
    window.setTimeout(() => speakEnglish(storyBooks[nextBookIndex].pages[0].sentence), 200);
  };

  const play = () => speakEnglish(page.sentence);
  const next = () => {
    setIndex((current) => {
      const nextIndex = (current + 1) % book.pages.length;
      onProgress(nextIndex);
      return nextIndex;
    });
  };

  if (choosing) {
    return (
      <PageShell title="Car Story" subtitle="选一本小绘本" stars={stars} onHome={onHome}>
        <section className="grid flex-1 gap-4 rounded-[32px] border-4 border-white bg-white/80 p-4 shadow-toy sm:grid-cols-2 sm:p-6">
          {storyBooks.map((item, nextBookIndex) => (
            <button
              className="kid-focus flex min-h-[300px] flex-col justify-between rounded-[30px] border-4 border-white bg-[#fff7bd] p-4 text-left shadow-toy transition active:translate-y-1"
              key={item.id}
              type="button"
              onClick={() => chooseBook(nextBookIndex)}
            >
              <StoryScene scene={item.pages[0].scene} />
              <div className="mt-4">
                <p className="font-display text-3xl font-black">{item.title}</p>
                <p className="text-xl font-black text-[#47647d]">{item.zh}</p>
              </div>
            </button>
          ))}
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell title={book.title} subtitle={`Page ${page.id} / ${book.pages.length}`} stars={stars} onHome={onHome}>
      <section className="flex flex-1 flex-col rounded-[32px] border-4 border-white bg-white/80 p-4 shadow-toy sm:p-6">
        <StoryScene scene={page.scene} />
        <div className="mt-4 rounded-[28px] bg-[#fff7bd] p-5 text-center">
          <p className="font-display text-3xl font-black leading-tight sm:text-5xl">{page.sentence}</p>
          <p className="mt-3 text-xl font-black text-[#47647d]">{page.zh}</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <BigButton tone="white" onClick={() => setChoosing(true)}>
            Books
          </BigButton>
          <BigButton tone="blue" onClick={play}>
            Listen
          </BigButton>
          <BigButton tone="green" onClick={next}>
            Next
          </BigButton>
        </div>
      </section>
    </PageShell>
  );
}