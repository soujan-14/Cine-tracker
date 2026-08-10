import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        netflix: {
          red: '#E50914',
          'red-dark': '#B20710',
          black: '#0B0B0B',
          dark: '#141414',
        },
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'fade-up': 'fade-up 0.4s ease both',
        'fade-in': 'fade-in 0.3s ease both',
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(135deg, #0B0B0B 0%, #141414 100%)',
        'hero-gradient': 'linear-gradient(to top, #0B0B0B 0%, rgba(11,11,11,0.6) 50%, transparent 100%)',
      },
      boxShadow: {
        'card-hover': '0 20px 60px -12px rgba(229,9,20,0.2)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.scrollbar-hide::-webkit-scrollbar': {
          display: 'none',
        },
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
      });
    },
  ],
} satisfies Config;
