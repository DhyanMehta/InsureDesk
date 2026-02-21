/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary gradient colors
        primary: {
          start: '#5B6CFF',
          end: '#7F8CFF',
          DEFAULT: '#5B6CFF',
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#5B6CFF',
          600: '#4F5FE6',
          700: '#4349CC',
          800: '#3A3FB3',
          900: '#2F3499',
        },
        // Accent colors
        purple: {
          accent: '#A78BFA',
          DEFAULT: '#A78BFA',
        },
        sky: {
          accent: '#60A5FA',
        },
        success: {
          soft: '#34D399',
          DEFAULT: '#34D399',
        },
        danger: {
          soft: '#F87171',
          DEFAULT: '#F87171',
        },
        warning: {
          soft: '#FBBF24',
          DEFAULT: '#FBBF24',
        },
        // Background colors
        background: {
          main: '#EEF2FF',
          secondary: '#E0E7FF',
          card: '#FFFFFF',
        },
        // Text colors
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        // Border
        border: {
          DEFAULT: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'card': '16px',
        'card-lg': '20px',
        'button': '999px',
      },
      boxShadow: {
        'soft': '0 10px 25px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 20px 40px rgba(0, 0, 0, 0.08)',
        'card': '0 10px 25px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 15px 35px rgba(0, 0, 0, 0.1)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        'glass': '10px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #5B6CFF 0%, #7F8CFF 100%)',
        'gradient-purple': 'linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)',
        'gradient-sky': 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)',
        'gradient-success': 'linear-gradient(135deg, #34D399 0%, #6EE7B7 100%)',
        'gradient-bg': 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
        'gradient-card': 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      maxWidth: {
        'dashboard': '1280px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
