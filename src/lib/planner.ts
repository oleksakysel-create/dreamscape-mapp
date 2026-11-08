/**
 * The balance engine: finds time for what matters inside a real week.
 *
 * The user chooses how much time per week they give themselves and the
 * windows when it fits around obligations (weekday mornings, weekend days…).
 * The budget is spread across those windows; plan steps are placed into the
 * earliest window with room. If the week is full, nothing is crammed in —
 * the step moves to next week instead.
 */
import { addDays, isWeekend, parseYmd, startOfDay, startOfWeek, ymd } from './dates'

export type WindowId = 'wd-morning' | 'wd-lunch' | 'wd-evening' | 'we-morning' | 'we-day'

export const WINDOWS: { id: WindowId; label: string; short: string; time: string; weekend: boolean }[] = [
  { id: 'wd-morning', label: 'Утро в будни', short: 'утро', time: '07:30', weekend: false },
  { id: 'wd-lunch', label: 'Обед в будни', short: 'обед', time: '13:00', weekend: false },
  { id: 'wd-evening', label: 'Вечер в будни', short: 'вечер', time: '20:30', weekend: false },
  { id: 'we-morning', label: 'Утро выходных', short: 'утро', time: '10:00', weekend: true },
  { id: 'we-day', label: 'День выходных', short: 'день', time: '15:00', weekend: true },
]
export const windowOf = (id: WindowId) => WINDOWS.find((w) => w.id === id)!

export type StepStatus = 'planned' | 'done' | 'partly' | 'released'
export type Horizon = 'week' | 'month' | 'someday'

export interface Step {
  id: string
  month: number
  title: string
  minutes: number
  horizon: Horizon
  date?: string
  window?: WindowId
  status: StepStatus
  result?: string
  doneAt?: string
  createdAt: string
}

export interface Budget {
  weeklyMinutes: number
  windows: WindowId[]
}

export interface Slot {
  date: string
  window: WindowId
  capacity: number
  used: number
}

const counts = (s: Step) => s.status !== 'released'

/** All slots of the week starting at `weekStart`, with capacity and current load. */
export function weekSlots(budget: Budget, steps: readonly Step[], weekStart: Date): Slot[] {
  const raw: { date: string; window: WindowId }[] = []
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i)
    for (const w of WINDOWS) if (budget.windows.includes(w.id) && w.weekend === isWeekend(d)) raw.push({ date: ymd(d), window: w.id })
  }
  if (!raw.length) return []
  const capacity = Math.max(15, Math.round(budget.weeklyMinutes / raw.length / 5) * 5)
  return raw.map((s) => ({
    ...s,
    capacity,
    used: steps.filter((st) => counts(st) && st.date === s.date && st.window === s.window).reduce((a, st) => a + st.minutes, 0),
  }))
}

export function weekLoad(budget: Budget, steps: readonly Step[], weekStart: Date) {
  const start = ymd(weekStart)
  const end = ymd(addDays(weekStart, 6))
  const inWeek = steps.filter((s) => counts(s) && s.date && s.date >= start && s.date <= end)
  return {
    budget: budget.weeklyMinutes,
    planned: inWeek.reduce((a, s) => a + s.minutes, 0),
    done: inWeek.filter((s) => s.status === 'done' || s.status === 'partly').reduce((a, s) => a + s.minutes, 0),
    steps: inWeek,
  }
}

/**
 * Earliest slot (today or later) with room for `minutes`, this week first,
 * then up to `weeksAhead` following weeks. Steps longer than a slot take the
 * first empty slot. Returns null when nothing fits.
 */
export function findSlot(budget: Budget, steps: readonly Step[], minutes: number, now = new Date(), weeksAhead = 4) {
  const today = ymd(startOfDay(now))
  for (let w = 0; w <= weeksAhead; w++) {
    const weekStart = addDays(startOfWeek(now), w * 7)
    const load = weekLoad(budget, steps, weekStart)
    if (load.planned + minutes > budget.weeklyMinutes && minutes <= budget.weeklyMinutes) continue
    const slots = weekSlots(budget, steps, weekStart).filter((s) => s.date >= today)
    const fit = slots.find((s) => s.capacity - s.used >= minutes) ?? slots.find((s) => s.used === 0)
    if (fit) return { date: fit.date, window: fit.window, weekOffset: w }
  }
  return null
}

export const stepTime = (s: Pick<Step, 'date' | 'window'>) => {
  if (!s.date) return null
  const d = parseYmd(s.date)
  const [h, m] = (s.window ? windowOf(s.window).time : '09:00').split(':').map(Number)
  d.setHours(h ?? 9, m ?? 0)
  return d
}
