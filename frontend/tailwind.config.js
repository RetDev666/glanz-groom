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
        accent: ['Titan One', 'cursive', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.25rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      spacing: {
        xs: '4px',
        sm: '12px',
        md: '24px',
        lg: '48px',
        xl: '80px',
        gutter: '24px',
        margin: '32px',
      },
      fontSize: {
        'headline-xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '1.2', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};
