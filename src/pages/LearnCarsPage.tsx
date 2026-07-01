import { useState } from 'react';
import { BigButton } from '../components/BigButton';
import { PageShell } from '../components/PageShell';
import { VehicleArt } from '../components/VehicleArt';
import { vehicles } from '../data/lessons';
import { speakVehicle } from '../utils/speech';

type LearnCarsPageProps = {
  stars: number;
  savedIndex: number;
  onHome: () => void;
  onProgress: (index: number) => void;
};

export function LearnCarsPage({ stars, savedIndex, onHome, onProgress }: LearnCarsPageProps) {
  const [index, setIndex] = useState(() => Math.min(savedIndex, vehicles.length - 1));
  const vehicle = vehicles[index];

  const play = () => speakVehicle(vehicle.word, vehicle.sentence);
  const next = () => {
    setIndex((current) => {
      const nextIndex = (current + 1) % vehicles.length;
      onProgress(nextIndex);
      return nextIndex;
    });
  };

  return (
    <PageShell title="Learn Cars" subtitle="点车车，听英文" stars={stars} onHome={onHome}>
      <section className="flex flex-1 flex-col rounded-[32px] border-4 border-white bg-white/80 p-4 shadow-toy sm:p-6">
        <button
          className="kid-focus flex flex-1 flex-col items-center justify-center rounded-[28px] bg-[#fff7bd] p-4 transition active:scale-[0.99]"
          type="button"
          onClick={play}
        >
          <VehicleArt
            color={vehicle.color}
            accent={vehicle.accent}
            kind={vehicle.kind}
            label={vehicle.word}
            className="max-w-[560px] floaty"
          />
          <div className="mt-3 text-center">
            <h2 className="font-display text-6xl font-black leading-none sm:text-7xl">{vehicle.word}</h2>
            <p className="mt-3 text-2xl font-black text-[#47647d]">{vehicle.zh}</p>
            <p className="mt-2 text-xl font-extrabold text-[#1871a6]">{vehicle.sentence}</p>
          </div>
        </button>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <BigButton tone="blue" onClick={play}>
            Listen
          </BigButton>
          <BigButton tone="green" onClick={next}>
            Next car
          </BigButton>
        </div>
      </section>
    </PageShell>
  );
}
