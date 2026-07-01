import type { StoryPage } from '../data/lessons';
import { VehicleArt } from './VehicleArt';

type StorySceneProps = {
  scene: StoryPage['scene'];
};

export function StoryScene({ scene }: StorySceneProps) {
  const showDog = scene === 'dog' || scene === 'stop';
  const fastMarks = scene === 'fast';
  const rainy = scene === 'rain';
  const bridge = scene === 'bridge';
  const wash = scene === 'wash';
  const sleep = scene === 'sleep';
  const carOffset = scene === 'dog' ? '-translate-x-4' : scene === 'cheer' ? 'translate-x-6' : '';
  const vehicleKind = rainy || bridge || wash || sleep ? 'bus' : 'car';
  const vehicleColor = vehicleKind === 'bus' ? '#ffd447' : '#f95757';

  return (
    <div className={`relative min-h-[300px] overflow-hidden rounded-[28px] border-4 border-white p-4 shadow-toy ${sleep ? 'bg-[#233a69]' : 'bg-[#d9fbff]'}`}>
      <div className="absolute left-5 top-6 h-16 w-20 rounded-full bg-white/90" />
      <div className="absolute left-14 top-3 h-14 w-24 rounded-full bg-white/80" />
      <div className="absolute right-8 top-8 h-14 w-24 rounded-full bg-white/80" />
      {sleep ? <div className="absolute right-10 top-10 text-5xl text-[#fff7bd]">☾</div> : null}
      <div className={`absolute bottom-0 left-0 right-0 h-28 ${sleep ? 'bg-[#31577a]' : 'bg-[#75cf69]'}`} />
      <div className="absolute bottom-12 left-[-8%] h-20 w-[116%] rounded-full bg-[#61798a]">
        <div className="road-dash absolute left-8 right-8 top-9 h-3 rounded-full" />
      </div>
      {bridge ? <div className="absolute bottom-20 left-8 right-8 h-20 rounded-t-[60px] border-[14px] border-b-0 border-[#c98f55]" /> : null}
      {rainy ? <RainDrops /> : null}
      {wash ? <Bubbles /> : null}
      {fastMarks ? (
        <>
          <div className="absolute left-8 top-28 h-4 w-20 rounded-full bg-white/80" />
          <div className="absolute left-2 top-[168px] h-4 w-28 rounded-full bg-white/80" />
        </>
      ) : null}
      {showDog ? (
        <div className="absolute bottom-24 right-10 z-20">
          <Dog safe={scene === 'stop'} />
        </div>
      ) : null}
      {scene === 'cheer' ? (
        <div className="absolute right-6 top-16 z-20 rounded-full bg-[#fff7bd] px-4 py-2 text-3xl font-black text-[#ffb703]">
          ★ ★ ★
        </div>
      ) : null}
      <div className={`absolute bottom-14 left-8 z-10 w-56 transition ${carOffset}`}>
        <VehicleArt color={vehicleColor} accent="#ffd166" kind={vehicleKind} />
      </div>
    </div>
  );
}

function RainDrops() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {Array.from({ length: 14 }, (_, index) => (
        <span
          className="absolute h-8 w-2 -rotate-12 rounded-full bg-[#3aa6ff]/70"
          key={index}
          style={{ left: `${8 + index * 7}%`, top: `${20 + (index % 3) * 20}px` }}
        />
      ))}
    </div>
  );
}

function Bubbles() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {Array.from({ length: 12 }, (_, index) => (
        <span
          className="absolute rounded-full border-4 border-white/90 bg-white/35"
          key={index}
          style={{
            width: `${26 + (index % 3) * 10}px`,
            height: `${26 + (index % 3) * 10}px`,
            left: `${12 + index * 7}%`,
            top: `${58 + (index % 4) * 26}px`,
          }}
        />
      ))}
    </div>
  );
}

function Dog({ safe }: { safe: boolean }) {
  return (
    <svg className="h-28 w-28" viewBox="0 0 120 120" role="img" aria-label="dog">
      <ellipse cx="58" cy="72" rx="34" ry="24" fill="#c77d3b" stroke="#17324d" strokeWidth="6" />
      <circle cx="38" cy="50" r="23" fill="#d9954b" stroke="#17324d" strokeWidth="6" />
      <path d="M22 42 c-14-16-18 14-7 24" fill="#9d5b2d" stroke="#17324d" strokeWidth="6" />
      <circle cx="32" cy="47" r="4" fill="#17324d" />
      <circle cx="48" cy="47" r="4" fill="#17324d" />
      <path d="M39 56 q6 6 12 0" fill="none" stroke="#17324d" strokeWidth="5" strokeLinecap="round" />
      <path d="M88 64 q22-18 20 8" fill="none" stroke="#17324d" strokeWidth="8" strokeLinecap="round" />
      <path d="M43 92 v18 M73 92 v18" stroke="#17324d" strokeWidth="7" strokeLinecap="round" />
      {safe ? <circle cx="92" cy="34" r="12" fill="#43c66b" stroke="#17324d" strokeWidth="5" /> : null}
    </svg>
  );
}