/**
 * DREAMSCAPE coloring library.
 *
 * Every illustration is generated deterministically from code, so the
 * 24 pages are identical for all users, weigh almost nothing, and can be
 * exported as static SVG for Supabase Storage (see scripts/generate-seed.ts).
 *
 * Design rule: regions TILE the canvas (they never overlap). Shapes that sit
 * "inside" another shape are cut out of their parent as evenodd holes. That
 * makes tap-to-fill exact: one tap colors exactly the area the user sees.
 */
import {
  annularSector,
  bandPath,
  circlePath,
  clipToRect,
  ellipsePath,
  petalPath,
  polar,
  polygonArea,
  polygonPath,
  rng,
  starPoints,
  type Pt,
} from "./geometry";
import type { ColoringImageMeta, Illustration, Region } from "./types";

const W = 400;
const H = 400;
const CX = W / 2;
const CY = H / 2;
const TAU = Math.PI * 2;
const RECT = `M0 0H${W}V${H}H0Z`;
const XS = Array.from({ length: W / 10 + 1 }, (_, i) => i * 10);

class Builder {
  regions: Region[] = [];
  add(d: string, holes: string[] = []): string {
    const id = `r${this.regions.length + 1}`;
    this.regions.push(holes.length ? { id, d: d + holes.join(""), evenOdd: true } : { id, d });
    return id;
  }
  done(): Illustration {
    return { viewBox: `0 0 ${W} ${H}`, regions: this.regions };
  }
}

type Curve = (x: number) => number;
const sample = (fn: Curve): Pt[] => XS.map((x) => [x, fn(x)] as const);

interface Circle {
  x: number;
  y: number;
  r: number;
}

function collides(c: Circle, placed: Circle[], gap = 6) {
  return placed.some((p) => Math.hypot(p.x - c.x, p.y - c.y) < p.r + c.r + gap);
}

function fitsBetween(c: Circle, upper: Curve, lower: Curve, gap = 6) {
  if (c.x - c.r < gap || c.x + c.r > W - gap) return false;
  for (let x = c.x - c.r; x <= c.x + c.r; x += 2) {
    if (upper(x) > c.y - c.r - gap || lower(x) < c.y + c.r + gap) return false;
  }
  return true;
}

/** Scatter non-overlapping circles inside the band between two curves. */
function scatter(
  rand: () => number,
  count: number,
  rMin: number,
  rMax: number,
  upper: Curve,
  lower: Curve,
  placed: Circle[],
): Circle[] {
  const out: Circle[] = [];
  for (let tries = 0; tries < count * 80 && out.length < count; tries++) {
    const c = { x: 10 + rand() * (W - 20), y: 10 + rand() * (H - 20), r: rMin + rand() * (rMax - rMin) };
    if (fitsBetween(c, upper, lower) && !collides(c, placed)) {
      placed.push(c);
      out.push(c);
    }
  }
  return out;
}

const halfLens = (base: Pt, tip: Pt, width: number, side: 1 | -1): string => {
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * side;
  const ny = (dx / len) * side;
  const c: Pt = [base[0] + dx / 2 + nx * width * 2, base[1] + dy / 2 + ny * width * 2];
  const r = (n: number) => Math.round(n * 100) / 100;
  return `M${r(base[0])} ${r(base[1])}Q${r(c[0])} ${r(c[1])} ${r(tip[0])} ${r(tip[1])}Z`;
};

/** A petal split along its spine into two colorable halves. Returns [outline, half A, half B]. */
function splitPetal(base: Pt, tip: Pt, width: number): [string, string, string] {
  return [petalPath(base, tip, width), halfLens(base, tip, width, 1), halfLens(base, tip, width, -1)];
}

/* ───────────────────────────── Mandala ───────────────────────────── */

interface MandalaOpts {
  radii: number[]; // ascending, radii[0] is the center disc
  sectors: number[]; // per ring (radii.length - 1)
  petalRings: number[]; // ring indices drawn as petals over an annulus
  rotation: number;
}

