/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Coral / Pinkish Red from cabinets and desk
        primary: '#f56a6a',
        'on-primary': '#ffffff',
        'primary-container': '#ffdad8',
        'on-primary-container': '#410006',
        'primary-fixed': '#ffb3b0',
        'primary-fixed-dim': '#ff8c8c',
        'on-primary-fixed': '#410006',
        'on-primary-fixed-variant': '#8c1520',
        'inverse-primary': '#ffb3b0',
        
        // Teal / Turquoise from the walls
        secondary: '#42b5a9',
        'on-secondary': '#ffffff',
        'secondary-container': '#b2ebf2',
        'on-secondary-container': '#004d40',
        'secondary-fixed': '#80cbc4',
        'secondary-fixed-dim': '#4db6ac',
        'on-secondary-fixed': '#00332a',
        'on-secondary-fixed-variant': '#004d40',
        
        // Yellow from the logo
        tertiary: '#ffc627',
        'on-tertiary': '#000000',
        'tertiary-container': '#ffecb3',
        'on-tertiary-container': '#3e2723',
        'tertiary-fixed': '#ffe082',
        'tertiary-fixed-dim': '#ffd54f',
        'on-tertiary-fixed': '#261a00',
        'on-tertiary-fixed-variant': '#5b4300',
        
        // Surfaces & Backgrounds
        surface: '#f8fafa',
        'surface-dim': '#d9dbdb',
        'surface-bright': '#f8fafa',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f5f5',
        'surface-container': '#edeef0',
        'surface-container-high': '#e7eaea',
        'surface-container-highest': '#e1e4e4',
        'on-surface': '#191c1d',
        'on-surface-variant': '#584140',
        'surface-variant': '#e1e3e4',
        'inverse-surface': '#2e3132',
        'inverse-on-surface': '#f0f1f2',
        'surface-tint': '#f56a6a',
        
        // Outlines
        outline: '#8c706f',
        'outline-variant': '#e0bfbd',
        
        // Backgrounds
        background: '#f8fafa',
        'on-background': '#191c1d',
        
        // Semantic
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
