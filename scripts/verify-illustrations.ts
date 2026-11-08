/**
 * Dev check: renders every coloring page in Chromium and samples a grid of
 * points to prove regions tile the canvas (each point hit by exactly one region).
 * Usage: npx tsx scripts/verify-illustrations.ts [--sheet out.png]
 */
import { chromium } from "playwright";
import { COLORING_IMAGES, getIllustration, illustrationToSvg } from "../src/lib/coloring/illustrations";

const palette = ["#F4B6C2", "#F6C6A8", "#C7D6B3", "#B5D2E3", "#C3B6DD", "#E5D58E", "#A9DAD1", "#EFA48B"];

async function main() {
  const sheetArg = process.argv.indexOf("--sheet");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const svgs = COLORING_IMAGES.map((m) => {
    const ill = getIllustration(m.id)!;
    const fills = Object.fromEntries(ill.regions.map((r, i) => [r.id, palette[i % palette.length]!]));
    return { id: m.id, count: ill.regions.length, svg: illustrationToSvg(ill, fills) };
  });
  await page.setContent(
    `<body style="margin:0;display:grid;grid-template-columns:repeat(8,200px);gap:0">${svgs
      .map((s) => `<div data-id="${s.id}" style="width:200px;height:200px">${s.svg.replace("<svg ", '<svg width="200" height="200" ')}</div>`)
      .join("")}</body>`,
  );
  const report = await page.evaluate(() => {
    const out: { id: string; regions: number; overlaps: number; gaps: number }[] = [];
    document.querySelectorAll<HTMLDivElement>("div[data-id]").forEach((div) => {
      const svg = div.querySelector("svg")!;
      const paths = [...svg.querySelectorAll("path")];
      let overlaps = 0;
      let gaps = 0;
      for (let y = 3.3; y < 400; y += 7.1) {
        for (let x = 2.7; x < 400; x += 7.3) {
          const pt = svg.createSVGPoint();
          pt.x = x;
          pt.y = y;
          let hits = 0;
          for (const p of paths) if (p.isPointInFill(pt) && !p.isPointInStroke(pt)) hits++;
          const onStroke = paths.some((p) => p.isPointInStroke(pt));
          if (onStroke) continue;
          if (hits > 1) overlaps++;
          if (hits === 0) gaps++;
        }
      }
      out.push({ id: div.dataset.id!, regions: paths.length, overlaps, gaps });
    });
    return out;
  });
  console.table(report);
  if (sheetArg > -1) await page.screenshot({ path: process.argv[sheetArg + 1]!, fullPage: true });
  await browser.close();
  const bad = report.filter((r) => r.overlaps > 0 || r.gaps > 0);
  if (bad.length) {
    console.error("Tiling problems:", bad.map((b) => b.id).join(", "));
    process.exitCode = 1;
  }
}
main();
