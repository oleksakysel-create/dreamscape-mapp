import { create } from 'zustand'

export type Tab = 'today' | 'journey' | 'board'
export type SheetState =
  | { type: 'addStep'; month: number; title?: string }
  | { type: 'step'; id: string }
  | { type: 'attach'; month: number }
  | { type: 'share'; month: number }
  | { type: 'partner'; month: number }
  | null

interface UI {
  tab: Tab
  chapter: number | null
  profile: boolean
  studio: number | null
  sheet: SheetState
  /** Success stories: the list (hub) and/or the story being watched */
  stories: { hub: boolean; play: number | null }
  /** “Your year in memories” film */
  memories: boolean
  toast: { title: string; sub?: string } | null
  setTab: (t: Tab) => void
  openChapter: (m: number | null) => void
  openProfile: (v: boolean) => void
  openStudio: (m: number | null) => void
  openSheet: (s: SheetState) => void
  notify: (title: string, sub?: string) => void
  openStories: (s: { hub: boolean; play: number | null }) => void
  openMemories: (v: boolean) => void
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useUI = create<UI>((set) => ({
  tab: 'today',
  chapter: null,
  profile: false,
  studio: null,
  sheet: null,
  toast: null,
  stories: { hub: false, play: null },
  openStories: (stories) => set({ stories }),
  memories: false,
  openMemories: (memories) => set({ memories }),
  setTab: (tab) => set({ tab, chapter: null, profile: false }),
  openChapter: (chapter) => set({ chapter }),
  openProfile: (profile) => set({ profile }),
  openStudio: (studio) => set({ studio }),
  openSheet: (sheet) => set({ sheet }),
  notify: (title, sub) => {
    clearTimeout(toastTimer)
    set({ toast: { title, sub } })
    toastTimer = setTimeout(() => set({ toast: null }), 2600)
  },
}))

export const haptic = (ms = 8) => {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* unsupported */
  }
}
