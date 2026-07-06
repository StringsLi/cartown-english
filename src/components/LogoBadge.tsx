/// <reference types="vite/client" />

import { useEffect, useMemo, useState } from 'react';
import type { CarLogo } from '../data/lessons';

const localLogoModules = import.meta.glob('../static/cartown-logos/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

type LogoBadgeProps = {
  logo: CarLogo;
  size?: 'sm' | 'lg';
  className?: string;
};

const brandDomains: Record<string, string> = {
  toyota: 'toyota.com',
  honda: 'honda.com',
  nissan: 'nissanusa.com',
  ford: 'ford.com',
  chevrolet: 'chevrolet.com',
  volkswagen: 'vw.com',
  bmw: 'bmw.com',
  'mercedes-benz': 'mercedes-benz.com',
  audi: 'audi.com',
  porsche: 'porsche.com',
  tesla: 'tesla.com',
  hyundai: 'hyundai.com',
  kia: 'kia.com',
  volvo: 'volvocars.com',
  lexus: 'lexus.com',
  mazda: 'mazda.com',
  subaru: 'subaru.com',
  mitsubishi: 'mitsubishicars.com',
  peugeot: 'peugeot.com',
  citroen: 'citroen.com',
  renault: 'renault.com',
  fiat: 'fiat.com',
  jeep: 'jeep.com',
  'land-rover': 'landrover.com',
  jaguar: 'jaguar.com',
  mini: 'mini.com',
  'rolls-royce': 'rolls-roycemotorcars.com',
  bentley: 'bentleymotors.com',
  ferrari: 'ferrari.com',
  lamborghini: 'lamborghini.com',
  maserati: 'maserati.com',
  bugatti: 'bugatti.com',
  mclaren: 'cars.mclaren.com',
  'aston-martin': 'astonmartin.com',
  'alfa-romeo': 'alfaromeo.com',
  cadillac: 'cadillac.com',
  buick: 'buick.com',
  lincoln: 'lincoln.com',
  dodge: 'dodge.com',
  ram: 'ramtrucks.com',
  acura: 'acura.com',
  infiniti: 'infinitiusa.com',
  genesis: 'genesis.com',
  byd: 'byd.com',
  geely: 'geely.com',
  chery: 'cheryinternational.com',
  nio: 'nio.com',
  xpeng: 'xiaopeng.com',
  'li-auto': 'lixiang.com',
  smart: 'smart.com',
};

const simpleIconSlugs: Record<string, string> = {
  toyota: 'toyota',
  honda: 'honda',
  nissan: 'nissan',
  ford: 'ford',
  chevrolet: 'chevrolet',
  volkswagen: 'volkswagen',
  bmw: 'bmw',
  audi: 'audi',
  porsche: 'porsche',
  tesla: 'tesla',
  hyundai: 'hyundai',
  kia: 'kia',
  volvo: 'volvo',
  mazda: 'mazda',
  subaru: 'subaru',
  mitsubishi: 'mitsubishi',
  peugeot: 'peugeot',
  citroen: 'citroen',
  renault: 'renault',
  fiat: 'fiat',
  jeep: 'jeep',
  mini: 'mini',
  'rolls-royce': 'rollsroyce',
  bentley: 'bentley',
  ferrari: 'ferrari',
  lamborghini: 'lamborghini',
  maserati: 'maserati',
  bugatti: 'bugatti',
  mclaren: 'mclaren',
  'aston-martin': 'astonmartin',
  cadillac: 'cadillac',
  ram: 'ram',
  acura: 'acura',
  infiniti: 'infiniti',
  smart: 'smart',
};

function localLogoUrl(logo: CarLogo) {
  const match = Object.entries(localLogoModules).find(([path]) => path.endsWith(`/${logo.id}.png`));
  return match?.[1];
}

function googleLogoUrl(logo: CarLogo) {
  const domain = brandDomains[logo.id];
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=256` : undefined;
}

function simpleIconUrl(logo: CarLogo) {
  const slug = simpleIconSlugs[logo.id];
  const color = logo.primary.replace('#', '');
  return slug ? `https://cdn.simpleicons.org/${slug}/${color}` : undefined;
}

export function LogoBadge({ logo, size = 'lg', className = '' }: LogoBadgeProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = useMemo(
    () => [localLogoUrl(logo), googleLogoUrl(logo), simpleIconUrl(logo)].filter(Boolean) as string[],
    [logo],
  );
  const compact = size === 'sm';
  const src = sources[sourceIndex];

  useEffect(() => {
    setSourceIndex(0);
  }, [logo.id]);

  if (src) {
    return (
      <div
        className={`relative mx-auto flex aspect-[1.18] w-full items-center justify-center overflow-hidden rounded-[28px] border-4 border-white bg-gradient-to-br from-white via-[#f8fbff] to-[#d9fbff] p-4 shadow-toy ${
          compact ? 'max-w-28 rounded-2xl p-2' : 'max-w-80'
        } ${className}`}
        aria-label={`${logo.name} logo`}
        role="img"
      >
        <div className="absolute inset-x-4 top-3 h-5 rounded-full bg-white/80 blur-sm" />
        <div className={`relative z-10 flex items-center justify-center rounded-[24px] bg-white/85 ${compact ? 'h-16 w-16' : 'h-36 w-36 sm:h-44 sm:w-44'}`}>
          <img
            alt={`${logo.name} logo`}
            className="max-h-[84%] max-w-[84%] object-contain"
            draggable={false}
            src={src}
            onError={() => setSourceIndex((current) => current + 1)}
          />
        </div>
        <div className="absolute bottom-2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black text-[#47647d] sm:text-xs">
          {logo.name}
        </div>
      </div>
    );
  }

  return <FallbackBadge logo={logo} size={size} className={className} />;
}

function FallbackBadge({ logo, size, className }: LogoBadgeProps) {
  const isSmall = size === 'sm';
  const textSize = logo.badgeText.length > 4 ? (isSmall ? 15 : 24) : logo.badgeText.length > 2 ? (isSmall ? 18 : 30) : (isSmall ? 26 : 46);

  return (
    <svg
      className={`h-auto w-full drop-shadow-[0_12px_0_rgba(0,0,0,.10)] ${className}`}
      viewBox="0 0 220 180"
      role="img"
      aria-label={`${logo.name} badge`}
    >
      <defs>
        <linearGradient id={`shine-${logo.id}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="0.45" stopColor={logo.primary} stopOpacity="1" />
          <stop offset="1" stopColor="#17324d" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <rect x="22" y="134" width="176" height="18" rx="9" fill="#17324d" opacity=".12" />
      {logo.shape === 'wings' ? <Wings logo={logo} /> : null}
      {logo.shape === 'shield' ? <Shield logo={logo} /> : null}
      {logo.shape === 'diamond' ? <Diamond logo={logo} /> : null}
      {logo.shape === 'hex' ? <Hex logo={logo} /> : null}
      {logo.shape === 'star' ? <Star logo={logo} /> : null}
      {logo.shape === 'triangle' ? <Triangle logo={logo} /> : null}
      {logo.shape === 'wordmark' ? <Wordmark logo={logo} /> : null}
      {logo.shape === 'oval' ? <Oval logo={logo} /> : null}
      {logo.shape === 'ring' ? <Ring logo={logo} /> : null}
      {logo.shape === 'circle' ? <Circle logo={logo} /> : null}
      <text
        x="110"
        y={logo.shape === 'wordmark' ? '98' : '102'}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={textSize}
        fontWeight="900"
        fill={logo.secondary}
        fontFamily="Baloo 2, Comic Sans MS, sans-serif"
      >
        {logo.badgeText}
      </text>
      <path d="M70 44 q40-24 80 0" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" opacity=".38" fill="none" />
    </svg>
  );
}

function Circle({ logo }: { logo: CarLogo }) {
  return <circle cx="110" cy="88" r="58" fill={`url(#shine-${logo.id})`} stroke="#17324d" strokeWidth="8" />;
}

function Oval({ logo }: { logo: CarLogo }) {
  return <ellipse cx="110" cy="88" rx="76" ry="48" fill={`url(#shine-${logo.id})`} stroke="#17324d" strokeWidth="8" />;
}

function Ring({ logo }: { logo: CarLogo }) {
  return (
    <>
      <ellipse cx="110" cy="88" rx="76" ry="48" fill="#ffffff" stroke="#17324d" strokeWidth="8" />
      <ellipse cx="110" cy="88" rx="58" ry="34" fill={`url(#shine-${logo.id})`} stroke={logo.primary} strokeWidth="8" />
    </>
  );
}

function Shield({ logo }: { logo: CarLogo }) {
  return <path d="M58 38 h104 v56 c0 38-31 58-52 68-21-10-52-30-52-68z" fill={`url(#shine-${logo.id})`} stroke="#17324d" strokeWidth="8" strokeLinejoin="round" />;
}

function Diamond({ logo }: { logo: CarLogo }) {
  return <path d="M110 24 l76 64-76 64-76-64z" fill={`url(#shine-${logo.id})`} stroke="#17324d" strokeWidth="8" strokeLinejoin="round" />;
}

function Hex({ logo }: { logo: CarLogo }) {
  return <path d="M67 38 h86 l42 50-42 50H67L25 88z" fill={`url(#shine-${logo.id})`} stroke="#17324d" strokeWidth="8" strokeLinejoin="round" />;
}

function Star({ logo }: { logo: CarLogo }) {
  return <path d="M110 26 l17 43 47 3-36 30 12 46-40-25-40 25 12-46-36-30 47-3z" fill={`url(#shine-${logo.id})`} stroke="#17324d" strokeWidth="8" strokeLinejoin="round" />;
}

function Triangle({ logo }: { logo: CarLogo }) {
  return <path d="M110 26 l78 122H32z" fill={`url(#shine-${logo.id})`} stroke="#17324d" strokeWidth="8" strokeLinejoin="round" />;
}

function Wordmark({ logo }: { logo: CarLogo }) {
  return <rect x="34" y="44" width="152" height="88" rx="30" fill={`url(#shine-${logo.id})`} stroke="#17324d" strokeWidth="8" />;
}

function Wings({ logo }: { logo: CarLogo }) {
  return (
    <>
      <path d="M100 70 C68 42 38 44 18 58 c28 6 48 20 70 44z" fill={logo.primary} stroke="#17324d" strokeWidth="7" strokeLinejoin="round" />
      <path d="M120 70 c32-28 62-26 82-12-28 6-48 20-70 44z" fill={logo.primary} stroke="#17324d" strokeWidth="7" strokeLinejoin="round" />
      <circle cx="110" cy="88" r="48" fill={`url(#shine-${logo.id})`} stroke="#17324d" strokeWidth="8" />
    </>
  );
}