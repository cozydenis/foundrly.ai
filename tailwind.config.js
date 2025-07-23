/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Stealth mode color palette
        stealth: {
          50: '#fef7ed',
          100: '#fef0db', 
          200: '#ffe2cc', // Primary cream color
          300: '#fdd4a7',
          400: '#fbb668',
          500: '#f59429',
          600: '#e67c1a',
          700: '#c4621a',
          800: '#9c4f1c',
          900: '#7e431b',
          950: '#441f09',
        },
        dark: {
          50: '#f7f5f4',
          100: '#ede8e3',
          200: '#dbd0c6',
          300: '#c2b29e',
          400: '#a68b72',
          500: '#8d7053',
          600: '#6d5940',
          700: '#594a38',
          800: '#4a3e33',
          900: '#381a06', // Primary dark color
          950: '#1c0d03',
        },
        primary: {
          50: '#fef7ed',
          100: '#fef0db',
          200: '#ffe2cc',
          300: '#fdd4a7',
          400: '#fbb668',
          500: '#f59429',
          600: '#e67c1a',
          700: '#c4621a',
          800: '#9c4f1c',
          900: '#7e431b',
          950: '#441f09',
        },
        accent: {
          50: '#fef7ed',
          100: '#fef0db',
          200: '#ffe2cc',
          300: '#fdd4a7',
          400: '#fbb668',
          500: '#f59429',
          600: '#e67c1a',
          700: '#c4621a',
          800: '#9c4f1c',
          900: '#7e431b',
          950: '#441f09',
        }
      },
      fontFamily: {
        'sans': ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'satoshi': ['Satoshi', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
      },
      keyframes: {
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}