/**
 * Builds Dreamscape as ONE self-contained HTML file (code, styles, images inlined).
 * Open it with a double-click — no repository, npm or server needed.
 *   npm run build:single  →  Dreamscape.html
 */
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const favicon = `data:image/svg+xml;base64,${readFileSync('public/favicon.svg').toString('base64')}`

/** Drop links to files that don't exist next to a lone HTML file; inline the favicon. */
const standaloneHead = (): Plugin => ({
  name: 'standalone-head',
  transformIndexHtml: (html) =>
    html
      .replace(/\s*<link rel="manifest"[^>]*>/, '')
      .replace(/\s*<link rel="apple-touch-icon"[^>]*>/, '')
      .replace('href="./favicon.svg"', `href="${favicon}"`),
})

export default defineConfig({
  plugins: [react(), standaloneHead(), viteSingleFile()],
  base: './',
  publicDir: false,
  build: { outDir: 'dist-single', assetsInlineLimit: 100_000_000, cssCodeSplit: false, reportCompressedSize: false },
})
