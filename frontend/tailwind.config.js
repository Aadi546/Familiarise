/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        family: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e'
        }
      },
      backgroundImage: {
        'teal-glow': 'radial-gradient(ellipse at top, rgba(20,184,166,0.2), transparent 70%)',
        'teal-mesh':
          'radial-gradient(at 20% 50%, rgba(13,148,136,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(6,182,212,0.15) 0px, transparent 50%)',
        'dark-mesh':
          'radial-gradient(at 20% 50%, rgba(13,148,136,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(6,182,212,0.08) 0px, transparent 50%)'
      },
      boxShadow: {
        soft: '0 12px 30px rgba(15,23,42,0.08)',
        card: '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 16px -2px rgba(0,0,0,0.1), 0 4px 8px -4px rgba(0,0,0,0.06)',
        'glow-teal': '0 0 30px rgba(20,184,166,0.25)',
        'glow-teal-sm': '0 0 15px rgba(20,184,166,0.2)',
        'glow-teal-lg': '0 0 50px rgba(20,184,166,0.35)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        glow: 'glow 2.5s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        float: 'float 6s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(20,184,166,0.25)' },
          '50%': { boxShadow: '0 0 45px rgba(20,184,166,0.55)' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      borderRadius: {
        '4xl': '2rem'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};
