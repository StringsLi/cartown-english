import { useEffect, useMemo, useState } from 'react';
import { BigButton } from '../components/BigButton';
import { LogoBadge } from '../components/LogoBadge';
import { PageShell } from '../components/PageShell';
import { carLogos } from '../data/lessons';
import { speakEnglish, speakPraise, speakTryAgain } from '../utils/speech';

type LogoLearningPageProps = {
  stars: number;
  savedIndex: number;
  onHome: () => void;
  onProgress: (index: number) => void;
  onCorrect: () => void;
};

export function LogoLearningPage({ stars, savedIndex, onHome, onProgress, onCorrect }: LogoLearningPageProps) {
  const [mode, setMode] = useState<'learn' | 'play'>('learn');
  const [index, setIndex] = useState(() => Math.min(savedIndex, carLogos.length - 1));
  const [targetId, setTargetId] = useState(() => carLogos[0].id);
  const [feedback, setFeedback] = useState('Listen and tap!');
  const logo = carLogos[index];
  const target = carLogos.find((item) => item.id === targetId) ?? carLogos[0];

  const quizOptions = useMemo(() => {
    const distractors = carLogos.filter((item) => item.id !== targetId).sort(() => Math.random() - 0.5).slice(0, 2);
    return [target, ...distractors].sort(() => Math.random() - 0.5);
  }, [target, targetId]);

  useEffect(() => {
    if (mode === 'play') {
      const timer = window.setTimeout(() => speakEnglish(`Tap ${target.name}.`), 250);
      return () => window.clearTimeout(timer);
    }
  }, [mode, target.name]);

  const speakLogo = () => speakEnglish(`${logo.name}. ${logo.cue}`);

  const nextLogo = () => {
    setIndex((current) => {
      const nextIndex = (current + 1) % carLogos.length;
      onProgress(nextIndex);
      return nextIndex;
    });
  };

  const previousLogo = () => {
    setIndex((current) => {
      const nextIndex = (current - 1 + carLogos.length) % carLogos.length;
      onProgress(nextIndex);
      return nextIndex;
    });
  };

  const chooseQuiz = (id: string) => {
    if (id !== targetId) {
      setFeedback('Try again!');
      speakTryAgain();
      return;
    }

    setFeedback('Great job!');
    speakPraise();
    onCorrect();
    window.setTimeout(() => {
      setTargetId(randomLogoId(targetId));
      setFeedback('Listen and tap!');
    }, 900);
  };

  return (
    <PageShell title="Brand Badges" subtitle="真实品牌车标听点认知" stars={stars} onHome={onHome}>
      <section className="flex flex-1 flex-col rounded-[32px] border-4 border-white bg-white/82 p-4 shadow-toy sm:p-6">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <BigButton tone={mode === 'learn' ? 'yellow' : 'white'} onClick={() => setMode('learn')}>
            Learn
          </BigButton>
          <BigButton
            tone={mode === 'play' ? 'green' : 'white'}
            onClick={() => {
              setMode('play');
              setTargetId(randomLogoId());
              setFeedback('Listen and tap!');
            }}
          >
            Play
          </BigButton>
        </div>

        {mode === 'learn' ? (
          <div className="grid flex-1 gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <button
              className="kid-focus flex min-h-[430px] flex-col items-center justify-center rounded-[34px] border-4 border-white bg-gradient-to-br from-[#fff7bd] via-white to-[#d9fbff] p-5 text-center shadow-toy transition active:translate-y-1"
              type="button"
              onClick={speakLogo}
            >
              <div className="w-72 max-w-full sm:w-96">
                <LogoBadge logo={logo} />
              </div>
              <p className="mt-3 font-display text-5xl font-black leading-none sm:text-7xl">{logo.name}</p>
              <p className="mt-2 text-3xl font-black text-[#47647d]">{logo.zh}</p>
              <p className="mt-2 rounded-full bg-white px-4 py-2 text-base font-black text-[#1871a6]">{logo.country} · {index + 1} / {carLogos.length}</p>
            </button>
            <div className="flex flex-col gap-3 rounded-[34px] border-4 border-white bg-[#d9fbff] p-4 shadow-toy">
              <p className="font-display text-3xl font-black">Logo Wall</p>
              <p className="text-base font-bold text-[#47647d]">点真实车标可跳转学习</p>
              <div className="grid max-h-[430px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 lg:grid-cols-3">
                {carLogos.map((item, itemIndex) => (
                  <button
                    className={`kid-focus rounded-2xl border-4 p-2 transition active:scale-95 ${
                      itemIndex === index ? 'border-[#ffcf33] bg-white' : 'border-white bg-white/70'
                    }`}
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIndex(itemIndex);
                      onProgress(itemIndex);
                      speakEnglish(item.name);
                    }}
                  >
                    <LogoBadge logo={item} size="sm" />
                    <p className="truncate text-xs font-black">{item.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
              <BigButton tone="white" onClick={previousLogo}>Back</BigButton>
              <BigButton tone="blue" onClick={speakLogo}>Listen</BigButton>
              <BigButton tone="green" onClick={nextLogo}>Next</BigButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="mb-4 rounded-[30px] bg-[#fff7bd] p-5 text-center shadow-toy">
              <p className="font-display text-4xl font-black sm:text-6xl">Tap {target.name}</p>
              <p className="mt-2 text-xl font-black text-[#1871a6]">{feedback}</p>
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-3">
              {quizOptions.map((item) => (
                <button
                  className="kid-focus flex min-h-[260px] flex-col items-center justify-center rounded-[30px] border-4 border-white bg-gradient-to-br from-white to-[#d9fbff] p-4 shadow-toy transition active:translate-y-1"
                  key={item.id}
                  type="button"
                  onClick={() => chooseQuiz(item.id)}
                >
                  <LogoBadge logo={item} />
                  <p className="mt-2 font-display text-3xl font-black">{item.name}</p>
                  <p className="text-xl font-black text-[#47647d]">{item.zh}</p>
                </button>
              ))}
            </div>
            <BigButton tone="blue" className="mt-4" onClick={() => speakEnglish(`Tap ${target.name}.`)}>
              Hear again
            </BigButton>
          </div>
        )}
      </section>
    </PageShell>
  );
}

function randomLogoId(previous?: string) {
  const candidates = previous ? carLogos.filter((item) => item.id !== previous) : carLogos;
  return candidates[Math.floor(Math.random() * candidates.length)].id;
}