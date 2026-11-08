import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 8_000 },
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4173', trace: 'off', screenshot: 'only-on-failure' },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 13 Pro'], browserName: 'chromium' }, grepInvert: /@desktop/ },
    { name: 'desktop', use: { viewport: { width: 1280, height: 960 } }, grep: /@desktop/ },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
