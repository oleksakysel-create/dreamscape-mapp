/** Small, dependency-free geometry helpers used to generate tiling coloring pages. */
export type Pt = readonly [number, number];

const f = (n: number) => (Math.round(n * 100) / 100).toString();

export function polar(cx: number, cy: number, r: number, angle: number): Pt {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

export function polygonPath(points: readonly Pt[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return `M${f(first![0])} ${f(first![1])}${rest.map((p) => `L${f(p[0])} ${f(p[1])}`).join("")}Z`;
}

export function circlePath(cx: number, cy: number, r: number): string {
  return `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
}

export function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;
}

/** Annular sector between radii r0<r1 and angles a0<a1 (radians). r0 may be 0. */
export function annularSector(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x1, y1] = polar(cx, cy, r1, a0);
  const [x2, y2] = polar(cx, cy, r1, a1);
  if (r0 <= 0) {
    return `M${f(cx)} ${f(cy)}L${f(x1)} ${f(y1)}A${f(r1)} ${f(r1)} 0 ${large} 1 ${f(x2)} ${f(y2)}Z`;
  }
  const [x3, y3] = polar(cx, cy, r0, a1);
  const [x4, y4] = polar(cx, cy, r0, a0);
  return `M${f(x1)} ${f(y1)}A${f(r1)} ${f(r1)} 0 ${large} 1 ${f(x2)} ${f(y2)}L${f(x3)} ${f(y3)}A${f(r0)} ${f(r0)} 0 ${large} 0 ${f(x4)} ${f(y4)}Z`;
}

/** Lens/petal shape from base point to tip, with given half-width. */
export function petalPath(base: Pt, tip: Pt, width: number, roundness = 0.5): string {
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = base[0] + dx * roundness;
  const my = base[1] + dy * roundness;
  // Quadratic control points are pushed out by 2×width so the curve peaks at ~width.
  const c1: Pt = [mx + nx * width * 2, my + ny * width * 2];
  const c2: Pt = [mx - nx * width * 2, my - ny * width * 2];
  return `M${f(base[0])} ${f(base[1])}Q${f(c1[0])} ${f(c1[1])} ${f(tip[0])} ${f(tip[1])}Q${f(c2[0])} ${f(c2[1])} ${f(base[0])} ${f(base[1])}Z`;
}

export function starPoints(cx: number, cy: number, outer: number, inner: number, points = 5, rotation = -Math.PI / 2): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    out.push(polar(cx, cy, r, rotation + (i * Math.PI) / points));
  }
  return out;
}

/** Sutherland–Hodgman clip of a polygon to an axis-aligned rectangle. */
export function clipToRect(poly: readonly Pt[], x0: number, y0: number, x1: number, y1: number): Pt[] {
  type Edge = { inside: (p: Pt) => boolean; intersect: (a: Pt, b: Pt) => Pt };
  const lerpX = (a: Pt, b: Pt, x: number): Pt => [x, a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0])];
  const lerpY = (a: Pt, b: Pt, y: number): Pt => [a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]), y];
  const edges: Edge[] = [
    { inside: (p) => p[0] >= x0, intersect: (a, b) => lerpX(a, b, x0) },
    { inside: (p) => p[0] <= x1, intersect: (a, b) => lerpX(a, b, x1) },
    { inside: (p) => p[1] >= y0, intersect: (a, b) => lerpY(a, b, y0) },
    { inside: (p) => p[1] <= y1, intersect: (a, b) => lerpY(a, b, y1) },
  ];
  let output: Pt[] = [...poly];
  for (const edge of edges) {
    const input = output;
    output = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i]!;
      const prev = input[(i + input.length - 1) % input.length]!;
      const curIn = edge.inside(cur);
      const prevIn = edge.inside(prev);
      if (curIn) {
        if (!prevIn) output.push(edge.intersect(prev, cur));
        output.push(cur);
      } else if (prevIn) {
        output.push(edge.intersect(prev, cur));
      }
    }
    if (output.length === 0) break;
  }
  return output;
}

export function polygonArea(poly: readonly Pt[]): number {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const q = poly[(i + 1) % poly.length]!;
    a += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(a) / 2;
}

/** Deterministic PRNG (mulberry32) so illustrations are identical for every user. */
export function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Band between two sampled boundary polylines (same x samples), from index i0..i1. */
export function bandPath(upper: readonly Pt[], lower: readonly Pt[], i0 = 0, i1 = upper.length - 1): string {
  const top = upper.slice(i0, i1 + 1);
  const bottom = lower.slice(i0, i1 + 1).reverse();
  return polygonPath([...top, ...bottom]);
}
