import type { Vehicle } from '../data/lessons';

type VehicleArtProps = {
  color: string;
  accent?: string;
  kind?: Vehicle['kind'] | 'color-car';
  label?: string;
  className?: string;
};

export function VehicleArt({
  color,
  accent = '#ffd166',
  kind = 'car',
  label,
  className = '',
}: VehicleArtProps) {
  const isBus = kind === 'bus' || kind === 'school-bus' || kind === 'train';
  const isTruck = kind === 'truck' || kind === 'fire-truck' || kind === 'van';
  const isService = kind === 'police-car' || kind === 'ambulance' || kind === 'fire-truck';
  const isRace = kind === 'race-car';
  const isScooter = kind === 'scooter';
  const bodyWidth = isBus ? 250 : isTruck ? 235 : isRace ? 230 : 220;
  const bodyX = (320 - bodyWidth) / 2;

  if (isScooter) {
    return <ScooterArt color={color} accent={accent} label={label} className={className} />;
  }

  return (
    <svg
      className={`h-auto w-full drop-shadow-[0_14px_0_rgba(0,0,0,0.08)] ${className}`}
      viewBox="0 0 320 210"
      role="img"
      aria-label={label ?? 'cartoon car'}
    >
      <rect x="18" y="158" width="284" height="22" rx="11" fill="#4f6f7f" opacity=".18" />
      {kind === 'train' ? (
        <>
          <rect x="26" y="112" width="268" height="14" rx="7" fill="#17324d" opacity=".25" />
          <rect x="52" y="66" width="216" height="72" rx="26" fill={color} stroke="#17324d" strokeWidth="7" />
          <circle cx="86" cy="138" r="20" fill="#17324d" />
          <circle cx="160" cy="138" r="20" fill="#17324d" />
          <circle cx="234" cy="138" r="20" fill="#17324d" />
          <rect x="86" y="80" width="44" height="30" rx="10" fill="#bdf3ff" stroke="#17324d" strokeWidth="5" />
          <rect x="144" y="80" width="44" height="30" rx="10" fill="#bdf3ff" stroke="#17324d" strokeWidth="5" />
          <rect x="202" y="80" width="44" height="30" rx="10" fill="#bdf3ff" stroke="#17324d" strokeWidth="5" />
          <rect x="54" y="45" width="44" height="36" rx="10" fill={accent} stroke="#17324d" strokeWidth="6" />
          <circle cx="274" cy="98" r="9" fill="#fff7bd" />
        </>
      ) : (
        <>
          {isTruck ? <rect x={bodyX + 138} y="76" width="72" height="64" rx="12" fill={accent} /> : null}
          <path
            d={
              isRace
                ? `M${bodyX + 20} 135 h${bodyWidth - 35} c18 0 31-13 31-29 v-8 c0-12-11-22-26-25 l-46-9 -36-27 h-60 l-42 28 -43 9 c-16 3-28 14-28 29 v5 c0 15 12 27 27 27z`
                : `M${bodyX + 28} 134 h${bodyWidth - 48} c20 0 34-14 34-32 v-18 c0-15-12-27-27-27 h-30 l-28-30 h-82 l-30 30 h-33 c-17 0-31 14-31 31 v18 c0 16 13 28 29 28z`
            }
            fill={color}
            stroke="#17324d"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <path
            d={`M${bodyX + 92} 57 l22-23 h62 l22 23z`}
            fill="#bdf3ff"
            stroke="#17324d"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {isBus ? (
            <>
              <rect x="76" y="58" width="164" height="40" rx="12" fill="#bdf3ff" stroke="#17324d" strokeWidth="6" />
              <line x1="125" x2="125" y1="60" y2="97" stroke="#17324d" strokeWidth="5" />
              <line x1="174" x2="174" y1="60" y2="97" stroke="#17324d" strokeWidth="5" />
              {kind === 'school-bus' ? <path d="M88 113 h144" stroke="#17324d" strokeWidth="8" strokeLinecap="round" /> : null}
            </>
          ) : null}
          {isService ? <rect x="140" y="18" width="42" height="24" rx="8" fill={accent} stroke="#17324d" strokeWidth="5" /> : null}
          {kind === 'taxi' ? <rect x="129" y="18" width="62" height="26" rx="8" fill="#fff7bd" stroke="#17324d" strokeWidth="5" /> : null}
          {kind === 'ambulance' ? (
            <>
              <rect x="146" y="82" width="28" height="52" rx="4" fill={accent} />
              <rect x="134" y="94" width="52" height="28" rx="4" fill={accent} />
            </>
          ) : null}
          {kind === 'police-car' ? <path d="M92 101 h136" stroke={accent} strokeWidth="18" strokeLinecap="round" /> : null}
          {kind === 'fire-truck' ? <path d="M86 79 h86" stroke="#fff7bd" strokeWidth="10" strokeLinecap="round" /> : null}
          {kind === 'race-car' ? (
            <>
              <circle cx="162" cy="97" r="22" fill={accent} stroke="#17324d" strokeWidth="5" />
              <text x="162" y="105" textAnchor="middle" fontSize="24" fontWeight="900" fill="#17324d">1</text>
            </>
          ) : null}
          <circle cx="105" cy="137" r="28" fill="#17324d" />
          <circle cx="105" cy="137" r="12" fill="#ffffff" />
          <circle cx="219" cy="137" r="28" fill="#17324d" />
          <circle cx="219" cy="137" r="12" fill="#ffffff" />
          <circle cx={bodyX + bodyWidth - 28} cy="98" r="8" fill="#fff7bd" />
          <circle cx={bodyX + 26} cy="103" r="7" fill="#ffe1a8" />
        </>
      )}
    </svg>
  );
}

function ScooterArt({ color, accent, label, className }: Required<Pick<VehicleArtProps, 'color' | 'accent'>> & Pick<VehicleArtProps, 'label' | 'className'>) {
  return (
    <svg
      className={`h-auto w-full drop-shadow-[0_14px_0_rgba(0,0,0,0.08)] ${className ?? ''}`}
      viewBox="0 0 320 210"
      role="img"
      aria-label={label ?? 'cartoon scooter'}
    >
      <rect x="44" y="160" width="232" height="18" rx="9" fill="#4f6f7f" opacity=".18" />
      <circle cx="104" cy="142" r="27" fill="#17324d" />
      <circle cx="104" cy="142" r="12" fill="#ffffff" />
      <circle cx="220" cy="142" r="27" fill="#17324d" />
      <circle cx="220" cy="142" r="12" fill="#ffffff" />
      <path d="M104 136 h100 q26 0 34-24" fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" />
      <path d="M214 116 l-22-58" fill="none" stroke="#17324d" strokeWidth="8" strokeLinecap="round" />
      <path d="M188 58 h48" fill="none" stroke="#17324d" strokeWidth="8" strokeLinecap="round" />
      <circle cx="150" cy="102" r="21" fill={accent} stroke="#17324d" strokeWidth="6" />
    </svg>
  );
}