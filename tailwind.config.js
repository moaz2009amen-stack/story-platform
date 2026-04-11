/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        body: ['Cairo', 'sans-serif'],
      },
      colors: {
        ink: {
          50:  '#f4f1ec',
          100: '#e8e3d9',
          200: '#d1c7b3',
          300: '#baab8d',
          400: '#a38f67',
          500: '#8c7341',
          600: '#705c34',
          700: '#544527',
          800: '#382e1a',
          900: '#1c170d',
          950: '#0e0b06',
        },
        parchment: {
          50:  '#fdfaf4',
          100: '#faf5e9',
          200: '#f5ebd3',
          300: '#f0e1bd',
          400: '#ebd7a7',
          500: '#e6cd91',
        },
        crimson: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        gold: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        night: {
          800: '#1a1714',
          850: '#141210',
          900: '#0f0d0a',
          950: '#0a0807',
        },
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease forwards',
        'fade-up':     'fadeUp 0.6s ease forwards',
        'slide-right': 'slideRight 0.4s ease forwards',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'float':       'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'texture-paper': "url(\"data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'card':      '0 4px 24px -4px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
        'card-dark': '0 4px 24px -4px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)',
        'glow-gold': '0 0 20px rgba(251,191,36,0.3)',
        'glow-red':  '0 0 20px rgba(239,68,68,0.3)',
      },
      borderRadius: {
        'xl2': '1.25rem',
        'xl3': '1.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
