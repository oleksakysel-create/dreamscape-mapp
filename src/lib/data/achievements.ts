export type AchievementIconName =
  | "Sprout"
  | "Compass"
  | "Target"
  | "Star"
  | "PenLine"
  | "CalendarCheck"
  | "Paintbrush"
  | "Palette"
  | "Flower2"
  | "Mountain"
  | "Sun"
  | "Crown"
  | "RefreshCw";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: AchievementIconName;
  /** Achievements celebrate effort; none of them punish absence. */
  category: "beginning" | "reflection" | "action" | "creativity" | "journey";
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: "first-step", title: "First Step", description: "Began your Dreamscape journey.", icon: "Sprout", category: "beginning" },
  { id: "self-aware", title: "Mirror, Mirror", description: "Rated all twelve life spheres.", icon: "Compass", category: "beginning" },
  { id: "compass", title: "True North", description: "Chose your core priorities.", icon: "Target", category: "beginning" },
  { id: "north-star", title: "North Star", description: "Wrote your first 12-month goal.", icon: "Star", category: "beginning" },
  { id: "first-reflection", title: "Inner Voice", description: "Completed your first reflection.", icon: "PenLine", category: "reflection" },
  { id: "planner", title: "Intentional", description: "Planned your first action.", icon: "CalendarCheck", category: "action" },
  { id: "doer", title: "Follow-Through", description: "Marked a planned action as done.", icon: "RefreshCw", category: "action" },
  { id: "first-stroke", title: "First Stroke", description: "Added your first splash of color.", icon: "Paintbrush", category: "creativity" },
  { id: "masterpiece", title: "Masterpiece", description: "Completed a coloring page.", icon: "Palette", category: "creativity" },
  { id: "season", title: "A Full Season", description: "Completed three monthly chapters.", icon: "Flower2", category: "journey" },
  { id: "halfway", title: "Halfway Summit", description: "Completed six monthly chapters.", icon: "Mountain", category: "journey" },
  { id: "evolving", title: "Evolving", description: "Updated your priorities with intention.", icon: "Sun", category: "reflection" },
  { id: "full-circle", title: "Full Circle", description: "Completed all twelve chapters.", icon: "Crown", category: "journey" },
];
