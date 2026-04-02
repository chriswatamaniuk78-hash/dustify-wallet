import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#000000',
          1: '#080808',
          2: '#0e0e0e',
          3: '#141414',
        },
        gold: {
          dim:    '#7a5c1e',
          deep:   '#9a7428',
          warm:   '#C9A84C',
          DEFAULT:'#D4AF37',
          bright: '#E8C547',
          light:  '#F5D76E',
          pale:   '#FDF0C0',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        serif:   ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['Geist', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      backdropBlur: {
        xs: '4px',
        sm: '12px',
        md: '24px',
        lg: '40px',
        xl: '60px',
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(212,175,55,0.25)',
        'gold-md': '0 0 24px rgba(212,175,55,0.30), 0 0 48px rgba(212,175,55,0.12)',
        'gold-lg': '0 0 40px rgba(212,175,55,0.35), 0 0 80px rgba(212,175,55,0.15)',
        'panel':   '0 8px 40px rgba(0,0,0,0.8), 0 2px 0 rgba(212,175,55,0.15) inset, 0 0 0 1px rgba(212,175,55,0.18)',
        'panel-heavy': '0 24px 80px rgba(0,0,0,0.7), 0 8px 40px rgba(0,0,0,0.8)',
      },
      borderColor: {
        'gold-0': 'rgba(212,175,55,0.12)',
        'gold-1': 'rgba(212,175,55,0.25)',
        'gold-2': 'rgba(212,175,55,0.45)',
        'gold-3': 'rgba(212,175,55,0.70)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'fade-up':    'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