function mandala(o: MandalaOpts): Illustration {
  const b = new Builder();
  const R = o.radii[o.radii.length - 1]!;
  // Four corners: quadrant square minus quarter circle.
  const corners: [number, number, number, number][] = [
    [0, 0, 1, 1],
    [W, 0, -1, 1],
    [W, H, -1, -1],
    [0, H, 1, -1],
  ];
  for (const [x, y, sx, sy] of corners) {
    const p1: Pt = [CX, CY - sy * R];
    const p2: Pt = [CX - sx * R, CY];
    const sweep = sx * sy > 0 ? 0 : 1;
    b.add(`M${x} ${y}H${CX}V${p1[1]}A${R} ${R} 0 0 ${sweep} ${p2[0]} ${p2[1]}H${x}Z`);
  }
  b.add(circlePath(CX, CY, o.radii[0]!));
  for (let i = 0; i < o.radii.length - 1; i++) {
    const r0 = o.radii[i]!;
    const r1 = o.radii[i + 1]!;
    const n = o.sectors[i]!;
    const step = TAU / n;
    const off = o.rotation + (i % 2 ? step / 2 : 0);
    if (o.petalRings.includes(i)) {
      const rm = (r0 + r1) / 2;
      const width = Math.min(rm * (Math.PI / n) * 0.62, (r1 - r0) * 0.32);
      const petals: string[] = [];
      for (let k = 0; k < n; k++) {
        const a = off + k * step;
        petals.push(petalPath(polar(CX, CY, r0 + 3, a), polar(CX, CY, r1 - 3, a), width));
      }
      b.add(circlePath(CX, CY, r1) + circlePath(CX, CY, r0), petals);
      petals.forEach((p) => b.add(p));
    } else {
      for (let k = 0; k < n; k++) b.add(annularSector(CX, CY, r0, r1, off + k * step, off + (k + 1) * step));
    }
  }
  return b.done();
}

/* ───────────────────────────── Landscapes ───────────────────────────── */

function ridge(rand: () => number, base: number, peaks: number, height: number): Curve {
  const ps = Array.from({ length: peaks }, (_, i) => ({
    x: ((i + 0.5 + (rand() - 0.5) * 0.6) * W) / peaks,
    h: height * (0.55 + rand() * 0.45),
    s: 0.6 + rand() * 0.5,
  }));
  return (x) => base - Math.max(0, ...ps.map((p) => p.h - Math.abs(x - p.x) * p.s));
}

const wave = (base: number, amp: number, freq: number, phase: number): Curve => (x) =>
  base + amp * Math.sin((x / W) * TAU * freq + phase);

/** Ensure curves are separated by at least `gap` px top-to-bottom. */
function stack(curves: Curve[], gap = 8): Curve[] {
  const out: Curve[] = [];
  curves.forEach((c, i) => {
    const prev = out[i - 1];
    out.push(prev ? (x) => Math.max(c(x), prev(x) + gap) : c);
  });
  return out;
}

/** Split band (upper..lower) into vertical slices at the given sample indices. */
function addBand(b: Builder, upper: Curve, lower: Curve, cuts: number[] = [], holes: string[][] = []) {
  const up = sample(upper);
  const lo = sample(lower);
  const idx = [0, ...cuts.filter((c) => c > 0 && c < XS.length - 1).sort((a, c) => a - c), XS.length - 1];
  for (let i = 0; i < idx.length - 1; i++) b.add(bandPath(up, lo, idx[i], idx[i + 1]), holes[i] ?? []);
}

function randomCuts(rand: () => number, count: number): number[] {
  const set = new Set<number>();
  while (set.size < count) set.add(4 + Math.floor(rand() * (XS.length - 8)));
  return [...set];
}

function peaksOf(curve: Curve): number[] {
  const ys = XS.map(curve);
  const cuts: number[] = [];
  for (let i = 1; i < ys.length - 1; i++) if (ys[i]! < ys[i - 1]! && ys[i]! <= ys[i + 1]!) cuts.push(i);
  return cuts;
}

interface SkyOpts {
  rand: () => number;
  horizon: Curve;
  sunR: number;
  clouds: number;
  stars?: number;
  b: Builder;
}

