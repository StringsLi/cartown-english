import { useEffect, useState } from 'react';
import { BigButton } from '../components/BigButton';
import { PageShell } from '../components/PageShell';
import { VehicleArt } from '../components/VehicleArt';
import { trafficPrompts } from '../data/lessons';
import { speakEnglish, speakPraise, speakTryAgain } from '../utils/speech';

type TrafficPageProps = {
  stars: number;
  onHome: () => void;
  onCorrect: () => void;
};

const lightColor = {
  red: 'bg-[#ff5a5f]',
  yellow: 'bg-[#ffd447]',
  green: 'bg-[#43c66b]',
};

export function TrafficPage({ stars, onHome, onCorrect }: TrafficPageProps) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [feedback, setFeedback] = useState('Listen and choose!');
  const prompt = trafficPrompts[promptIndex];

  useEffect(() => {
    const timer = window.setTimeout(() => speakEnglish(prompt.task), 250);
    return () => window.clearTimeout(timer);
  }, [prompt.task]);

  const choose = (action: string) => {
    if (action !== prompt.action) {
      setFeedback('Try again!');
      speakTryAgain();
      return;
    }

    setFeedback('Great job!');
    speakPraise();
    onCorrect();
    window.setTimeout(() => {
      setPromptIndex((current) => (current + 1) % trafficPrompts.length);
      setFeedback('Listen and choose!');
    }, 900);
  };

  return (
    <PageShell title="Traffic Light" subtitle={prompt.task} stars={stars} onHome={onHome}>
      <section className="flex flex-1 flex-col rounded-[32px] border-4 border-white bg-white/80 p-4 shadow-toy sm:p-6">
        <div className="grid flex-1 gap-4 sm:grid-cols-[1fr_1.2fr]">
          <div className="flex items-center justify-center rounded-[30px] bg-[#17324d] p-5 shadow-toy">
            <div className="flex w-32 flex-col gap-5 rounded-[32px] bg-[#28455d] p-5">
              {trafficPrompts.map((item) => (
                <div
                  className={`h-24 w-24 rounded-full border-4 border-white transition ${
                    item.light === prompt.light ? `${lightColor[item.light]} scale-105 shadow-[0_0_30px_rgba(255,255,255,.8)]` : 'bg-[#5d7487] opacity-60'
                  }`}
                  key={item.id}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-[30px] bg-[#fff7bd] p-5 text-center">
            <div className="mx-auto w-64 max-w-full floaty">
              <VehicleArt color="#f95757" accent="#ffd166" kind="car" />
            </div>
            <p className="font-display text-3xl font-black sm:text-5xl">{prompt.task}</p>
            <p className="mt-2 text-xl font-black text-[#47647d]">{prompt.zh} · {feedback}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {trafficPrompts.map((item) => (
            <BigButton
              className="px-2 text-lg sm:text-2xl"
              key={item.id}
              tone={item.light === 'red' ? 'red' : item.light === 'yellow' ? 'yellow' : 'green'}
              onClick={() => choose(item.action)}
            >
              {item.action}
            </BigButton>
          ))}
        </div>
      </section>
    </PageShell>
  );
}