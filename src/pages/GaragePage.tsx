import { BigButton } from '../components/BigButton';
import { PageShell } from '../components/PageShell';
import { VehicleArt } from '../components/VehicleArt';
import { vehicles } from '../data/lessons';
import { speakVehicle } from '../utils/speech';

type GaragePageProps = {
  stars: number;
  onHome: () => void;
};

export function GaragePage({ stars, onHome }: GaragePageProps) {
  const unlockedCount = Math.max(1, Math.min(vehicles.length, Math.floor(stars / 2) + 1));

  return (
    <PageShell title="Sticker Garage" subtitle="星星越多，车库越热闹" stars={stars} onHome={onHome}>
      <section className="flex flex-1 flex-col rounded-[32px] border-4 border-white bg-white/80 p-4 shadow-toy sm:p-6">
        <div className="mb-4 rounded-[28px] bg-[#fff7bd] p-4 text-center">
          <p className="font-display text-3xl font-black sm:text-5xl">{unlockedCount} / {vehicles.length} cars</p>
          <p className="mt-1 text-lg font-bold text-[#47647d]">每 2 颗星星解锁一辆贴纸车</p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {vehicles.map((vehicle, index) => {
            const unlocked = index < unlockedCount;
            return (
              <button
                className={`kid-focus relative min-h-[155px] overflow-hidden rounded-[26px] border-4 p-3 text-left shadow-toy transition active:translate-y-1 ${
                  unlocked ? 'border-white bg-[#d9fbff]' : 'border-[#d9e2e8] bg-[#eef4f7] grayscale'
                }`}
                key={vehicle.id}
                type="button"
                onClick={() => unlocked && speakVehicle(vehicle.word, vehicle.sentence)}
              >
                {!unlocked ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/55 text-center text-xl font-black text-[#47647d]">
                    ★ {Math.max(0, index * 2)}
                  </div>
                ) : null}
                <VehicleArt color={vehicle.color} accent={vehicle.accent} kind={vehicle.kind} label={vehicle.word} />
                <p className="mt-1 text-xl font-black">{vehicle.word}</p>
              </button>
            );
          })}
        </div>
        <BigButton tone="green" className="mt-4" onClick={onHome}>
          Back to town
        </BigButton>
      </section>
    </PageShell>
  );
}