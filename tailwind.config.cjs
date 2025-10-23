/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Colores específicos de Nequi
        nequi: {
          pink: '#E91E63',
          'pink-dark': '#D81B60',
          'pink-darker': '#AD1457',
          'pink-light': '#F8BBD9',
          purple: '#2D1B69',
          'purple-dark': '#1A0D3A',
          'purple-darker': '#0D0618',
          'purple-light': '#4A148C',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        raleway: ['Raleway', 'sans-serif'],
        sans: ['Raleway', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 20px rgba(233, 30, 99, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(233, 30, 99, 0.6)' },
        },
        'pulse-nequi': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-nequi': 'pulse-nequi 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-nequi': 'linear-gradient(135deg, #E91E63 0%, #D81B60 50%, #AD1457 100%)',
        'gradient-nequi-purple': 'linear-gradient(135deg, #2D1B69 0%, #1A0D3A 100%)',
        'gradient-nequi-hero': 'linear-gradient(135deg, #2D1B69 0%, #E91E63 100%)',
        'gradient-nequi-accent': 'linear-gradient(135deg, #F8BBD9 0%, #E91E63 100%)',
      },
      boxShadow: {
        'nequi': '0 10px 25px -5px rgba(233, 30, 99, 0.1), 0 10px 10px -5px rgba(233, 30, 99, 0.04)',
        'nequi-lg': '0 25px 50px -12px rgba(233, 30, 99, 0.15), 0 25px 25px -12px rgba(233, 30, 99, 0.1)',
        'nequi-purple': '0 10px 25px -5px rgba(45, 27, 105, 0.15), 0 10px 10px -5px rgba(45, 27, 105, 0.08)',
      },
    },
  },
  plugins: [],
}