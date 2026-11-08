import { COLORING_IMAGES, getIllustration, illustrationToSvg } from "@/lib/coloring/illustrations";
import { emptyHistory, paint, progressOf, redo, undo, MAX_HISTORY, type History } from "@/lib/coloring/history";
import type { Fills } from "@/lib/coloring/types";
import { clipToRect, polygonArea } from "@/lib/coloring/geometry";
import { COLORING_CATEGORIES } from "@/lib/coloring/types";

describe("coloring library", () => {
  it("ships 24 unique illustrations, 4 per category", () => {
    expect(COLORING_IMAGES).toHaveLength(24);
    expect(new Set(COLORING_IMAGES.map((c) => c.id)).size).toBe(24);
    for (const cat of COLORING_CATEGORIES) expect(COLORING_IMAGES.filter((c) => c.category === cat)).toHaveLength(4);
  });

  it("generates deterministic, non-empty region sets with unique ids", () => {
    for (const meta of COLORING_IMAGES) {
      const ill = getIllustration(meta.id)!;
      expect(ill.regions.length).toBeGreaterThan(10);
      expect(new Set(ill.regions.map((r) => r.id)).size).toBe(ill.regions.length);
      for (const r of ill.regions) expect(r.d).not.toMatch(/NaN|undefined/);
    }
    expect(getIllustration("nature-dawn")).toBe(getIllustration("nature-dawn")); // memoized
  });

  it("exports fills into static SVG", () => {
    const svg = illustrationToSvg(getIllustration("geo-honeycomb")!, { r1: "#ABCDEF" });
    expect(svg).toContain('fill="#ABCDEF"');
    expect(svg.startsWith("<svg")).toBe(true);
  });

  it("clips polygons to the canvas", () => {
    const clipped = clipToRect([[-50, -50], [50, -50], [50, 50], [-50, 50]], 0, 0, 400, 400);
    expect(polygonArea(clipped)).toBeCloseTo(2500);
  });
});

describe("fill history (undo/redo)", () => {
  it("paints, undoes and redoes", () => {
    let fills = {};
    let history = emptyHistory();
    ({ fills, history } = paint(fills, history, "r1", "#111111")!);
    ({ fills, history } = paint(fills, history, "r1", "#222222")!);
    expect(fills).toEqual({ r1: "#222222" });
    ({ fills, history } = undo(fills, history)!);
    expect(fills).toEqual({ r1: "#111111" });
    ({ fills, history } = undo(fills, history)!);
    expect(fills).toEqual({});
    expect(undo(fills, history)).toBeNull();
    ({ fills, history } = redo(fills, history)!);
    expect(fills).toEqual({ r1: "#111111" });
  });

  it("ignores no-op paints and clears redo on new paint", () => {
    let fills: Fills = {};
    let history: History = emptyHistory();
    ({ fills, history } = paint(fills, history, "a", "#000000")!);
    expect(paint(fills, history, "a", "#000000")).toBeNull();
    ({ fills, history } = undo(fills, history)!);
    ({ fills, history } = paint(fills, history, "b", "#FFFFFF")!);
    expect(history.future).toHaveLength(0);
  });

  it("erases with undefined and caps history length", () => {
    let fills = {};
    let history = emptyHistory();
    for (let i = 0; i < MAX_HISTORY + 20; i++) ({ fills, history } = paint(fills, history, `r${i}`, "#123456")!);
    expect(history.past).toHaveLength(MAX_HISTORY);
    ({ fills, history } = paint(fills, history, "r0", undefined)!);
    expect(fills).not.toHaveProperty("r0");
  });

  it("computes progress", () => {
    expect(progressOf({ a: "#000000" }, ["a", "b"])).toBe(0.5);
    expect(progressOf({}, [])).toBe(0);
  });
});
