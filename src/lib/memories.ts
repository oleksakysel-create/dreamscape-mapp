import { THEMES } from '../data/themes'
import { chapterOf, dreamOf, type Data } from './store'

export type Memory =
  | { kind: 'photo'; id: string; month: number; photo: string; title: string; text?: string; date: string }
  | { kind: 'thought'; id: string; month: number; text: string; source: string; date: string }

const shuffle = <T,>(xs: T[], rand: () => number) => {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/** “3 months ago”, Facebook-memories style. */
export function agoLabel(iso: string, now = new Date()) {
  const d = new Date(iso)
  const m = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth()
  if (m <= 0) return 'This month'
  if (m === 1) return 'A month ago'
  if (m >= 12) return 'A year ago'
  return `${m} months ago`
}

/**
 * The year played back: every dream that came true (with its photo) and a
 * random handful of the important things written along the way. Different
 * every time it's played.
 */
export function buildMemories(d: Pick<Data, 'chapters' | 'steps' | 'profile'>, rand = Math.random): Memory[] {
  const photos: Memory[] = []
  const thoughts: Memory[] = []
  const fallback = d.profile?.start ?? new Date().toISOString()
  for (const t of THEMES) {
    const c = chapterOf(d, t.month)
    if (c.fulfilledAt && c.photo) photos.push({ kind: 'photo', id: `p${t.month}`, month: t.month, photo: c.photo, title: dreamOf(d, t.month), text: c.memo, date: c.fulfilledAt })
    const when = c.reflectedAt ?? fallback
    for (const q of t.questions) {
      const a = (c.answers[q.id] ?? '').trim()
      if (q.kind === 'text' && a.length >= 28) thoughts.push({ kind: 'thought', id: q.id, month: t.month, text: a, source: q.prompt, date: when })
    }
    if (c.closingNote && c.closingNote.trim().length > 15)
      thoughts.push({ kind: 'thought', id: `n${t.month}`, month: t.month, text: c.closingNote.trim(), source: 'What this month changed', date: when })
  }
  for (const s of d.steps)
    if (s.result && s.result.trim().length >= 15 && s.doneAt) thoughts.push({ kind: 'thought', id: s.id, month: s.month, text: s.result.trim(), source: `After “${s.title}”`, date: s.doneAt })

  const ps = shuffle(photos, rand).slice(0, 5)
  const ts = shuffle(thoughts, rand).slice(0, Math.max(4, ps.length + 1))
  // photo, thought, thought, photo… so the film breathes
  const out: Memory[] = []
  while (ps.length || ts.length) {
    if (ts.length) out.push(ts.shift()!)
    if (ps.length) out.push(ps.shift()!)
    if (ts.length && out.length % 3 === 2) out.push(ts.shift()!)
  }
  return out
}

/** Memories unlock when chapter 12's thoughts are saved (or right away in the example). */
export const memoriesReady = (d: Pick<Data, 'chapters' | 'demo'>) => d.demo || Boolean(chapterOf(d, 12).reflectedAt)
