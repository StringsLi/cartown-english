import type { ReactNode } from 'react';
import { BigButton } from './BigButton';
import { StarCounter } from './StarCounter';

type PageShellProps = {
  title: string;
  subtitle?: string;
  stars: number;
  children: ReactNode;
  onHome?: () => void;
};

export function PageShell({ title, subtitle, stars, children, onHome }: PageShellProps) {
  return (
    <main className="town-sky min-h-screen overflow-hidden px-4 py-5 text-[#17324d] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-7xl flex-col">
        <header className="mb-4 flex items-center justify-between gap-3 rounded-[28px] border-4 border-white bg-white/72 px-4 py-3 shadow-toy backdrop-blur-sm sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#1871a6] sm:text-sm">
              CarCar English
            </p>
            <h1 className="font-display text-3xl font-black leading-tight sm:text-5xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm font-black text-[#47647d] sm:text-base">{subtitle}</p> : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
            <StarCounter stars={stars} />
            {onHome ? (
              <BigButton tone="white" className="min-h-12 rounded-2xl px-4 py-2 text-base" onClick={onHome}>
                Home
              </BigButton>
            ) : null}
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}