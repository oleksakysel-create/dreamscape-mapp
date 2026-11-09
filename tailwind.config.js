/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0C',       // app background
        card: '#151516',      // cards
        raised: '#1C1C1E',    // raised controls
        line: 'rgba(255,255,255,0.08)',
        fg: '#F2F1EE',        // primary text (warm off-white)
        soft: '#C9C7C2',      // secondary text on cards
        mute: '#8C8A86',      // tertiary text
        paper: '#F4F2EE',     // primary buttons
        sky: '#9CCBF0',       // accent: pale sky blue
        skysoft: 'rgba(156,203,240,0.14)',
        sage: '#9CCBB2',      // "came true"
        rose: '#E59A8C',      // gentle warning
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
