"use client";

import { Eraser, Pipette } from "lucide-react";
import { PALETTES } from "@/lib/coloring/palettes";
import { cn } from "@/lib/utils";

interface Props {
  color: string;
  eraser: boolean;
  paletteId: string;
  recent: string[];
  onColor: (c: string) => void;
  onEraser: () => void;
  onPalette: (id: string) => void;
}

export function PalettePicker({ color, eraser, paletteId, recent, onColor, onEraser, onPalette }: Props) {
  const palette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0]!;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Palettes">
        {PALETTES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={p.id === palette.id}
            onClick={() => onPalette(p.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              p.id === palette.id ? "border-ink bg-ink text-canvas" : "border-line bg-surface text-muted hover:text-ink",
            )}
          >
            <span className="flex -space-x-1">
              {p.colors.slice(1, 4).map((c) => (
                <span key={c} className="size-3 rounded-full ring-2 ring-surface" style={{ background: c }} />
              ))}
            </span>
            {p.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="Colors">
        {palette.colors.map((c) => {
          const active = !eraser && c.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={c}
              role="radio"
              aria-checked={active}
              aria-label={`Color ${c}`}
              data-color={c}
              onClick={() => onColor(c)}
              className={cn(
                "aspect-square rounded-full shadow-soft ring-offset-2 ring-offset-surface transition hover:scale-105",
                active ? "scale-110 ring-[3px] ring-ink" : "ring-1 ring-black/5",
              )}
              style={{ background: c }}
            />
          );
        })}
        <label
          className="relative grid aspect-square cursor-pointer place-items-center rounded-full bg-[conic-gradient(#f4b6c2,#f6c6a8,#e9b949,#9db98a,#8fbcd4,#c3b6dd,#f4b6c2)] shadow-soft ring-1 ring-black/5 hover:scale-105"
          title="Custom color"
        >
          <Pipette className="size-4 text-ink/70" />
          <input type="color" value={color} onChange={(e) => onColor(e.target.value.toUpperCase())} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Custom color" />
        </label>
        <button
          onClick={onEraser}
          aria-pressed={eraser}
          aria-label="Eraser"
          className={cn("grid aspect-square place-items-center rounded-full border border-line bg-surface shadow-soft transition hover:scale-105", eraser && "ring-[3px] ring-ink ring-offset-2 ring-offset-surface")}
        >
          <Eraser className="size-4" />
        </button>
      </div>
      {recent.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Recent</span>
          {recent.map((c) => (
            <button key={c} aria-label={`Recent color ${c}`} onClick={() => onColor(c)} className="size-6 rounded-full ring-1 ring-black/10 transition hover:scale-110" style={{ background: c }} />
          ))}
        </div>
      )}
    </div>
  );
}
