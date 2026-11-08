import { expect, type Page } from "@playwright/test";

/** Collects console errors & page errors so tests can assert a clean console. */
export function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

/**
 * Taps a coloring region with a REAL pointer click at a point that is
 * guaranteed to be inside the region's painted area (and on top).
 */
export async function tapRegion(page: Page, regionId: string) {
  const point = await page.evaluate((id) => {
    const path = document.querySelector<SVGPathElement>(`[data-region="${id}"]`);
    if (!path) return null;
    const svg = path.ownerSVGElement!;
    const box = path.getBBox();
    const ctm = path.getScreenCTM()!;
    for (let i = 0; i < 4000; i++) {
      const pt = svg.createSVGPoint();
      // Low-discrepancy sampling across the bbox.
      pt.x = box.x + box.width * ((i * 0.618034) % 1);
      pt.y = box.y + box.height * ((i * 0.754877) % 1);
      if (!path.isPointInFill(pt) || path.isPointInStroke(pt)) continue;
      const screen = pt.matrixTransform(ctm);
      if (document.elementFromPoint(screen.x, screen.y) === path) return { x: screen.x, y: screen.y };
    }
    return null;
  }, regionId);
  expect(point, `no tappable point for region ${regionId}`).not.toBeNull();
  await page.mouse.click(point!.x, point!.y);
}

export async function readStore(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("dreamscape-journey") ?? "{}").state);
}
