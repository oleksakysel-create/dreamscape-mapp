import { ACHIEVEMENTS } from "@/lib/data/achievements";
import { SPHERE_IDS } from "@/lib/data/spheres";
import type { JourneyData } from "@/lib/store/types";

export function isChapterComplete(data: Pick<JourneyData, "reflections" | "colorings">, month: number) {
  return Boolean(data.reflections[month]?.completedAt && data.colorings[month]?.completedAt);
}

export function completedChapters(data: Pick<JourneyData, "reflections" | "colorings">): number[] {
  return Array.from({ length: 12 }, (_, i) => i + 1).filter((m) => isChapterComplete(data, m));
}

const RULES: Record<string, (d: JourneyData) => boolean> = {
  "first-step": (d) => Boolean(d.profile),
  "self-aware": (d) => d.assessments.some((a) => SPHERE_IDS.every((id) => typeof a.scores[id] === "number")),
  compass: (d) => Object.values(d.priorities).some((t) => t === "focus"),
  "north-star": (d) => Object.values(d.goals).some((g) => g && g.title.trim().length > 0),
  "first-reflection": (d) => Object.values(d.reflections).some((r) => r.completedAt),
  planner: (d) => d.actions.length > 0,
  doer: (d) => d.actions.some((a) => a.doneAt),
  "first-stroke": (d) => Object.values(d.colorings).some((c) => Object.keys(c.fills).length > 0),
  masterpiece: (d) => Object.values(d.colorings).some((c) => c.completedAt),
  season: (d) => completedChapters(d).length >= 3,
  halfway: (d) => completedChapters(d).length >= 6,
  evolving: (d) => d.prioritiesUpdatedCount > 0,
  "full-circle": (d) => completedChapters(d).length >= 12,
};

/** Returns IDs of achievements that are earned by `data` but not yet recorded. */
export function newlyEarned(data: JourneyData): string[] {
  return ACHIEVEMENTS.filter((a) => !data.achievements[a.id] && RULES[a.id]?.(data)).map((a) => a.id);
}
