"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { newlyEarned } from "@/lib/achievements";
import { track, type AnalyticsEvent, type AnalyticsProps } from "@/lib/analytics";
import type { Fills } from "@/lib/coloring/types";
import type { PriorityTier, SphereId } from "@/lib/data/spheres";
import { uid } from "@/lib/utils";
import { initialData } from "./initial";
import type { Goal, JourneyData, Mode, PlannedAction, Profile, ReflectionEntry, Scores, Settings } from "./types";

export interface JourneyActions {
  startJourney: (mode: Mode) => void;
  saveProfile: (profile: Profile) => void;
  saveAssessment: (scores: Scores, opts?: { replaceLatest?: boolean }) => void;
  setPriorities: (priorities: Partial<Record<SphereId, PriorityTier>>, opts?: { isUpdate?: boolean }) => void;
  saveGoals: (goals: Omit<Goal, "updatedAt">[]) => void;
  completeOnboarding: () => void;
  saveReflection: (month: number, answers: Record<string, string>, complete: boolean, summary?: ReflectionEntry["summary"]) => void;
  addAction: (action: Omit<PlannedAction, "id" | "createdAt">) => PlannedAction;
  toggleActionDone: (id: string) => void;
  removeAction: (id: string) => void;
  markNotified: (ids: string[]) => void;
  chooseColoring: (month: number, imageId: string) => void;
  setFills: (month: number, fills: Fills) => void;
  completeColoring: (month: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  hydrateFrom: (data: JourneyData) => void;
  dismissCelebration: () => void;
  reset: () => void;
}

export interface JourneyState extends JourneyData, JourneyActions {
  /** Transient queue of achievement IDs to celebrate (not persisted). */
  celebrate: string[];
}

const now = () => new Date().toISOString();

function pickData(s: JourneyState): JourneyData {
  const { version, mode, profile, onboardedAt, assessments, priorities, prioritiesUpdatedCount, goals, reflections, actions, colorings, achievements, settings } = s;
  return { version, mode, profile, onboardedAt, assessments, priorities, prioritiesUpdatedCount, goals, reflections, actions, colorings, achievements, settings };
}

export const useJourney = create<JourneyState>()(
  persist(
    (rawSet, get) => {
      /** Every mutation goes through here so achievements are evaluated in one place. */
      const set = (partial: Partial<JourneyData>, event?: [AnalyticsEvent, AnalyticsProps?]) => {
        rawSet(partial);
        if (event) track(event[0], { mode: get().mode ?? "guest", ...event[1] });
        const earned = newlyEarned(pickData(get()));
        if (earned.length) {
          const at = now();
          rawSet((s) => ({
            achievements: { ...s.achievements, ...Object.fromEntries(earned.map((id) => [id, at])) },
            celebrate: [...s.celebrate, ...earned],
          }));
          earned.forEach((id) => track("achievement_unlocked", { achievement_id: id }));
        }
      };

      return {
        ...initialData(),
        celebrate: [],

        startJourney: (mode) => set({ mode }, ["journey_started", { mode }]),

        saveProfile: (profile) => set({ profile }),

        saveAssessment: (scores, opts) => {
          const prev = opts?.replaceLatest ? get().assessments.slice(0, -1) : get().assessments;
          set({ assessments: [...prev, { id: uid("as"), takenAt: now(), scores }] }, ["assessment_saved"]);
        },

        setPriorities: (priorities, opts) =>
          set(
            {
              priorities,
              prioritiesUpdatedCount: get().prioritiesUpdatedCount + (opts?.isUpdate ? 1 : 0),
            },
            ["priorities_updated", { focus_count: Object.values(priorities).filter((t) => t === "focus").length }],
          ),

        saveGoals: (goals) => {
          // Goals are keyed by sphere and never deleted, so changing priorities can't lose them.
          const next = { ...get().goals };
          for (const g of goals) next[g.sphereId] = { ...g, updatedAt: now() };
          set({ goals: next }, ["goal_saved", { count: goals.length }]);
        },

        completeOnboarding: () => set({ onboardedAt: get().onboardedAt ?? now() }, ["onboarding_completed"]),

        saveReflection: (month, answers, complete, summary) => {
          const prev = get().reflections[month];
          const entry: ReflectionEntry = {
            month,
            answers,
            updatedAt: now(),
            completedAt: complete ? (prev?.completedAt ?? now()) : prev?.completedAt,
            summary: summary ?? prev?.summary,
          };
          set({ reflections: { ...get().reflections, [month]: entry } }, [
            complete ? "reflection_completed" : "reflection_saved",
            { month },
          ]);
        },

        addAction: (input) => {
          const action: PlannedAction = { ...input, id: uid("act"), createdAt: now() };
          set({ actions: [...get().actions, action] }, ["action_planned", { month: action.month, has_reminder: action.reminder }]);
          return action;
        },

        toggleActionDone: (id) => {
          let completed = false;
          const actions = get().actions.map((a) => {
            if (a.id !== id) return a;
            completed = !a.doneAt;
            return { ...a, doneAt: a.doneAt ? undefined : now() };
          });
          set({ actions }, completed ? ["action_completed"] : undefined);
        },

        removeAction: (id) => set({ actions: get().actions.filter((a) => a.id !== id) }),

        markNotified: (ids) =>
          set({ actions: get().actions.map((a) => (ids.includes(a.id) ? { ...a, notifiedAt: now() } : a)) }),

        chooseColoring: (month, imageId) => {
          const prev = get().colorings[month];
          if (prev?.imageId === imageId) return;
          set(
            { colorings: { ...get().colorings, [month]: { month, imageId, fills: {}, startedAt: now(), updatedAt: now() } } },
            ["coloring_selected", { month, image_id: imageId }],
          );
        },

        setFills: (month, fills) => {
          const prev = get().colorings[month];
          if (!prev) return;
          set({ colorings: { ...get().colorings, [month]: { ...prev, fills, updatedAt: now() } } });
        },

        completeColoring: (month) => {
          const prev = get().colorings[month];
          if (!prev || prev.completedAt) return;
          set(
            { colorings: { ...get().colorings, [month]: { ...prev, completedAt: now() } } },
            ["coloring_completed", { month, image_id: prev.imageId }],
          );
        },

        updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

        hydrateFrom: (data) => {
          rawSet({ ...initialData(), ...data, celebrate: [] });
        },

        dismissCelebration: () => rawSet((s) => ({ celebrate: s.celebrate.slice(1) })),

        reset: () => {
          track("data_reset");
          rawSet({ ...initialData(), celebrate: [] });
        },
      };
    },
    {
      name: "dreamscape-journey",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => pickData(s),
    },
  ),
);

export const selectData = (s: JourneyState): JourneyData => pickData(s);