/** Sky band with a sun/moon (+halo) and clouds/stars cut out as holes. */
function sky({ rand, horizon, sunR, clouds, stars = 0, b }: SkyOpts) {
  const top: Curve = () => 0;
  const halo = sunR + 14;
  let best = { x: 300, y: 0 };
  for (let x = halo + 20; x <= W - halo - 20; x += 10) {
    let minY = Infinity;
    for (let xx = x - halo; xx <= x + halo; xx += 4) minY = Math.min(minY, horizon(xx));
    if (minY > best.y) best = { x, y: minY };
  }
  const sun: Circle = { x: best.x, y: Math.max(halo + 12, Math.min(best.y - halo - 14, 120)), r: halo };
  const placed: Circle[] = [sun];
  const cloudShapes = scatter(rand, clouds, 28, 40, top, horizon, placed).map((c) => ellipsePath(c.x, c.y, c.r, c.r * 0.38));
  const starShapes = scatter(rand, stars, 7, 12, top, horizon, placed).map((c) =>
    polygonPath(starPoints(c.x, c.y, c.r, c.r * 0.45, 5, -Math.PI / 2 + rand())),
  );
  const haloD = circlePath(sun.x, sun.y, halo);
  b.add(polygonPath([[0, 0], [W, 0], ...sample(horizon).reverse()]), [haloD, ...cloudShapes, ...starShapes]);
  b.add(haloD, [circlePath(sun.x, sun.y, sunR)]);
  b.add(circlePath(sun.x, sun.y, sunR));
  cloudShapes.forEach((c) => b.add(c));
  starShapes.forEach((s) => b.add(s));
}

function landscape(seed: number, kind: "dawn" | "lake" | "hills" | "forest"): Illustration {
  const rand = rng(seed);
  const b = new Builder();
  if (kind === "hills") {
    const curves = stack([
      wave(170, 18, 1.2, rand() * TAU),
      wave(215, 22, 1.6, rand() * TAU),
      wave(265, 20, 1.1, rand() * TAU),
      wave(315, 18, 1.8, rand() * TAU),
      wave(360, 12, 1.3, rand() * TAU),
      () => H,
    ]);
    sky({ rand, horizon: curves[0]!, sunR: 34, clouds: 3, b });
    for (let i = 0; i < curves.length - 1; i++) addBand(b, curves[i]!, curves[i + 1]!, randomCuts(rand, 2 + (i % 2)));
    return b.done();
  }
  const far = ridge(rand, 200, 4, 100);
  const near = ridge(rand, 250, 3, 70);
  const [c0, c1, c2, c3] = stack([far, near, wave(300, 10, 1.4, rand() * TAU), () => H], 10) as [Curve, Curve, Curve, Curve];
  sky({ rand, horizon: c0, sunR: 30, clouds: 2, b });
  addBand(b, c0, c1, peaksOf(c0));
  if (kind === "lake") {
    addBand(b, c1, c2, peaksOf(c1));
    const lake = stack([c2, wave(335, 4, 3, 1), wave(360, 4, 2.5, 2), wave(382, 3, 3.5, 0), () => H], 8);
    for (let i = 0; i < lake.length - 1; i++) addBand(b, lake[i]!, lake[i + 1]!, randomCuts(rand, 2));
    return b.done();
  }
  if (kind === "forest") {
    // Pine trees cut out of the near-mountain band's lower meadow.
    const trees: string[] = [];
    const treeRegions: string[][] = [];
    const placed: Circle[] = [];
    for (const c of scatter(rand, 9, 16, 24, c1, c3, placed)) {
      const tri = polygonPath([[c.x, c.y - c.r], [c.x + c.r * 0.75, c.y + c.r * 0.55], [c.x - c.r * 0.75, c.y + c.r * 0.55]]);
      const trunk = polygonPath([[c.x - 3, c.y + c.r * 0.55], [c.x + 3, c.y + c.r * 0.55], [c.x + 3, c.y + c.r * 0.95], [c.x - 3, c.y + c.r * 0.95]]);
      trees.push(tri, trunk);
      treeRegions.push([tri, trunk]);
    }
    b.add(polygonPath([...sample(c1), ...sample(c3).reverse()]), trees);
    treeRegions.flat().forEach((d) => b.add(d));
    return b.done();
  }
  addBand(b, c1, c2, peaksOf(c1));
  addBand(b, c2, c3, randomCuts(rand, 3));
  return b.done();
}

/* ───────────────────────────── Ocean ───────────────────────────── */

