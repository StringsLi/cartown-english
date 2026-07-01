import { useEffect, useMemo, useState } from 'react';
import { BigButton } from '../components/BigButton';
import { PageShell } from '../components/PageShell';
import { VehicleArt } from '../components/VehicleArt';
import { colorCars } from '../data/lessons';
import { speakEnglish, speakPraise, speakTryAgain } from '../utils/speech';

type ColorCarsPageProps = {
  stars: number;
  onHome: () => void;
  onCorrect: () => void;
};

export function ColorCarsPage({ stars, onHome, onCorrect }: ColorCarsPageProps) {
  const [targetId, setTargetId] = useState(() => randomColorId());
  const [feedback, setFeedback] = useState('Listen and tap!');
  const target = colorCars.find((car) => car.id === targetId) ?? colorCars[0];

  const visibleCars = useMemo(() => {
    const distractors = colorCars.filter((car) => car.id !== targetId).sort(() => Math.random() - 0.5).slice(0, 2);
    return [target, ...distractors].sort(() => Math.random() - 0.5);
  }, [target, targetId]);

  useEffect(() => {
    const timer = window.setTimeout(() => speakEnglish(target.task), 250);
    return () => window.clearTimeout(timer);
  }, [target.task]);

  const askAgain = () => speakEnglish(target.task);

  const choose = (id: string) => {
    if (id !== targetId) {
      setFeedback('Try again!');
      speakTryAgain();
      return;
    }

    setFeedback('Great job!');
    speakPraise();
    onCorrect();
    window.setTimeout(() => {
      setTargetId(randomColorId(targetId));
      setFeedback('Listen and tap!');
    }, 900);
  };

  return (
    <PageShell title="Color Cars" subtitle={target.task} stars={stars} onHome={onHome}>
      <section className="flex flex-1 flex-col rounded-[32px] border-4 border-white bg-white/80 p-4 shadow-toy sm:p-6">
        <div className="mb-4 rounded-[28px] bg-[#fff7bd] p-4 text-center">
          <p className="font-display text-3xl font-black sm:text-5xl">{target.task}</p>
          <p className="mt-2 text-xl font-black text-[#1871a6]">{feedback}</p>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
          {visibleCars.map((car) => (
            <button
              className="kid-focus flex min-h-[190px] flex-col items-center justify-center rounded-[28px] border-4 border-white bg-[#d9fbff] p-3 shadow-toy transition active:translate-y-1"
              key={car.id}
              type="button"
              onClick={() => choose(car.id)}
            >
              <VehicleArt color={car.hex} accent="#ffd447" kind="color-car" label={`${car.label} car`} />
              <span className="mt-1 rounded-full bg-white px-4 py-2 text-xl font-black">{car.zh}</span>
            </button>
          ))}
        </div>
        <BigButton tone="blue" className="mt-4" onClick={askAgain}>
          Hear again
        </BigButton>
      </section>
    </PageShell>
  );
}

function randomColorId(previous?: string) {
  const candidates = previous ? colorCars.filter((car) => car.id !== previous) : colorCars;
  return candidates[Math.floor(Math.random() * candidates.length)].id;
}