import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F2EA',
        ink: '#241F1B',
        muted: '#847A6F',
        card: '#FFFFFF',
        line: '#EAE3D7',
        brand: {
          DEFAULT: '#2F5545',
          light: '#3F6E59',
          dark: '#1F3C31',
          tint: '#E4ECE7',
        },
        category: {
          food: '#D9714E',
          travel: '#2F7CA6',
          shopping: '#9B6BC7',
          home: '#8C6A4F',
          health: '#3F9D6F',
          bills: '#6B7280',
          snacks: '#D9A441',
          entertainment: '#B0559A',
          work: '#495578',
          family: '#C55C77',
          education: '#3E8E8E',
          subscriptions: '#7A6FD9',
          other: '#9C9488',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(36, 31, 27, 0.04), 0 8px 24px -12px rgba(36, 31, 27, 0.10)',
        lift: '0 2px 8px rgba(36, 31, 27, 0.06), 0 16px 32px -16px rgba(36, 31, 27, 0.16)',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'rise-in': {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 260ms cubic-bezier(.34,1.56,.64,1)',
        'rise-in': 'rise-in 320ms ease-out both',
        'sheet-up': 'sheet-up 280ms cubic-bezier(.32,.72,0,1)',
      },
    },
  },
  plugins: [],
};

export default config;
