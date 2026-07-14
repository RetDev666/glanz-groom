/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#9B1B30', // main logo red
        'on-primary': '#ffffff',
        'primary-container': '#fce4e4',
        'on-primary-container': '#380611',
        'primary-fixed': '#ffdad8',
        'primary-fixed-dim': '#ffb3b0',
        'on-primary-fixed': '#410006',
        'on-primary-fixed-variant': '#8c1520',
        secondary: '#9B1B30',
        'on-secondary': '#ffffff',
        'secondary-container': '#fce4e4', // light red for active backgrounds
        'on-secondary-container': '#9B1B30', // red text for active items
        'secondary-fixed': '#ffdf9e',
        'secondary-fixed-dim': '#fabd00',
        'on-secondary-fixed': '#261a00',
        tertiary: '#506073',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#e2e8f0', // slate 200
        'tertiary-fixed': '#d4e4fb',
        'tertiary-fixed-dim': '#b8c8de',
        'on-tertiary-fixed': '#0d1d2d',
        'on-tertiary-fixed-variant': '#39485a',
        surface: '#f8f9fa',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f4f5',
        'surface-container': '#edeeef',
        'surface-container-high': '#e7e8e9',
        'surface-container-highest': '#e1e3e4',
        'on-surface': '#1a1c1e', // near black
        'on-surface-variant': '#534341', // greyish brown
        'surface-variant': '#f4dddb',
        'outline': '#857371',
        'outline-variant': '#d8c2bf',
        background: '#f8f9fa',
        'on-background': '#1a1c1e',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#410002',
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      backgroundImage: {
        'hatched': 'repeating-linear-gradient(-45deg, #f0f0f0, #f0f0f0 10px, #f8f9fa 10px, #f8f9fa 20px)',
      }
    },
  },
  plugins: [],
};
