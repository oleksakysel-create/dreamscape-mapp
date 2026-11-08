/**
 * Tiny drawing kit for Dreamscape coloring pages.
 *
 * Pages use a painter's model: regions are listed back-to-front and later
 * regions sit on top. Every region carries a realistic `tone`, so a page
 * colored "as in life" looks like the real dream (car, yacht, villa…).
 * scripts/verify-art.mjs checks that every region is visible and the
 * canvas has no unpainted gaps.
 */
export const W = 300
export const H = 400

export interface Region {
  id: string
  d: string
  tone: string
  /** evenodd fill (for rings / frames with holes) */
  eo?: boolean
}

export interface Artwork {
  id: string
  title: string
  viewBox: string
  regions: Region[]
}

const r2 = (n: number) => Math.round(n * 10) / 10
export type Pt = readonly [number, number]
export type Fn = (x: number) => number

export class Page {
  regions: Region[] = []
  constructor(private prefix: string) {}
  add(d: string, tone: string, eo = false) {
    this.regions.push({ id: `${this.prefix}${this.regions.length + 1}`, d, tone, ...(eo ? { eo } : {}) })
    return this
  }
  done(id: string, title: string): Artwork {
    return { id, title, viewBox: `0 0 ${W} ${H}`, regions: this.regions }
  }
}

export const poly = (pts: readonly Pt[]) =>
  `M${pts.map(([x, y]) => `${r2(x)} ${r2(y)}`).join('L')}Z`

export const rect = (x: number, y: number, w: number, h: number) => `M${r2(x)} ${r2(y)}h${r2(w)}v${r2(h)}h${r2(-w)}Z`

export const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`

export const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${r2(cx - rx)} ${r2(cy)}a${r2(rx)} ${r2(ry)} 0 1 0 ${r2(2 * rx)} 0a${r2(rx)} ${r2(ry)} 0 1 0 ${r2(-2 * rx)} 0Z`

export const circle = (cx: number, cy: number, r: number) => ellipse(cx, cy, r, r)

export const polar = (cx: number, cy: number, r: number, deg: number): Pt => {
  const a = (deg * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

/** Annular sector, angles in degrees (0 = right, 90 = down). */
export function sector(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 6))
  const outer = Array.from({ length: n + 1 }, (_, i) => polar(cx, cy, r1, a0 + ((a1 - a0) * i) / n))
  const inner = r0 > 0 ? Array.from({ length: n + 1 }, (_, i) => polar(cx, cy, r0, a1 - ((a1 - a0) * i) / n)) : [[cx, cy] as Pt]
  return poly([...outer, ...inner])
}

/** Ring (evenodd) between two concentric ellipses. */
export const ring = (cx: number, cy: number, rx0: number, ry0: number, rx1: number, ry1: number) =>
  ellipse(cx, cy, rx1, ry1) + ellipse(cx, cy, rx0, ry0)

/** Rotated rectangle centred on (cx, cy). */
export function rot(cx: number, cy: number, w: number, h: number, deg: number) {
  const a = (deg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  const corners: Pt[] = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]
  const pts = corners.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c] as Pt)
  return poly(pts)
}

/** Lens / leaf from a to b with given half-width; side=0 whole, ±1 one half. */
export function leaf(a: Pt, b: Pt, w: number, side: 0 | 1 | -1 = 0) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const c1: Pt = [m[0] + nx * w * 2, m[1] + ny * w * 2]
  const c2: Pt = [m[0] - nx * w * 2, m[1] - ny * w * 2]
  const q = (c: Pt, to: Pt) => `Q${r2(c[0])} ${r2(c[1])} ${r2(to[0])} ${r2(to[1])}`
  if (side === 1) return `M${r2(a[0])} ${r2(a[1])}${q(c1, b)}Z`
  if (side === -1) return `M${r2(a[0])} ${r2(a[1])}${q(c2, b)}Z`
  return `M${r2(a[0])} ${r2(a[1])}${q(c1, b)}${q(c2, a)}Z`
}

/** Four-point sparkle star. */
export function sparkle(cx: number, cy: number, r: number) {
  const k = r * 0.28
  return poly([[cx, cy - r], [cx + k, cy - k], [cx + r, cy], [cx + k, cy + k], [cx, cy + r], [cx - k, cy + k], [cx - r, cy], [cx - k, cy - k]])
}

export const flat = (y: number): Fn => () => y
export const wave = (y: number, amp: number, freq = 1, phase = 0): Fn => (x) => y + amp * Math.sin((x / W) * Math.PI * 2 * freq + phase)
/** Piecewise-linear profile through [x, y] points (for ridgelines). */
export const profile = (pts: readonly Pt[]): Fn => (x) => {
  if (x <= pts[0]![0]) return pts[0]![1]
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i]!
    const [x0, y0] = pts[i - 1]!
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
  }
  return pts[pts.length - 1]![1]
}

/** Region between two curves over [x0, x1]. */
export function band(top: Fn, bottom: Fn, x0 = 0, x1 = W, step = 5) {
  const xs: number[] = []
  for (let x = x0; x < x1; x += step) xs.push(x)
  xs.push(x1)
  return poly([...xs.map((x) => [x, top(x)] as Pt), ...xs.reverse().map((x) => [x, bottom(x)] as Pt)])
}

/** Pine tree: stacked tiers. Returns [trunk, ...tiers] paths (bottom tier first). */
export function pine(x: number, base: number, h: number, w: number, tiers = 3): string[] {
  const out = [rect(x - w * 0.07, base - h * 0.12, w * 0.14, h * 0.12)]
  for (let i = 0; i < tiers; i++) {
    const t0 = base - h * 0.1 - (i * h * 0.85) / tiers
    const tw = w * (1 - i * 0.22)
    const top = t0 - h * 0.45
    out.push(poly([[x - tw / 2, t0], [x + tw / 2, t0], [x, top]]))
  }
  return out
}
