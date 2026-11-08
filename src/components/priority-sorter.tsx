"use client";

import { Wand2 } from "lucide-react";
import { SphereIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { LIFE_SPHERES, MAX_FOCUS, PRIORITY_TIERS, type PriorityTier, type SphereId } from "@/lib/data/spheres";
import type { Scores } from "@/lib/store/types";
import { cn } from "@/lib/utils";

type Map = Partial<Record<SphereId, PriorityTier>>;

export function suggestPriorities(scores: Scores | null): Map {
  const sorted = [...LIFE_SPHERES].sort((a, b) => (scores?.[a.id] ?? 5) - (scores?.[b.id] ?? 5));
  return Object.fromEntries(sorted.map((s, i) => [s.id, i < MAX_FOCUS ? "focus" : i < 8 ? "maintain" : "backlog"]));
}

export function PrioritySorter({ value, onChange, scores }: { value: Map; onChange: (v: Map) => void; scores: Scores | null }) {
  const focusCount = Object.values(value).filter((t) => t === "focus").length;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          {PRIORITY_TIERS.map((t) => (
            <span key={t.id} className="rounded-full bg-surface-2 px-3 py-1 text-muted">
              <b className="text-ink">{t.label}</b> · {Object.values(value).filter((v) => v === t.id).length}
              {t.id === "focus" && `/${MAX_FOCUS}`}
            </span>
          ))}
        </div>
        {scores && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(suggestPriorities(scores))}>
            <Wand2 /> Suggest from my ratings
          </Button>
        )}
      </div>
      <ul className="grid gap-2 md:grid-cols-2">
        {LIFE_SPHERES.map((s) => {
          const tier = value[s.id] ?? "maintain";
          return (
            <li key={s.id} className={cn("flex items-center gap-3 rounded-2xl border bg-surface p-3 transition", tier === "focus" ? "border-primary/50 shadow-soft" : "border-line")}>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl" style={{ background: `${s.color}22`, color: s.color }}>
                <SphereIcon id={s.id} className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{s.name}</p>
                {scores && <p className="text-xs text-muted">Rated {scores[s.id]}/10</p>}
              </div>
              <div className="flex shrink-0 rounded-full bg-surface-2 p-1" role="radiogroup" aria-label={`${s.name} priority`}>
                {PRIORITY_TIERS.map((t) => {
                  const disabled = t.id === "focus" && tier !== "focus" && focusCount >= MAX_FOCUS;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={tier === t.id}
                      disabled={disabled}
                      data-testid={`tier-${s.id}-${t.id}`}
                      title={disabled ? `You can focus on up to ${MAX_FOCUS} spheres` : t.description}
                      onClick={() => onChange({ ...value, [s.id]: t.id })}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-35",
                        tier === t.id
                          ? t.id === "focus"
                            ? "bg-primary text-primary-ink shadow-soft"
                            : t.id === "maintain"
                              ? "bg-sage text-white shadow-soft"
                              : "bg-surface text-ink shadow-soft"
                          : "text-muted hover:text-ink",
                      )}
                    >
                      {t.id === "focus" ? "Focus" : t.id === "maintain" ? "Maintain" : "Later"}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
