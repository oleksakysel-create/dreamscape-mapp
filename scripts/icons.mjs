// Renders public/favicon.svg into the PNG icons used by iOS and the web manifest.
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8')
const browser = await chromium.launch()
for (const [size, name, square] of [[180, 'apple-touch-icon.png', true], [192, 'icon-192.png', false], [512, 'icon-512.png', true]]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  // iOS rounds corners itself, so the touch icon and maskable icon are full-bleed squares
  const body = square ? svg.replace('rx="112"', 'rx="0"') : svg
  await page.setContent(`<body style="margin:0;background:transparent">${body.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`)
  await page.screenshot({ path: new URL(`../public/${name}`, import.meta.url).pathname, omitBackground: !square })
  await page.close()
}
await browser.close()
console.log('icons written')
