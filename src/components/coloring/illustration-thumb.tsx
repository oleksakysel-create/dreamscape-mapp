import { memo } from "react";
import { getIllustration } from "@/lib/coloring/illustrations";
import type { Fills } from "@/lib/coloring/types";
import { cn } from "@/lib/utils";

export const IllustrationThumb = memo(function IllustrationThumb({ imageId, fills = {}, className }: { imageId: string; fills?: Fills; className?: string }) {
  const ill = getIllustration(imageId);
  if (!ill) return null;
  return (
    <svg viewBox={ill.viewBox} className={cn("block size-full bg-white", className)} aria-hidden>
      {ill.regions.map((r) => (
        <path key={r.id} d={r.d} fill={fills[r.id] ?? "#fff"} fillRule={r.evenOdd ? "evenodd" : undefined} stroke="#5b4f49" strokeWidth={1.6} strokeLinejoin="round" />
      ))}
    </svg>
  );
});
