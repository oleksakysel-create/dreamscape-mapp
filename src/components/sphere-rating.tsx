"use client";

import { SphereIcon } from "@/components/icons";
import { Slider } from "@/components/ui/slider";
import { LIFE_SPHERES, type SphereId } from "@/lib/data/spheres";
import type { Scores } from "@/lib/store/types";

const WORDS = ["", "Struggling", "Struggling", "Low", "Low", "Okay", "Okay", "Good", "Good", "Thriving", "Thriving"];

export function SphereRatingList({ scores, onChange }: { scores: Scores; onChange: (id: SphereId, v: number) => void }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {LIFE_SPHERES.map((s) => (
        <li key={s.id} className="rounded-2xl border border-line bg-surface p-4" data-testid={`rating-${s.id}`}>
          <div className="mb-2 flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl" style={{ background: `${s.color}22`, color: s.color }}>
              <SphereIcon id={s.id} className="size-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">{s.name}</p>
              <p className="truncate text-xs text-muted">{s.description}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-semibold tabular-nums leading-none" data-testid={`score-${s.id}`}>
                {scores[s.id]}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted">{WORDS[scores[s.id]]}</p>
            </div>
          </div>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[scores[s.id]]}
            onValueChange={([v]) => onChange(s.id, v ?? 5)}
            color={s.color}
            thumbLabel={`${s.name} rating`}
          />
        </li>
      ))}
    </ul>
  );
}