function ocean(seed: number, kind: "tide" | "sunset" | "deep" | "bubbles"): Illustration {
  const rand = rng(seed);
  const b = new Builder();
  if (kind === "sunset") {
    const horizon = 210;
    const r = 70;
    const arc = (rad: number): Pt[] =>
      Array.from({ length: 25 }, (_, i) => polar(CX, horizon, rad, Math.PI + (i * Math.PI) / 24));
    const sunPoly = arc(r);
    // Rays from the sun to the frame.
    const rays = 12;
    for (let k = 0; k < rays; k++) {
      const i0 = (k * 24) / rays;
      const i1 = ((k + 1) * 24) / rays;
      const inner = sunPoly.slice(i0, i1 + 1);
      const a0 = Math.PI + (k * Math.PI) / rays;
      const a1 = Math.PI + ((k + 1) * Math.PI) / rays;
      const poly = clipToRect([...inner, polar(CX, horizon, 800, a1), polar(CX, horizon, 800, a0)], 0, 0, W, horizon);
      if (polygonArea(poly) > 1) b.add(polygonPath(poly));
    }
    // Sun stripes.
    const ys = [horizon - r, horizon - 50, horizon - 32, horizon - 16, horizon];
    for (let i = 0; i < ys.length - 1; i++) {
      const p = clipToRect(sunPoly, 0, ys[i]!, W, ys[i + 1]!);
      if (polygonArea(p) > 1) b.add(polygonPath(p));
    }
    const waves = stack([() => horizon, wave(240, 6, 2, 0), wave(275, 8, 2.5, 1), wave(315, 9, 1.8, 2), wave(355, 10, 2.2, 3), () => H], 8);
    for (let i = 0; i < waves.length - 1; i++) addBand(b, waves[i]!, waves[i + 1]!, randomCuts(rand, 2 + (i % 2)));
    return b.done();
  }
  const surface = kind === "tide" ? wave(130, 6, 1.5, 0) : wave(40, 5, 2, 0);
  const bands = stack([
    surface,
    ...[0, 1, 2, 3, 4].map((i) =>
      wave((kind === "tide" ? 175 : 100) + i * (kind === "tide" ? 45 : 60), 9 + rand() * 6, 1.5 + rand() * 1.5, rand() * TAU),
    ),
    () => H,
  ]);
  if (kind === "tide") {
    sky({ rand, horizon: surface, sunR: 26, clouds: 2, b });
    for (let i = 0; i < bands.length - 1; i++) addBand(b, bands[i]!, bands[i + 1]!, randomCuts(rand, 3));
    return b.done();
  }
  b.add(polygonPath([[0, 0], [W, 0], ...sample(surface).reverse()]));
  for (let i = 0; i < bands.length - 1; i++) {
    const placed: Circle[] = [];
    const shapes =
      kind === "bubbles"
        ? scatter(rand, 4, 8, 18, bands[i]!, bands[i + 1]!, placed).map((c) => circlePath(c.x, c.y, c.r))
        : scatter(rand, 2, 14, 18, bands[i]!, bands[i + 1]!, placed).flatMap((c) => {
            const dir = rand() > 0.5 ? 1 : -1;
            const body = petalPath([c.x - dir * c.r * 1.0, c.y], [c.x + dir * c.r * 1.0, c.y], c.r * 0.42, 0.45);
            return [body];
          });
    const up = sample(bands[i]!);
    const lo = sample(bands[i + 1]!);
    b.add(bandPath(up, lo), shapes);
    shapes.forEach((s) => b.add(s));
  }
  return b.done();
}

/* ───────────────────────────── Geometric ───────────────────────────── */

