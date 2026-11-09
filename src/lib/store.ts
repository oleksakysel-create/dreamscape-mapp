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
  /** The dream came true */
  fulfilledAt?: string
  /** "idb:<key>" or a URL */
  photo?: string
  memo?: string
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
  fulfill: (month: number, f: { date: string; photo?: string; memo?: string }) => void
  unfulfill: (month: number) => void
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
        fulfill: (month, f) => patchChapter(month, { fulfilledAt: f.date, photo: f.photo ?? chapterOf(get(), month).photo, memo: f.memo }),
        unfulfill: (month) => patchChapter(month, { fulfilledAt: undefined, photo: undefined, memo: undefined }),
        setRealisticBrush: (realisticBrush) => set({ realisticBrush }),
        load: (d) => set({ ...empty(), ...d }),
        reset: () => set(empty()),
      }
    },
    {
      name: 'dreamscape-v3',
      version: 3,
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

export type StageId = 'thoughts' | 'plan' | 'create' | 'result'
export const STAGES: { id: StageId; label: string }[] = [
  { id: 'thoughts', label: 'Thoughts' },
  { id: 'plan', label: 'Plan' },
  { id: 'create', label: 'Create' },
  { id: 'result', label: 'Result' },
]

/** Where the user is in a chapter. Nothing is mandatory; this only guides the next suggestion. */
export function chapterStages(d: Pick<Data, 'chapters' | 'steps'>, month: number) {
  const c = chapterOf(d, month)
  const steps = d.steps.filter((s) => s.month === month)
  const done = steps.filter((s) => s.status === 'done' || s.status === 'partly').length
  return {
    thoughts: Boolean(c.reflectedAt),
    plan: steps.length > 0,
    create: done > 0,
    result: Boolean(c.fulfilledAt),
    steps: steps.length,
    done,
    coloring: coloringProgress(d, month),
  }
}

export function nextStage(d: Pick<Data, 'chapters' | 'steps'>, month: number): StageId {
  const s = chapterStages(d, month)
  if (!s.thoughts) return 'thoughts'
  if (!s.plan) return 'plan'
  if (!s.create) return 'create'
  return 'result'
}

export const isFulfilled = (d: Pick<Data, 'chapters'>, month: number) => Boolean(chapterOf(d, month).fulfilledAt)

/** The dream in the person's own words (empty until they write it). */
export function phraseOf(d: Pick<Data, 'chapters'>, month: number) {
  const t = THEMES[month - 1]!
  return (chapterOf(d, month).answers[t.dreamQuestion] ?? '').trim()
}

export const firstOfMonth = (d = new Date()) => ymd(new Date(d.getFullYear(), d.getMonth(), 1))
