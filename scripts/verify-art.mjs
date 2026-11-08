/**
 * Renders every coloring page in Chromium and checks that
 *  - every region is visible somewhere (topmost at ≥ 1 sample point), so it can be tapped
 *  - the canvas has no gaps (every sample point hits a region)
 * Writes a contact sheet (outline + realistic reference) when --sheet <png> is given.
 * Usage: npx tsx scripts/verify-art.mjs [--sheet out.png]
 */
import { chromium } from 'playwright'
import { ARTWORK_IDS, getArtwork, referenceFills, toSvg } from '../src/art/index.ts'

const sheetIdx = process.argv.indexOf('--sheet')
const arts = ARTWORK_IDS.map((id) => getArtwork(id))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } })
const cell = (svg, id, kind) => `<div data-id="${id}" data-kind="${kind}" style="width:180px;height:240px">${svg.replace('<svg ', '<svg width="180" height="240" ')}</div>`
await page.setContent(
  `<body style="margin:0;background:#0A0A0B;display:grid;grid-template-columns:repeat(8,180px);gap:8px;padding:8px">${arts
    .map((a) => cell(toSvg(a, {}), a.id, 'outline') + cell(toSvg(a, referenceFills(a)), a.id, 'ref'))
    .join('')}</body>`,
)
const report = await page.evaluate(() => {
  const out = []
  for (const div of document.querySelectorAll('div[data-kind="outline"]')) {
    const svg = div.querySelector('svg')
    const paths = [...svg.querySelectorAll('path')]
    const rect = svg.getBoundingClientRect()
    const seen = new Set()
    let gaps = 0
    for (let y = 0.5; y < 240; y += 1.5) {
      for (let x = 0.5; x < 180; x += 1.5) {
        const el = document.elementFromPoint(rect.left + x, rect.top + y)
        if (el && el.tagName === 'path') seen.add(el)
        else if (x > 2 && y > 2 && x < 178 && y < 238) gaps++
      }
    }
    const hidden = paths.map((p, i) => (seen.has(p) ? null : i + 1)).filter(Boolean)
    out.push({ id: div.dataset.id, regions: paths.length, hidden: hidden.join(',') || '-', gaps })
  }
  return out
})
console.table(report)
if (sheetIdx > -1) await page.screenshot({ path: process.argv[sheetIdx + 1], fullPage: true })
await browser.close()
const bad = report.filter((r) => r.hidden !== '-' || r.gaps > 0)
if (bad.length) {
  console.error('Problems in:', bad.map((b) => b.id).join(', '))
  process.exitCode = 1
}
