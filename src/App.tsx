import { useMemo, useState } from 'react';
import { carLogos, colorCars, vehicles } from './data/lessons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { HomePage } from './pages/HomePage';
import { LearnCarsPage } from './pages/LearnCarsPage';
import { ColorCarsPage } from './pages/ColorCarsPage';
import { StoryPage } from './pages/StoryPage';
import { ParentPage } from './pages/ParentPage';
import { CountingPage } from './pages/CountingPage';
import { TrafficPage } from './pages/TrafficPage';
import { GaragePage } from './pages/GaragePage';
import { LogoLearningPage } from './pages/LogoLearningPage';

export type Screen = 'home' | 'learn' | 'logos' | 'colors' | 'count' | 'traffic' | 'story' | 'garage' | 'parent';

export type Progress = {
  learnedVehicleIndex: number;
  logoIndex: number;
  logoQuizDone: number;
  storyPageIndex: number;
  colorQuestionsDone: number;
  countQuestionsDone: number;
  trafficTurnsDone: number;
};

const initialProgress: Progress = {
  learnedVehicleIndex: 0,
  logoIndex: 0,
  logoQuizDone: 0,
  storyPageIndex: 0,
  colorQuestionsDone: 0,
  countQuestionsDone: 0,
  trafficTurnsDone: 0,
};

function normalizeProgress(progress: Partial<Progress>): Progress {
  return { ...initialProgress, ...progress };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [stars, setStars] = useLocalStorage('carcar-stars-today', 0);
  const [storedProgress, setProgress] = useLocalStorage<Progress>('carcar-progress', initialProgress);
  const progress = normalizeProgress(storedProgress);

  const records = useMemo(
    () => ({
      learnedVehicle: vehicles[progress.learnedVehicleIndex]?.word ?? vehicles[0].word,
      learnedLogo: carLogos[progress.logoIndex]?.name ?? carLogos[0].name,
      storyPage: progress.storyPageIndex + 1,
      colorQuestionsDone: progress.colorQuestionsDone,
      countQuestionsDone: progress.countQuestionsDone,
      trafficTurnsDone: progress.trafficTurnsDone,
      logoQuizDone: progress.logoQuizDone,
      colorWords: colorCars.map((car) => car.label).join(', '),
      vehicleCount: vehicles.length,
      logoCount: carLogos.length,
    }),
    [progress],
  );

  const addStar = () => setStars((current) => current + 1);
  const goHome = () => setScreen('home');

  if (screen === 'learn') {
    return (
      <LearnCarsPage
        stars={stars}
        savedIndex={progress.learnedVehicleIndex}
        onHome={goHome}
        onProgress={(learnedVehicleIndex) =>
          setProgress((current) => ({ ...normalizeProgress(current), learnedVehicleIndex }))
        }
      />
    );
  }

  if (screen === 'logos') {
    return (
      <LogoLearningPage
        stars={stars}
        savedIndex={progress.logoIndex}
        onHome={goHome}
        onProgress={(logoIndex) => setProgress((current) => ({ ...normalizeProgress(current), logoIndex }))}
        onCorrect={() => {
          addStar();
          setProgress((current) => ({
            ...normalizeProgress(current),
            logoQuizDone: normalizeProgress(current).logoQuizDone + 1,
          }));
        }}
      />
    );
  }

  if (screen === 'colors') {
    return (
      <ColorCarsPage
        stars={stars}
        onHome={goHome}
        onCorrect={() => {
          addStar();
          setProgress((current) => ({
            ...normalizeProgress(current),
            colorQuestionsDone: normalizeProgress(current).colorQuestionsDone + 1,
          }));
        }}
      />
    );
  }

  if (screen === 'count') {
    return (
      <CountingPage
        stars={stars}
        onHome={goHome}
        onCorrect={() => {
          addStar();
          setProgress((current) => ({
            ...normalizeProgress(current),
            countQuestionsDone: normalizeProgress(current).countQuestionsDone + 1,
          }));
        }}
      />
    );
  }

  if (screen === 'traffic') {
    return (
      <TrafficPage
        stars={stars}
        onHome={goHome}
        onCorrect={() => {
          addStar();
          setProgress((current) => ({
            ...normalizeProgress(current),
            trafficTurnsDone: normalizeProgress(current).trafficTurnsDone + 1,
          }));
        }}
      />
    );
  }

  if (screen === 'story') {
    return (
      <StoryPage
        stars={stars}
        savedIndex={progress.storyPageIndex}
        onHome={goHome}
        onProgress={(storyPageIndex) => setProgress((current) => ({ ...normalizeProgress(current), storyPageIndex }))}
      />
    );
  }

  if (screen === 'garage') {
    return <GaragePage stars={stars} onHome={goHome} />;
  }

  if (screen === 'parent') {
    return <ParentPage stars={stars} records={records} onHome={goHome} />;
  }

  return <HomePage stars={stars} onNavigate={setScreen} />;
}