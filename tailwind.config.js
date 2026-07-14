/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        radar: {
          bg: '#0a0e17',
          panel: '#0f1621',
          border: '#1c2b3a',
          amber: '#ffb020',
          cyan: '#22d3ee',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
