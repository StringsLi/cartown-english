import { BigButton } from '../components/BigButton';
import { PageShell } from '../components/PageShell';

type ParentPageProps = {
  stars: number;
  records: {
    learnedVehicle: string;
    learnedLogo: string;
    storyPage: number;
    colorQuestionsDone: number;
    countQuestionsDone: number;
    trafficTurnsDone: number;
    logoQuizDone: number;
    colorWords: string;
    vehicleCount: number;
    logoCount: number;
  };
  onHome: () => void;
};

export function ParentPage({ stars, records, onHome }: ParentPageProps) {
  return (
    <PageShell title="Parent" subtitle="学习记录" stars={stars} onHome={onHome}>
      <section className="flex flex-1 flex-col gap-4 rounded-[32px] border-4 border-white bg-white/85 p-5 shadow-toy sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <RecordCard label="今日星星" value={`${stars}`} helper="颜色、数车、红绿灯、车标小测答对后增加星星。" />
          <RecordCard label="车辆词库" value={`${records.vehicleCount} 个`} helper={`最近看到：${records.learnedVehicle}`} />
          <RecordCard label="车标词库" value={`${records.logoCount} 个`} helper={`最近学习：${records.learnedLogo}`} />
          <RecordCard label="车标小测完成" value={`${records.logoQuizDone} 题`} helper="练习听品牌名，点对应徽章。" />
          <RecordCard label="颜色听力完成" value={`${records.colorQuestionsDone} 题`} helper={`当前颜色词：${records.colorWords}`} />
          <RecordCard label="数字数车完成" value={`${records.countQuestionsDone} 题`} helper="练习 one 到 five 的数量感。" />
          <RecordCard label="红绿灯动作完成" value={`${records.trafficTurnsDone} 轮`} helper="练习 Stop / Slow / Go。" />
          <RecordCard label="绘本进度" value={`第 ${records.storyPage} 页`} helper="当前支持两本 5 页小绘本。" />
        </div>
        <BigButton tone="green" className="mt-auto" onClick={onHome}>
          Back to town
        </BigButton>
      </section>
    </PageShell>
  );
}

function RecordCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article className="rounded-[26px] border-4 border-[#d9fbff] bg-[#fff7bd] p-5">
      <p className="text-lg font-black text-[#47647d]">{label}</p>
      <p className="mt-1 font-display text-4xl font-black text-[#17324d]">{value}</p>
      <p className="mt-2 text-base font-bold text-[#47647d]">{helper}</p>
    </article>
  );
}