function tiling(kind: "hex" | "tri" | "blocks" | "kaleido"): Illustration {
  const b = new Builder();
  const polys: Pt[][] = [];
  if (kind === "hex" || kind === "blocks") {
    const r = kind === "hex" ? 36 : 46;
    const w = Math.sqrt(3) * r;
    for (let row = -1; row * 1.5 * r < H + r; row++) {
      for (let col = -1; col * w < W + w; col++) {
        const cx = col * w + (row % 2 ? w / 2 : 0);
        const cy = row * 1.5 * r;
        const hex = Array.from({ length: 6 }, (_, k) => polar(cx, cy, r, -Math.PI / 2 + (k * Math.PI) / 3));
        if (kind === "hex") polys.push(hex);
        else {
          const c: Pt = [cx, cy];
          polys.push([c, hex[5]!, hex[0]!, hex[1]!], [c, hex[1]!, hex[2]!, hex[3]!], [c, hex[3]!, hex[4]!, hex[5]!]);
        }
      }
    }
  } else if (kind === "tri") {
    const s = 66;
    const h = (Math.sqrt(3) / 2) * s;
    for (let row = 0; row * h < H; row++) {
      const y0 = row * h;
      const y1 = y0 + h;
      const shift = row % 2 ? s / 2 : 0;
      for (let k = -2; k * s < W + s; k++) {
        const x = k * s + shift;
        polys.push([[x, y1], [x + s / 2, y0], [x + s, y1]]);
        polys.push([[x + s / 2, y0], [x + s * 1.5, y0], [x + s, y1]]);
      }
    }
  } else {
    const s = 100;
    for (let y = 0; y < H; y += s) {
      for (let x = 0; x < W; x += s) {
        const c: Pt = [x + s / 2, y + s / 2];
        const tl: Pt = [x, y];
        const tr: Pt = [x + s, y];
        const br: Pt = [x + s, y + s];
        const bl: Pt = [x, y + s];
        // Each cell: 4 triangles, each split once more into a kite-like pair.
        const mids: Pt[] = [[x + s / 2, y], [x + s, y + s / 2], [x + s / 2, y + s], [x, y + s / 2]];
        const corners = [tl, tr, br, bl];
        for (let k = 0; k < 4; k++) {
          polys.push([c, corners[k]!, mids[k]!], [c, mids[k]!, corners[(k + 1) % 4]!]);
        }
      }
    }
  }
  for (const p of polys) {
    const clipped = clipToRect(p, 0, 0, W, H);
    if (clipped.length >= 3 && polygonArea(clipped) > 4) b.add(polygonPath(clipped));
  }
  return b.done();
}

/* ───────────────────────────── Botanical ───────────────────────────── */

function botanical(seed: number, kind: "lotus" | "daisies" | "fern" | "wreath"): Illustration {
  const rand = rng(seed);
  const b = new Builder();
  const holes: string[] = [];
  const parts: string[] = [];
  const addPetal = (base: Pt, tip: Pt, width: number, split: boolean) => {
    if (split) {
      const [outline, a, c] = splitPetal(base, tip, width);
      holes.push(outline);
      parts.push(a, c);
    } else {
      const d = petalPath(base, tip, width);
      holes.push(d);
      parts.push(d);
    }
  };
  const flower = (cx: number, cy: number, rc: number, rp: number, n: number, rot: number, split = false) => {
    const disc = circlePath(cx, cy, rc);
    holes.push(disc);
    parts.push(disc);
    for (let k = 0; k < n; k++) {
      const a = rot + (k * TAU) / n;
      const rm = (rc + rp) / 2;
      addPetal(polar(cx, cy, rc + 3, a), polar(cx, cy, rp, a), Math.min(rm * (Math.PI / n) * 0.6, (rp - rc) * 0.3), split);
    }
  };

  if (kind === "lotus") {
    flower(CX, CY, 34, 108, 8, -Math.PI / 2, true);
    for (let k = 0; k < 8; k++) {
      const a = -Math.PI / 2 + Math.PI / 8 + (k * TAU) / 8;
      addPetal(polar(CX, CY, 70, a), polar(CX, CY, 188, a), 26, true);
    }
    b.add(RECT, holes);
  } else if (kind === "daisies") {
    const ground = wave(250, 14, 1.3, rand() * TAU);
    const placed: Circle[] = [];
    const upperFlowers = scatter(rand, 3, 44, 60, () => 0, ground, placed);
    const skyHoles: string[] = [];
    for (const c of upperFlowers) {
      const before = holes.length;
      flower(c.x, c.y, c.r * 0.3, c.r, 10, rand());
      skyHoles.push(...holes.slice(before));
    }
    const lowerPlaced: Circle[] = [];
    const lowerFlowers = scatter(rand, 4, 30, 42, ground, () => H, lowerPlaced);
    const groundHoles: string[] = [];
    for (const c of lowerFlowers) {
      const before = holes.length;
      flower(c.x, c.y, c.r * 0.32, c.r, 8, rand());
      groundHoles.push(...holes.slice(before));
    }
    b.add(polygonPath([[0, 0], [W, 0], ...sample(ground).reverse()]), skyHoles);
    b.add(polygonPath([...sample(ground), [W, H], [0, H]]), groundHoles);
    parts.forEach((p) => b.add(p));
    return b.done();
  } else if (kind === "fern") {
    for (const sx of [120, 280]) {
      const stem = polygonPath([[sx - 4, 30], [sx + 4, 30], [sx + 4, 385], [sx - 4, 385]]);
      holes.push(stem);
      parts.push(stem);
      for (let i = 0; i < 9; i++) {
        const y = 60 + i * 36;
        const len = 46 + Math.sin((i / 8) * Math.PI) * 30;
        addPetal([sx + 6, y + 10], [sx + 6 + len, y - 14], 9, true);
        addPetal([sx - 6, y + 28], [sx - 6 - len, y + 4], 9, true);
      }
    }
    b.add(RECT, holes);
  } else {
    flower(CX, CY, 26, 86, 10, -Math.PI / 2, true);
    const n = 18;
    for (let k = 0; k < n; k++) {
      const a = (k * TAU) / n;
      const long = k % 2 === 0;
      addPetal(polar(CX, CY, long ? 112 : 122, a), polar(CX, CY, long ? 180 : 160, a), 10, true);
    }
    const ringBerry = Array.from({ length: n }, (_, k) => polar(CX, CY, 150, (k + 0.5) * (TAU / n)));
    ringBerry.forEach(([x, y]) => {
      const d = circlePath(x, y, 6);
      holes.push(d);
      parts.push(d);
    });
    b.add(RECT, holes);
  }
  parts.forEach((p) => b.add(p));
  return b.done();
}

