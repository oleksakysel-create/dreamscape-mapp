import { getMonth, personalizePrompt } from "@/lib/data/months";
import { getSphere, LIFE_SPHERES, SPHERE_IDS, type SphereId } from "@/lib/data/spheres";
import type { JourneyData, Scores } from "@/lib/store/types";

export const defaultScores = (): Scores =>
  Object.fromEntries(SPHERE_IDS.map((id) => [id, 5])) as Scores;

export function latestScores(d: Pick<JourneyData, "assessments">): Scores | null {
  return d.assessments[d.assessments.length - 1]?.scores ?? null;
}

export function firstScores(d: Pick<JourneyData, "assessments">): Scores | null {
  return d.assessments[0]?.scores ?? null;
}

export function focusSpheres(d: Pick<JourneyData, "priorities">): SphereId[] {
  return LIFE_SPHERES.filter((s) => d.priorities[s.id] === "focus").map((s) => s.id);
}

export function personalization(d: Pick<JourneyData, "profile" | "priorities" | "goals">, month: number) {
  const focus = focusSpheres(d);
  // Rotate through focus areas month by month so prompts stay fresh.
  const sphereId = focus.length ? focus[(month - 1) % focus.length]! : undefined;
  return {
    name: d.profile?.name ?? "",
    focus: sphereId ? getSphere(sphereId).name : "",
    goal: (sphereId && d.goals[sphereId]?.title) || "",
    sphereId,
  };
}

export function personalizedTasks(d: Pick<JourneyData, "profile" | "priorities" | "goals">, month: number) {
  const chapter = getMonth(month);
  if (!chapter) return [];
  const ctx = personalization(d, month);
  return chapter.tasks.map((t) => ({ ...t, text: personalizePrompt(t.prompt, ctx) }));
}

export interface ChapterStatus {
  reflection: "none" | "started" | "done";
  actions: number;
  coloring: "none" | "chosen" | "started" | "done";
  progress: number; // 0..1 across the three parts
}

export function chapterStatus(d: Pick<JourneyData, "reflections" | "actions" | "colorings">, month: number): ChapterStatus {
  const r = d.reflections[month];
  const c = d.colorings[month];
  const reflection = r?.completedAt ? "done" : r && Object.values(r.answers).some(Boolean) ? "started" : "none";
  const coloring = c?.completedAt ? "done" : c && Object.keys(c.fills).length ? "started" : c ? "chosen" : "none";
  const actions = d.actions.filter((a) => a.month === month).length;
  const progress =
    ((reflection === "done" ? 1 : reflection === "started" ? 0.5 : 0) +
      (actions > 0 ? 1 : 0) +
      (coloring === "done" ? 1 : coloring === "started" ? 0.5 : coloring === "chosen" ? 0.2 : 0)) /
    3;
  return { reflection, actions, coloring, progress };
}
