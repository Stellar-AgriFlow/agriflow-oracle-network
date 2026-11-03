import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: '#121824',
        border: '#1E293B',
        brand: {
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
      },
    },
  },
  plugins: [],
};

export default config;