/* ───────────────────────────── Cosmos ───────────────────────────── */

function cosmos(seed: number, kind: "moon" | "planet" | "starburst" | "aurora"): Illustration {
  const rand = rng(seed);
  const b = new Builder();
  if (kind === "starburst") {
    const n = 24;
    const r0 = 52;
    const r1 = 140;
    const inner = Array.from({ length: n }, (_, k) => polar(CX, CY, r0, (k * TAU) / n));
    const star = starPoints(CX, CY, 40, 18, 8);
    b.add(polygonPath(inner), [polygonPath(star)]);
    b.add(polygonPath(star));
    for (let k = 0; k < n; k++) {
      const a0 = (k * TAU) / n;
      const a1 = ((k + 1) * TAU) / n;
      const rr = k % 2 ? r1 - 30 : r1;
      b.add(polygonPath([polar(CX, CY, r0, a0), polar(CX, CY, rr, a0), polar(CX, CY, rr, a1), polar(CX, CY, r0, a1)]));
      const outer = clipToRect([polar(CX, CY, rr, a0), polar(CX, CY, 800, a0), polar(CX, CY, 800, a1), polar(CX, CY, rr, a1)], 0, 0, W, H);
      if (polygonArea(outer) > 4) b.add(polygonPath(outer));
    }
    return b.done();
  }
  if (kind === "aurora") {
    const curves = stack([wave(70, 22, 1.4, rand() * TAU), wave(120, 26, 1.1, rand() * TAU), wave(165, 18, 1.8, rand() * TAU)], 14);
    const mountains = stack([curves[2]!, ridge(rand, 300, 4, 90), wave(350, 8, 1.2, 0), () => H], 10);
    const placed: Circle[] = [];
    const stars = scatter(rand, 7, 7, 11, () => 0, curves[0]!, placed).map((c) =>
      polygonPath(starPoints(c.x, c.y, c.r, c.r * 0.45)),
    );
    b.add(polygonPath([[0, 0], [W, 0], ...sample(curves[0]!).reverse()]), stars);
    stars.forEach((s) => b.add(s));
    addBand(b, curves[0]!, curves[1]!, randomCuts(rand, 3));
    addBand(b, curves[1]!, curves[2]!, randomCuts(rand, 3));
    for (let i = 1; i < mountains.length; i++) {
      addBand(b, mountains[i - 1]!, mountains[i]!, i === 1 ? peaksOf(mountains[1]!) : randomCuts(rand, 2));
    }
    return b.done();
  }
  const placed: Circle[] = [];
  const bodies: string[] = [];
  const later: [string, string[]][] = [];
  if (kind === "moon") {
    const moon: Circle = { x: 270, y: 130, r: 72 };
    placed.push(moon);
    const craters: Circle[] = [];
    const inMoon = (x: number) => moon.y - Math.sqrt(Math.max(0, moon.r ** 2 - (x - moon.x) ** 2));
    const inMoonLo = (x: number) => moon.y + Math.sqrt(Math.max(0, moon.r ** 2 - (x - moon.x) ** 2));
    scatter(rand, 5, 8, 16, inMoon, inMoonLo, craters);
    const craterD = craters.map((c) => circlePath(c.x, c.y, c.r));
    bodies.push(circlePath(moon.x, moon.y, moon.r));
    later.push([circlePath(moon.x, moon.y, moon.r), craterD], ...craterD.map((d) => [d, []] as [string, string[]]));
  } else {
    const p: Circle = { x: CX, y: 215, r: 110 };
    placed.push({ ...p, r: p.r + 4 });
    const lines = [p.y - p.r, p.y - 70, p.y - 38, p.y - 8, p.y + 26, p.y + 58, p.y + 86, p.y + p.r];
    const poly = Array.from({ length: 72 }, (_, k) => polar(p.x, p.y, p.r, (k * TAU) / 72));
    bodies.push(polygonPath(poly));
    for (let i = 0; i < lines.length - 1; i++) {
      const strip = clipToRect(poly, 0, lines[i]!, W, lines[i + 1]!);
      if (polygonArea(strip) > 2) later.push([polygonPath(strip), []]);
    }
    const moonlet: Circle = { x: 70, y: 70, r: 26 };
    placed.push(moonlet);
    bodies.push(circlePath(moonlet.x, moonlet.y, moonlet.r));
    later.push([circlePath(moonlet.x, moonlet.y, moonlet.r), []]);
  }
  const horizon = kind === "moon" ? wave(320, 14, 1.2, rand() * TAU) : () => H + 20;
  const stars = scatter(rand, kind === "moon" ? 12 : 14, 7, 13, () => 0, horizon, placed).map((c) =>
    polygonPath(starPoints(c.x, c.y, c.r, c.r * 0.45, rand() > 0.6 ? 4 : 5)),
  );
  if (kind === "moon") {
    b.add(polygonPath([[0, 0], [W, 0], ...sample(horizon).reverse()]), [...bodies, ...stars]);
    later.forEach(([d, h]) => b.add(d, h));
    stars.forEach((s) => b.add(s));
    const hills = stack([horizon, wave(362, 10, 1.7, 1), () => H], 10);
    addBand(b, hills[0]!, hills[1]!, randomCuts(rand, 2));
    addBand(b, hills[1]!, hills[2]!, randomCuts(rand, 1));
  } else {
    b.add(RECT, [...bodies, ...stars]);
    later.forEach(([d, h]) => b.add(d, h));
    stars.forEach((s) => b.add(s));
  }
  return b.done();
}

