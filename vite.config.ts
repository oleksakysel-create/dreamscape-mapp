import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: './', // relative asset paths: works on GitHub Pages and from file:// inside Electron
  server: { port: 5173, strictPort: true },
  test: { environment: 'jsdom', include: ['src/**/*.test.ts'] },
} as never)
