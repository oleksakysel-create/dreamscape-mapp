import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getArtwork } from '../art'
import { THEMES } from '../data/themes'
import { ymd } from './dates'
import { findSlot, type Budget, type Horizon, type Step, type StepStatus, type WindowId } from './planner'

export interface Profile extends Budget {
  name: string
  /** First day of the month the 12 chapters start from (YYYY-MM-DD) */
  start: string
}

export interface Chapter {
  answers: Record<string, string>
  reflectedAt?: string
  closingNote?: string
  fills: Record<string, string>
  coloredAt?: string
}

export interface Data {
  profile: Profile | null
  chapters: Record<number, Chapter>
  steps: Step[]
  realisticBrush: boolean
  demo: boolean
}

export interface NewStep {
  month: number
  title: string
  minutes: number
  horizon: Horizon
  date?: string
  window?: WindowId
}

interface Actions {
  finishOnboarding: (p: Profile) => void
  updateProfile: (p: Partial<Profile>) => void
  saveAnswers: (month: number, answers: Record<string, string>) => void
  finishReflection: (month: number) => void
  reopenReflection: (month: number) => void
  addStep: (s: NewStep) => Step
  updateStep: (id: string, patch: Partial<Step>) => void
  logResult: (id: string, status: StepStatus, result?: string) => void
  reschedule: (id: string) => Step | undefined
  removeStep: (id: string) => void
  setClosingNote: (month: number, note: string) => void
  setFills: (month: number, fills: Record<string, string>) => void
  completeColoring: (month: number) => void
  setRealisticBrush: (v: boolean) => void
  load: (d: Data) => void
  reset: () => void
}

const empty = (): Data => ({ profile: null, chapters: {}, steps: [], realisticBrush: false, demo: false })
const blank = (): Chapter => ({ answers: {}, fills: {} })
const now = () => new Date().toISOString()
const uid = () => `s_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

export const useStore = create<Data & Actions>()(
  persist(
    (set, get) => {
      const patchChapter = (month: number, patch: Partial<Chapter>) =>
        set((s) => ({ chapters: { ...s.chapters, [month]: { ...blank(), ...s.chapters[month], ...patch } } }))
      return {
        ...empty(),
        finishOnboarding: (profile) => set({ profile, demo: false }),
        updateProfile: (p) => set((s) => (s.profile ? { profile: { ...s.profile, ...p } } : {})),
        saveAnswers: (month, answers) => patchChapter(month, { answers }),
        finishReflection: (month) => patchChapter(month, { reflectedAt: get().chapters[month]?.reflectedAt ?? now() }),
        reopenReflection: (month) => patchChapter(month, { reflectedAt: undefined }),
        addStep: (input) => {
          const { profile, steps } = get()
          let { date, window } = input
          if (!date && input.horizon === 'week' && profile) {
            const slot = findSlot(profile, steps, input.minutes)
            if (slot) ({ date, window } = slot)
          }
          const step: Step = { ...input, date, window, id: uid(), status: 'planned', createdAt: now() }
          set({ steps: [...steps, step] })
          return step
        },
        updateStep: (id, patch) => set((s) => ({ steps: s.steps.map((st) => (st.id === id ? { ...st, ...patch } : st)) })),
        logResult: (id, status, result) =>
          set((s) => ({
            steps: s.steps.map((st) =>
              st.id === id ? { ...st, status, result: result ?? st.result, doneAt: status === 'done' || status === 'partly' ? now() : undefined } : st,
            ),
          })),
        reschedule: (id) => {
          const { profile, steps } = get()
          const step = steps.find((s) => s.id === id)
          if (!step || !profile) return undefined
          const others = steps.filter((s) => s.id !== id)
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          const slot = findSlot(profile, others, step.minutes, tomorrow)
          const next: Step = { ...step, status: 'planned', horizon: 'week', date: slot?.date, window: slot?.window }
          if (!slot) next.horizon = 'someday'
          set({ steps: steps.map((s) => (s.id === id ? next : s)) })
          return next
        },
        removeStep: (id) => set((s) => ({ steps: s.steps.filter((st) => st.id !== id) })),
        setClosingNote: (month, closingNote) => patchChapter(month, { closingNote }),
        setFills: (month, fills) => patchChapter(month, { fills }),
        completeColoring: (month) => patchChapter(month, { coloredAt: get().chapters[month]?.coloredAt ?? now() }),
        setRealisticBrush: (realisticBrush) => set({ realisticBrush }),
        load: (d) => set({ ...empty(), ...d }),
        reset: () => set(empty()),
      }
    },
    {
      name: 'dreamscape-v2',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ profile, chapters, steps, realisticBrush, demo }) => ({ profile, chapters, steps, realisticBrush, demo }),
    },
  ),
)

/* ───────── derived helpers ───────── */

/** Stable empty chapter, so selectors never return a fresh object (avoids render loops). */
const EMPTY_CHAPTER: Chapter = Object.freeze({ answers: Object.freeze({}), fills: Object.freeze({}) }) as Chapter
export const chapterOf = (d: Pick<Data, 'chapters'>, month: number): Chapter => d.chapters[month] ?? EMPTY_CHAPTER

export function coloringProgress(d: Pick<Data, 'chapters'>, month: number) {
  const theme = THEMES[month - 1]!
  const art = getArtwork(theme.art)
  const fills = chapterOf(d, month).fills
  return art.regions.filter((r) => fills[r.id]).length / art.regions.length
}

export type StageId = 'reflect' | 'plan' | 'results' | 'color'

/** Where the user is in a chapter. Plan/results are encouraged, never required. */
export function chapterStages(d: Pick<Data, 'chapters' | 'steps'>, month: number) {
  const c = chapterOf(d, month)
  const steps = d.steps.filter((s) => s.month === month)
  const logged = steps.filter((s) => s.status !== 'planned').length
  return {
    reflect: Boolean(c.reflectedAt),
    plan: steps.length > 0,
    results: steps.length > 0 && logged === steps.length,
    color: Boolean(c.coloredAt),
    steps: steps.length,
    logged,
    coloring: coloringProgress(d, month),
  }
}

export function nextStage(d: Pick<Data, 'chapters' | 'steps'>, month: number): StageId | null {
  const s = chapterStages(d, month)
  if (!s.reflect) return 'reflect'
  if (!s.plan) return 'plan'
  if (!s.color) return 'color'
  if (!s.results) return 'results'
  return null
}

export const isChapterComplete = (d: Pick<Data, 'chapters' | 'steps'>, month: number) => {
  const s = chapterStages(d, month)
  return s.reflect && s.color
}

export const firstOfMonth = (d = new Date()) => ymd(new Date(d.getFullYear(), d.getMonth(), 1))
