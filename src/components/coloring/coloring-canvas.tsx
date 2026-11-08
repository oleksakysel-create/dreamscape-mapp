"use client";

import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Fills, Illustration } from "@/lib/coloring/types";
import { clamp, cn } from "@/lib/utils";

const UNFILLED = "#FFFFFF";
const MIN_K = 1;
const MAX_K = 6;
const DRAG_THRESHOLD = 6;

interface View {
  k: number;
  x: number;
  y: number;
}

export interface ColoringCanvasHandle {
  zoomBy: (factor: number) => void;
  reset: () => void;
}

interface Props {
  illustration: Illustration;
  fills: Fills;
  onRegionTap: (regionId: string) => void;
  highlightUnfilled?: boolean;
  className?: string;
}

/** A single region — memoized so a tap re-renders exactly one <path>. */
const RegionPath = memo(function RegionPath({ id, d, evenOdd, fill, pulse }: { id: string; d: string; evenOdd?: boolean; fill?: string; pulse: boolean }) {
  return (
    <path
      data-region={id}
      data-filled={fill ? "true" : "false"}
      d={d}
      fill={fill ?? UNFILLED}
      fillRule={evenOdd ? "evenodd" : undefined}
      stroke="#4A3F3A"
      strokeWidth={1.3}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      className={cn("cursor-pointer transition-[fill] duration-200 ease-out", pulse && "animate-pulse")}
      style={pulse ? { fill: "#FDE7A9" } : undefined}
    />
  );
});

export const ColoringCanvas = forwardRef<ColoringCanvasHandle, Props>(function ColoringCanvas(
  { illustration, fills, onRegionTap, highlightUnfilled = false, className },
  ref,
) {
  const [vbW, vbH] = illustration.viewBox.split(" ").slice(2).map(Number) as [number, number];
  const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ startX: number; startY: number; dragged: boolean; pinchDist?: number }>({ startX: 0, startY: 0, dragged: false });

  const clampView = useCallback(
    (v: View): View => {
      const k = clamp(v.k, MIN_K, MAX_K);
      return { k, x: clamp(v.x, vbW * (1 - k), 0), y: clamp(v.y, vbH * (1 - k), 0) };
    },
    [vbW, vbH],
  );

  /** Screen px → viewBox units scale factor. */
  const unit = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    return rect && rect.width ? vbW / rect.width : 1;
  };

  const zoomAt = useCallback(
    (factor: number, sx: number, sy: number) => {
      setView((v) => {
        const k = clamp(v.k * factor, MIN_K, MAX_K);
        const ratio = k / v.k;
        return clampView({ k, x: sx - (sx - v.x) * ratio, y: sy - (sy - v.y) * ratio });
      });
    },
    [clampView],
  );

  useImperativeHandle(ref, () => ({
    zoomBy: (f) => zoomAt(f, vbW / 2, vbH / 2),
    reset: () => setView({ k: 1, x: 0, y: 0 }),
  }));

  // Non-passive wheel listener so we can prevent page scroll while zooming.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const u = vbW / rect.width;
      zoomAt(Math.exp(-e.deltaY * 0.0018), (e.clientX - rect.left) * u, (e.clientY - rect.top) * u);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [vbW, zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) gesture.current = { startX: e.clientX, startY: e.clientY, dragged: false };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }];
      gesture.current.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      gesture.current.dragged = true;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const u = unit();
    const g = gesture.current;
    if (pointers.current.size >= 2) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.pinchDist) {
        const rect = containerRef.current!.getBoundingClientRect();
        zoomAt(dist / g.pinchDist, ((a.x + b.x) / 2 - rect.left) * u, ((a.y + b.y) / 2 - rect.top) * u);
      }
      g.pinchDist = dist;
      return;
    }
    if (!g.dragged && Math.hypot(e.clientX - g.startX, e.clientY - g.startY) > DRAG_THRESHOLD) {
      g.dragged = true;
      // Capture only once a drag starts, so plain taps still target the region.
      containerRef.current?.setPointerCapture?.(e.pointerId);
    }
    if (g.dragged) {
      const dx = (e.clientX - prev.x) * u;
      const dy = (e.clientY - prev.y) * u;
      setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }));
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current.pinchDist = undefined;
  };

  const onClick = (e: React.MouseEvent) => {
    if (gesture.current.dragged) {
      gesture.current.dragged = false;
      return;
    }
    const target = (e.target as Element).closest("[data-region]");
    const id = target?.getAttribute("data-region");
    if (id) onRegionTap(id);
  };

  return (
    <div
      ref={containerRef}
      data-testid="coloring-canvas"
      data-zoom={view.k.toFixed(2)}
      className={cn("relative aspect-square w-full touch-none select-none overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-line", view.k > 1 && "cursor-grab active:cursor-grabbing", className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
    >
      <svg viewBox={illustration.viewBox} className="block size-full" role="img" aria-label="Coloring page — tap a shape to fill it">
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {illustration.regions.map((r) => (
            <RegionPath key={r.id} id={r.id} d={r.d} evenOdd={r.evenOdd} fill={fills[r.id]} pulse={highlightUnfilled && !fills[r.id]} />
          ))}
        </g>
      </svg>
    </div>
  );
});
