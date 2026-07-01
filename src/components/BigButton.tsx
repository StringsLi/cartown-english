import type { ButtonHTMLAttributes, ReactNode } from 'react';

type BigButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: 'red' | 'blue' | 'yellow' | 'green' | 'white';
  asChild?: boolean;
};

const toneClass = {
  red: 'bg-[#ff5a5f] text-white',
  blue: 'bg-[#3aa6ff] text-white',
  yellow: 'bg-[#ffd447] text-[#17324d]',
  green: 'bg-[#43c66b] text-white',
  white: 'bg-white text-[#17324d]',
};

export function BigButton({ children, tone = 'yellow', className = '', asChild = false, ...props }: BigButtonProps) {
  const classes = `kid-focus min-h-16 rounded-[22px] border-4 border-white px-6 py-4 text-xl font-black shadow-button transition active:translate-y-1 active:shadow-none disabled:opacity-60 ${toneClass[tone]} ${className}`;

  if (asChild) {
    return <span className={`inline-flex items-center justify-center ${classes}`}>{children}</span>;
  }

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  );
}
