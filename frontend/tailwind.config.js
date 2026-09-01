/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accentPurple: '#5E0ED7',
        navy: {
          DEFAULT: '#0B1220',
          dark: '#060913',
          light: '#111C35',
          border: '#1E2D4A',
        },
        cyan: {
          DEFAULT: '#00E5FF',
          glow: '#38BDF8',
          hover: '#00C2FF',
          dark: '#0891B2',
          light: '#E0F7FA',
        },
        emerald: {
          DEFAULT: '#10B981',
          glow: '#34D399',
          dark: '#059669',
        },
        amber: {
          DEFAULT: '#F59E0B',
          glow: '#FBBF24',
        },
        rose: {
          DEFAULT: '#F43F5E',
          glow: '#FB7185',
        },
        cyber: {
          bg: '#070B14',
          bgDarker: '#04070D',
          bgLighter: '#0D1527',
          card: 'rgba(13, 22, 40, 0.72)',
          cardSolid: '#0E172A',
          cardSecondary: 'rgba(18, 28, 51, 0.78)',
          cardHighlight: 'rgba(23, 37, 68, 0.85)',
          border: 'rgba(255, 255, 255, 0.08)',
          borderLight: 'rgba(56, 189, 248, 0.2)',
          borderGlow: 'rgba(0, 229, 255, 0.45)',
          primary: '#00E5FF',
          secondary: '#94A3B8',
          muted: '#64748B',
          accent: '#00E5FF',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#F43F5E',
          quantum: '#00E5FF'
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        inter: ['"Inter"', 'sans-serif'],
        sora: ['"Sora"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 229, 255, 0.35)',
        'cyan-glow-sm': '0 0 10px rgba(0, 229, 255, 0.25)',
        'cyan-glow-lg': '0 0 35px rgba(0, 229, 255, 0.45)',
        'purple-glow': '0 0 25px rgba(94, 14, 215, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'emerald-glow': '0 0 15px rgba(16, 185, 129, 0.35)',
      },
      backgroundImage: {
        'cyan-gradient': 'linear-gradient(135deg, #00E5FF 0%, #0072FF 100%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(16, 26, 48, 0.75) 0%, rgba(9, 15, 30, 0.85) 100%)',
        'glass-card-gradient': 'linear-gradient(145deg, rgba(18, 28, 51, 0.75) 0%, rgba(10, 16, 31, 0.85) 100%)',
      }
    },
  },
  plugins: [],
}
