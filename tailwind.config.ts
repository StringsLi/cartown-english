import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', '"Comic Sans MS"', 'Nunito', 'sans-serif'],
        body: ['Nunito', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        toy: '0 14px 0 rgba(80, 80, 80, 0.10), 0 22px 36px rgba(52, 96, 120, 0.18)',
        button: '0 8px 0 rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config;
