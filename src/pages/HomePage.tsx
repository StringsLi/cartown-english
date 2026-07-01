import type { ReactNode } from 'react';
import type { Screen } from '../App';
import { BigButton } from '../components/BigButton';
import { LogoBadge } from '../components/LogoBadge';
import { PageShell } from '../components/PageShell';
import { VehicleArt } from '../components/VehicleArt';
import { carLogos } from '../data/lessons';

type HomePageProps = {
  stars: number;
  onNavigate: (screen: Screen) => void;
};

type TownStopConfig = {
  title: string;
  zh: string;
  tag: string;
  tone: 'red' | 'blue' | 'yellow' | 'green' | 'white';
  screen: Screen;
  vehicle: ReactNode;
  bg: string;
};

export function HomePage({ stars, onNavigate }: HomePageProps) {
  const stops: TownStopConfig[] = [
    {
      title: 'Learn Cars',
      zh: '认识车辆',
      tag: 'Words',
      tone: 'red',
      screen: 'learn',
      bg: 'bg-[#ffe3d8]',
      vehicle: <VehicleArt color="#f95757" accent="#ffd166" kind="car" />,
    },
    {
      title: 'Brand Badges',
      zh: '50个车标',
      tag: 'Logos',
      tone: 'blue',
      screen: 'logos',
      bg: 'bg-[#d9fbff]',
      vehicle: <LogoBadge logo={carLogos[6]} />,
    },
    {
      title: 'Color Cars',
      zh: '颜色汽车',
      tag: 'Listen',
      tone: 'blue',
      screen: 'colors',
      bg: 'bg-[#dcfce7]',
      vehicle: <VehicleArt color="#3aa6ff" accent="#ffd447" kind="color-car" />,
    },
    {
      title: 'Count Cars',
      zh: '数字数车',
      tag: '1-5',
      tone: 'yellow',
      screen: 'count',
      bg: 'bg-[#fff7bd]',
      vehicle: <VehicleArt color="#49a6ff" accent="#ffe66d" kind="truck" />,
    },
    {
      title: 'Traffic Light',
      zh: '红绿灯动作',
      tag: 'Go!',
      tone: 'green',
      screen: 'traffic',
      bg: 'bg-[#dcfce7]',
      vehicle: <VehicleArt color="#43c66b" accent="#ffd447" kind="race-car" />,
    },
    {
      title: 'Car Story',
      zh: '小汽车故事',
      tag: 'Books',
      tone: 'green',
      screen: 'story',
      bg: 'bg-[#e0e7ff]',
      vehicle: <VehicleArt color="#ffd447" accent="#f95757" kind="bus" />,
    },
    {
      title: 'Garage',
      zh: '奖励车库',
      tag: 'Stars',
      tone: 'yellow',
      screen: 'garage',
      bg: 'bg-[#ffedd5]',
      vehicle: <VehicleArt color="#ff7a1a" accent="#ffffff" kind="race-car" />,
    },
    {
      title: 'Parent',
      zh: '家长入口',
      tag: 'Report',
      tone: 'white',
      screen: 'parent',
      bg: 'bg-white',
      vehicle: <VehicleArt color="#ffffff" accent="#43c66b" kind="ambulance" />,
    },
  ];

  return (
    <PageShell title="小汽车英语小镇" subtitle="听一听，点一点，开车学英语" stars={stars}>
      <section className="relative flex flex-1 flex-col overflow-hidden rounded-[34px] border-4 border-white bg-[#fffbdf]/90 p-4 shadow-toy sm:p-6">
        <div className="absolute left-8 top-8 h-20 w-28 rounded-full bg-white/75" />
        <div className="absolute right-10 top-14 h-16 w-24 rounded-full bg-white/70" />
        <div className="absolute left-[-12%] right-[-12%] top-[36%] h-24 -rotate-3 bg-[#61798a]">
          <div className="road-dash absolute left-14 right-14 top-10 h-4 rounded-full" />
        </div>
        <div className="absolute bottom-[18%] left-[-10%] right-[-10%] h-24 rotate-3 bg-[#61798a]">
          <div className="road-dash absolute left-14 right-14 top-10 h-4 rounded-full" />
        </div>

        <div className="relative mb-4 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[30px] border-4 border-white bg-[#b8ee92] p-5 shadow-toy">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#1871a6]">Today mission</p>
            <p className="font-display text-4xl font-black leading-tight sm:text-6xl">Pick a station!</p>
            <p className="mt-2 text-lg font-black text-[#47647d]">每次只做一个小任务，答对就收集星星和车贴纸。</p>
          </div>
          <button
            className="kid-focus relative min-h-[190px] overflow-hidden rounded-[30px] border-4 border-white bg-[#fff7bd] p-5 text-left shadow-toy transition active:translate-y-1"
            type="button"
            onClick={() => onNavigate('garage')}
          >
            <p className="font-display text-4xl font-black text-[#17324d]">★ {stars}</p>
            <p className="mt-1 text-lg font-black text-[#47647d]">Today stars · 去车库领奖励</p>
            <div className="absolute -right-8 bottom-0 w-48">
              <VehicleArt color="#8bdeff" accent="#fff7bd" kind="van" />
            </div>
          </button>
        </div>

        <div className="relative grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stops.map((stop, index) => (
            <TownStop
              key={stop.screen}
              index={index + 1}
              title={stop.title}
              zh={stop.zh}
              tag={stop.tag}
              tone={stop.tone}
              bg={stop.bg}
              onClick={() => onNavigate(stop.screen)}
              vehicle={stop.vehicle}
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

type TownStopProps = {
  index: number;
  title: string;
  zh: string;
  tag: string;
  tone: 'red' | 'blue' | 'yellow' | 'green' | 'white';
  bg: string;
  onClick: () => void;
  vehicle: ReactNode;
};

function TownStop({ index, title, zh, tag, tone, bg, onClick, vehicle }: TownStopProps) {
  return (
    <button
      className={`kid-focus pop-in relative min-h-[230px] overflow-hidden rounded-[30px] border-4 border-white p-4 text-left shadow-toy transition active:translate-y-1 ${bg}`}
      type="button"
      onClick={onClick}
    >
      <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-black text-[#1871a6]">
        {tag}
      </div>
      <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17324d] text-xl font-black text-white">
        {index}
      </div>
      <div className="absolute -right-8 bottom-[-12px] w-44 opacity-95 sm:w-48">{vehicle}</div>
      <div className="pt-16">
        <p className="font-display text-3xl font-black leading-none">{title}</p>
        <p className="mt-2 text-lg font-black text-[#47647d]">{zh}</p>
      </div>
      <div className="absolute bottom-4 left-4">
        <BigButton asChild tone={tone} className="min-h-12 px-4 py-2 text-base">
          Go
        </BigButton>
      </div>
    </button>
  );
}