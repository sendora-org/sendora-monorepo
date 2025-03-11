import { heroui } from '@heroui/react';
import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
    },
  },
  darkMode: 'class',
  plugins: [heroui()],
} satisfies Config;
