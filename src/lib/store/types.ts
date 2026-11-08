import type { ReflectionSummary } from "@/lib/ai/summarize";
import type { Fills } from "@/lib/coloring/types";
import type { PriorityTier, SphereId } from "@/lib/data/spheres";

export type Mode = "guest" | "demo" | "account";

export const IDENTITIES = ["Explorer", "Creator", "Caregiver", "Builder", "Learner", "Dreamer"] as const;
export type Identity = (typeof IDENTITIES)[number];

export const AGE_RANGES = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+"] as const;
export type AgeRange = (typeof AGE_RANGES)[number];

export interface Profile {
  name: string;
  identity: Identity;
  pronouns: string;
  ageRange: AgeRange;
  /** ISO date the 12-chapter journey starts (first day of a month). */
  journeyStart: string;
}

export type Scores = Record<SphereId, number>;

export interface AssessmentSnapshot {
  id: string;
  takenAt: string;
  scores: Scores;
}

export interface Goal {
  sphereId: SphereId;
  title: string;
  why: string;
  firstStep: string;
  updatedAt: string;
}

export interface ReflectionEntry {
  month: number;
  answers: Record<string, string>;
  updatedAt: string;
  completedAt?: string;
  summary?: ReflectionSummary;
}

export interface PlannedAction {
  id: string;
  month: number;
  title: string;
  sphereId?: SphereId;
  /** YYYY-MM-DD local date */
  date: string;
  /** HH:MM local time */
  time: string;
  reminder: boolean;
  reminderMinutesBefore: number;
  notifiedAt?: string;
  doneAt?: string;
  createdAt: string;
}

export interface MonthlyColoring {
  month: number;
  imageId: string;
  fills: Fills;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Settings {
  analytics: boolean;
  reminders: boolean;
}

/** The persisted, serializable journey. Mirrors the Supabase schema 1:1. */
export interface JourneyData {
  version: 1;
  mode: Mode | null;
  profile: Profile | null;
  onboardedAt: string | null;
  assessments: AssessmentSnapshot[];
  priorities: Partial<Record<SphereId, PriorityTier>>;
  prioritiesUpdatedCount: number;
  goals: Partial<Record<SphereId, Goal>>;
  reflections: Record<number, ReflectionEntry>;
  actions: PlannedAction[];
  colorings: Record<number, MonthlyColoring>;
  achievements: Record<string, string>;
  settings: Settings;
}
