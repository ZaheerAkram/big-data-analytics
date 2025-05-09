/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eeecfd',
          100: '#d8d4fc',
          200: '#b6aef8',
          300: '#9287f4',
          400: '#745ff0',
          500: '#4F46E5', // primary
          600: '#4338ca',
          700: '#3730a3',
          800: '#312e81',
          900: '#24255c',
        },
        secondary: {
          50: '#e9fbfb',
          100: '#cef5f5',
          200: '#9feded',
          300: '#70e0e0',
          400: '#44d0d0',
          500: '#14B8A6', // secondary teal
          600: '#109990',
          700: '#0e7c76',
          800: '#0e625e',
          900: '#0f5654',
        },
        accent: {
          50: '#fffaf0',
          100: '#feebcb',
          200: '#fdd28a',
          300: '#fbbf4c',
          400: '#F59E0B', // accent amber
          500: '#f78a09',
          600: '#dd7106',
          700: '#bf5709',
          800: '#974209',
          900: '#7c370a',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10B981', // success green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#FBBF24', // warning amber
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#EF4444', // error red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};