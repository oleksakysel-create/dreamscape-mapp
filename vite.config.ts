import react from '@vitejs/plugin-react'
import pkg from './package.json' with { type: 'json' }
import { defineConfig } from 'vite'

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(`v${pkg.version.split('.')[0]}`) },
  plugins: [react()],
  base: './', // relative asset paths: works on GitHub Pages and from file:// inside Electron
  server: { port: 5173, strictPort: true },
  test: { environment: 'jsdom', include: ['src/**/*.test.ts'] },
} as never)
