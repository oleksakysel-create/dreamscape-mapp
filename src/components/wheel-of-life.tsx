"use client";

import { useState } from "react";
import { annularSector, polar } from "@/lib/coloring/geometry";
import { LIFE_SPHERES } from "@/lib/data/spheres";
import type { Scores } from "@/lib/store/types";
import { cn } from "@/lib/utils";

const SIZE = 320;
const C = SIZE / 2;
const R0 = 22;
const RMAX = 128;
const STEP = (Math.PI * 2) / 12;
const START = -Math.PI / 2;
const rOf = (score: number) => R0 + ((RMAX - R0) * score) / 10;

/**
 * Wheel of Life: one hue encodes magnitude (score 1–10) for the current
 * assessment; the starting assessment is a dashed outline for comparison.
 * Sectors are direct-labeled, hoverable, and a table view is always available.
 */
export function WheelOfLife({ current, baseline, className }: { current: Scores; baseline?: Scores | null; className?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const showBaseline = Boolean(baseline) && LIFE_SPHERES.some((s) => baseline![s.id] !== current[s.id]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <div className="flex items-center gap-4" aria-label="Legend">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-[4px] bg-primary/80" /> Now
          </span>
          {showBaseline && (
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-[4px] border-2 border-dashed border-ink/60" /> Where you began
            </span>
          )}
        </div>
        <button type="button" onClick={() => setTable((t) => !t)} className="rounded-full px-2 py-1 font-semibold text-primary hover:bg-primary-soft">
          {table ? "Show chart" : "Show table"}
        </button>
      </div>

      {table ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-1.5 font-semibold">Sphere</th>
              {showBaseline && <th className="py-1.5 text-right font-semibold">Began</th>}
              <th className="py-1.5 text-right font-semibold">Now</th>
            </tr>
          </thead>
          <tbody>
            {LIFE_SPHERES.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="py-1.5">{s.name}</td>
                {showBaseline && <td className="py-1.5 text-right tabular-nums text-muted">{baseline![s.id]}</td>}
                <td className="py-1.5 text-right font-semibold tabular-nums">{current[s.id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative mx-auto w-full max-w-[360px]">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" role="img" aria-label="Wheel of life chart">
            {[2, 4, 6, 8, 10].map((v) => (
              <circle key={v} cx={C} cy={C} r={rOf(v)} fill="none" stroke="var(--ds-line)" strokeWidth={1} />
            ))}
            {LIFE_SPHERES.map((s, i) => {
              const a0 = START + i * STEP;
              const a1 = a0 + STEP;
              const value = current[s.id];
              const active = hover === i;
              return (
                <g key={s.id} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                  {/* Generous invisible hit target */}
                  <path d={annularSector(C, C, R0, RMAX + 30, a0, a1)} fill="transparent" />
                  <path
                    d={annularSector(C, C, R0, rOf(value), a0 + 0.012, a1 - 0.012)}
                    fill="var(--ds-primary)"
                    opacity={hover === null || active ? 0.82 : 0.38}
                    stroke="var(--ds-surface)"
                    strokeWidth={2}
                    className="transition-opacity"
                  />
                  {showBaseline && (
                    <path
                      d={annularSector(C, C, R0, rOf(baseline![s.id]), a0 + 0.012, a1 - 0.012)}
                      fill="none"
                      stroke="var(--ds-ink)"
                      strokeOpacity={0.55}
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      pointerEvents="none"
                    />
                  )}
                </g>
              );
            })}
            {LIFE_SPHERES.map((s, i) => {
              const [x, y] = polar(C, C, RMAX + 16, START + (i + 0.5) * STEP);
              return (
                <circle key={s.id} cx={x} cy={y} r={hover === i ? 6 : 4.5} fill={s.color} stroke="var(--ds-surface)" strokeWidth={2} pointerEvents="none" />
              );
            })}
            <circle cx={C} cy={C} r={R0 - 2} fill="var(--ds-surface)" stroke="var(--ds-line)" />
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-live="polite">
            {hover !== null && (
              <div className="translate-y-[-120%] rounded-xl border border-line bg-surface px-3 py-2 text-center shadow-lift">
                <p className="text-xs text-muted">{LIFE_SPHERES[hover]!.name}</p>
                <p className="text-lg font-semibold tabular-nums">
                  {current[LIFE_SPHERES[hover]!.id]}
                  <span className="text-xs text-muted">/10</span>
                  {showBaseline && (
                    <span className="ml-2 text-xs text-muted">began {baseline![LIFE_SPHERES[hover]!.id]}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {!table && (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
          {LIFE_SPHERES.map((s, i) => (
            <li
              key={s.id}
              className={cn("flex items-center gap-1.5 rounded-md px-1 py-0.5 text-muted", hover === i && "bg-surface-2 text-ink")}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            >
              <span className="size-2 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="truncate">{s.name}</span>
              <span className="ml-auto font-semibold tabular-nums text-ink">{current[s.id]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
