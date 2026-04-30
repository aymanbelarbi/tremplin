/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e8f5ee',
          100: '#c6e6d1',
          200: '#9fd5b2',
          300: '#74c391',
          400: '#4fb577',
          500: '#2aa75f',
          600: '#0a7a3b',
          700: '#086a33',
          800: '#065a2b',
          900: '#044020',
          950: '#03301a',
        },
        accent: {
          50: '#f6fbe8',
          100: '#ecf7cc',
          200: '#d9ef9a',
          300: '#c2e466',
          400: '#b4e94e',
          500: '#9ed62d',
          600: '#7fb61a',
          700: '#618a17',
          800: '#4a6919',
          900: '#3d561b',
        },
        ink: {
          DEFAULT: '#0f1411',
          soft: '#1a201c',
          muted: '#5d6862',
          subtle: '#8a958f',
        },
        paper: {
          DEFAULT: '#faf9f5',
          card: '#ffffff',
          tint: '#f2ede2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 7vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.25rem, 5vw, 3.5rem)', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.75rem, 3.5vw, 2.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(12,20,15,0.06), 0 8px 24px -8px rgba(12,20,15,0.08)',
        lift: '0 1px 2px rgba(12,20,15,0.04), 0 10px 40px -12px rgba(12,20,15,0.18)',
        pop: '0 20px 60px -20px rgba(10,122,59,0.35)',
        ring: '0 0 0 1px rgba(12,20,15,0.06), 0 1px 2px rgba(12,20,15,0.04)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(10,122,59,0.12), transparent 70%)',
        'noise':
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.035 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fadeIn 0.6s ease-out both',
        'float-slow': 'float 8s ease-in-out infinite',
        'shimmer': 'shimmer 2.4s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
