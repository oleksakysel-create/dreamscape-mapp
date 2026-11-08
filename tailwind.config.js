/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0B',       // app background
        card: '#131315',      // cards
        raised: '#1B1B1E',    // raised controls
        line: 'rgba(255,255,255,0.08)',
        fg: '#F4F2EE',        // primary text (warm off-white)
        mute: '#8E8C88',      // secondary text
        gold: '#D9B57A',      // champagne accent
        goldsoft: 'rgba(217,181,122,0.14)',
        sage: '#7FB59A',      // done / calm positive
        rose: '#E08A7A',      // gentle warning
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', '"Cormorant Garamond"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