/* ───────────────────────────── Catalog ───────────────────────────── */

interface CatalogEntry extends ColoringImageMeta {
  build: () => Illustration;
}

const CATALOG: CatalogEntry[] = [
  { id: "mandala-sunrise", title: "Sunrise Mandala", category: "mandala", difficulty: "gentle", description: "Wide, calm rings for an easy start.", build: () => mandala({ radii: [30, 70, 110, 150, 185], sectors: [8, 8, 16, 16], petalRings: [1], rotation: -Math.PI / 2 }) },
  { id: "mandala-lotus", title: "Lotus Wheel", category: "mandala", difficulty: "flowing", description: "Petal rings that bloom outward.", build: () => mandala({ radii: [24, 56, 92, 128, 160, 190], sectors: [10, 10, 20, 12, 24], petalRings: [1, 3], rotation: -Math.PI / 2 }) },
  { id: "mandala-compass", title: "Inner Compass", category: "mandala", difficulty: "flowing", description: "Twelve directions, one center.", build: () => mandala({ radii: [20, 50, 84, 118, 150, 188], sectors: [12, 12, 24, 12, 24], petalRings: [3], rotation: 0 }) },
  { id: "mandala-stillness", title: "Stillness", category: "mandala", difficulty: "intricate", description: "Fine detail for a deep, meditative session.", build: () => mandala({ radii: [18, 44, 72, 100, 128, 156, 190], sectors: [8, 16, 16, 32, 16, 32], petalRings: [0, 4], rotation: Math.PI / 8 }) },

  { id: "nature-dawn", title: "Mountain Dawn", category: "nature", difficulty: "gentle", description: "First light over quiet peaks.", build: () => landscape(11, "dawn") },
  { id: "nature-lake", title: "Alpine Lake", category: "nature", difficulty: "flowing", description: "Still water mirrors the mountains.", build: () => landscape(23, "lake") },
  { id: "nature-hills", title: "Rolling Hills", category: "nature", difficulty: "gentle", description: "A patchwork of soft fields.", build: () => landscape(37, "hills") },
  { id: "nature-forest", title: "Quiet Forest", category: "nature", difficulty: "flowing", description: "Pines gathered at the foot of the range.", build: () => landscape(41, "forest") },

  { id: "ocean-tide", title: "Gentle Tide", category: "ocean", difficulty: "gentle", description: "Waves that come and go, like breath.", build: () => ocean(5, "tide") },
  { id: "ocean-sunset", title: "Sunset Sea", category: "ocean", difficulty: "flowing", description: "The sun dips into the horizon.", build: () => ocean(8, "sunset") },
  { id: "ocean-deep", title: "Deep Blue", category: "ocean", difficulty: "flowing", description: "Little fish drifting through layers of blue.", build: () => ocean(13, "deep") },
  { id: "ocean-bubbles", title: "Rising Bubbles", category: "ocean", difficulty: "gentle", description: "Let thoughts rise and float away.", build: () => ocean(17, "bubbles") },

  { id: "geo-honeycomb", title: "Honeycomb", category: "geometric", difficulty: "flowing", description: "Steady, rhythmic, satisfying.", build: () => tiling("hex") },
  { id: "geo-prism", title: "Prism", category: "geometric", difficulty: "intricate", description: "Triangles that catch the light.", build: () => tiling("tri") },
  { id: "geo-blocks", title: "Tumbling Blocks", category: "geometric", difficulty: "flowing", description: "An optical illusion of stacked cubes.", build: () => tiling("blocks") },
  { id: "geo-kaleido", title: "Kaleidoscope", category: "geometric", difficulty: "flowing", description: "Pinwheels in a quiet grid.", build: () => tiling("kaleido") },

  { id: "bot-lotus", title: "Lotus Bloom", category: "botanical", difficulty: "flowing", description: "Two rings of open petals.", build: () => botanical(3, "lotus") },
  { id: "bot-daisies", title: "Daisy Meadow", category: "botanical", difficulty: "gentle", description: "Wildflowers above and below the hill.", build: () => botanical(19, "daisies") },
  { id: "bot-fern", title: "Twin Ferns", category: "botanical", difficulty: "flowing", description: "Unfurling, leaf by leaf.", build: () => botanical(29, "fern") },
  { id: "bot-wreath", title: "Wildflower Wreath", category: "botanical", difficulty: "intricate", description: "A circle of leaves around a bloom.", build: () => botanical(31, "wreath") },

  { id: "cosmos-moon", title: "Moonlit Night", category: "cosmos", difficulty: "gentle", description: "A soft moon over sleeping hills.", build: () => cosmos(7, "moon") },
  { id: "cosmos-planet", title: "Planet Dreams", category: "cosmos", difficulty: "gentle", description: "A striped world and its little moon.", build: () => cosmos(43, "planet") },
  { id: "cosmos-starburst", title: "Starburst", category: "cosmos", difficulty: "flowing", description: "Radiant rays from a guiding star.", build: () => cosmos(47, "starburst") },
  { id: "cosmos-aurora", title: "Aurora", category: "cosmos", difficulty: "flowing", description: "Northern lights over the ridge.", build: () => cosmos(53, "aurora") },
];

export const COLORING_IMAGES: readonly ColoringImageMeta[] = CATALOG.map(({ build: _build, ...meta }) => meta);

const cache = new Map<string, Illustration>();

export function getIllustration(id: string): Illustration | undefined {
  const cached = cache.get(id);
  if (cached) return cached;
  const entry = CATALOG.find((c) => c.id === id);
  if (!entry) return undefined;
  const ill = entry.build();
  cache.set(id, ill);
  return ill;
}

export function getImageMeta(id: string): ColoringImageMeta | undefined {
  return COLORING_IMAGES.find((c) => c.id === id);
}

/** Static SVG export (used for seed/Storage upload and downloads). */
export function illustrationToSvg(ill: Illustration, fills: Record<string, string> = {}): string {
  const paths = ill.regions
    .map(
      (r) =>
        `<path d="${r.d}" fill="${fills[r.id] ?? "#ffffff"}"${r.evenOdd ? ' fill-rule="evenodd"' : ""} stroke="#4A3F3A" stroke-width="1.4" stroke-linejoin="round"/>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ill.viewBox}">${paths}</svg>`;
}
