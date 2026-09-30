/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        neon: {
          cyan: '#00f3ff',
          magenta: '#ff007f',
          yellow: '#ffe600',
          purple: '#b026ff',
          green: '#00ff66',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 243, 255, 0.4), 0 0 10px rgba(0, 243, 255, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(0, 243, 255, 0.8), 0 0 25px rgba(0, 243, 255, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}

