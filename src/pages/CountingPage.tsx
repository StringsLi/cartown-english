import { useEffect, useState } from 'react';
import { BigButton } from '../components/BigButton';
import { PageShell } from '../components/PageShell';
import { VehicleArt } from '../components/VehicleArt';
import { countingChallenges } from '../data/lessons';
import { speakEnglish, speakPraise, speakTryAgain } from '../utils/speech';

type CountingPageProps = {
  stars: number;
  onHome: () => void;
  onCorrect: () => void;
};

export function CountingPage({ stars, onHome, onCorrect }: CountingPageProps) {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [tapped, setTapped] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('Tap and count!');
  const challenge = countingChallenges[challengeIndex];
  const carSlots = Array.from({ length: challenge.count + 1 }, (_, index) => index);

  useEffect(() => {
    const timer = window.setTimeout(() => speakEnglish(challenge.task), 250);
    return () => window.clearTimeout(timer);
  }, [challenge.task]);

  const tapCar = (slot: number) => {
    if (tapped.includes(slot)) {
      return;
    }

    const nextTapped = [...tapped, slot];
    setTapped(nextTapped);
    speakEnglish(`${nextTapped.length}`);

    if (nextTapped.length === challenge.count) {
      setFeedback('Great job!');
      speakPraise();
      onCorrect();
      window.setTimeout(() => {
        setChallengeIndex((current) => (current + 1) % countingChallenges.length);
        setTapped([]);
        setFeedback('Tap and count!');
      }, 900);
    }

    if (nextTapped.length > challenge.count) {
      setFeedback('Try again!');
      speakTryAgain();
      setTapped([]);
    }
  };

  return (
    <PageShell title="Count Cars" subtitle={challenge.task} stars={stars} onHome={onHome}>
      <section className="flex flex-1 flex-col rounded-[32px] border-4 border-white bg-white/80 p-4 shadow-toy sm:p-6">
        <div className="mb-4 rounded-[28px] bg-[#fff7bd] p-4 text-center">
          <p className="font-display text-4xl font-black sm:text-6xl">{challenge.count}</p>
          <p className="text-2xl font-black text-[#1871a6]">{challenge.task}</p>
          <p className="mt-1 text-lg font-bold text-[#47647d]">{challenge.vehicleZh} · {feedback}</p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
          {carSlots.map((slot) => {
            const selected = tapped.includes(slot);
            return (
              <button
                className={`kid-focus min-h-[145px] rounded-[26px] border-4 p-2 shadow-toy transition active:translate-y-1 ${
                  selected ? 'border-[#43c66b] bg-[#d8ffe4]' : 'border-white bg-[#d9fbff]'
                }`}
                key={slot}
                type="button"
                onClick={() => tapCar(slot)}
              >
                <VehicleArt color={challenge.color} accent={challenge.accent} kind={challenge.kind} label={challenge.vehicleWord} />
              </button>
            );
          })}
        </div>
        <BigButton tone="blue" className="mt-4" onClick={() => speakEnglish(challenge.task)}>
          Hear again
        </BigButton>
      </section>
    </PageShell>
  );
}