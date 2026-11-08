import type { JourneyData } from "./types";

export const initialData = (): JourneyData => ({
  version: 1,
  mode: null,
  profile: null,
  onboardedAt: null,
  assessments: [],
  priorities: {},
  prioritiesUpdatedCount: 0,
  goals: {},
  reflections: {},
  actions: [],
  colorings: {},
  achievements: {},
  settings: { analytics: true, reminders: true },
});

export function firstOfMonthISO(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
