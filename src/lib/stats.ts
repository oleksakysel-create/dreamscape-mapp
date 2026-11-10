import { THEMES } from '../data/themes'
import { chapterFor, chapterMonthName, minutesLabel } from './dates'
import { chapterOf, chapterStages, type Data } from './store'

export interface MonthBar {
  month: number
  label: string
  long: string
  minutes: number | null // null = chapter not reached yet
}

/** Everything the Board overview shows, derived from the journey. */
export function overview(d: Data) {
  const start = d.profile!.start
  const now = chapterFor(start)
  const worked = d.steps.filter((s) => (s.status === 'done' || s.status === 'partly') && s.doneAt)

  const bars: MonthBar[] = THEMES.map((t) => {
    const long = chapterMonthName(start, t.month)
    return {
      month: t.month,
      label: long.slice(0, 3),
      long,
      minutes: t.month > now ? null : worked.filter((s) => chapterFor(start, new Date(s.doneAt!)) === t.month).reduce((a, s) => a + s.minutes, 0),
    }
  })

  const outcomes = [
    { id: 'done', label: 'Done', color: '#4A90D0', n: d.steps.filter((s) => s.status === 'done').length },
    { id: 'partly', label: 'Partly', color: '#BE8636', n: d.steps.filter((s) => s.status === 'partly').length },
    { id: 'released', label: 'Let go', color: '#9271CB', n: d.steps.filter((s) => s.status === 'released').length },
  ] as const

  const grid = THEMES.map((t) => {
    const st = chapterStages(d, t.month)
    return { month: t.month, title: t.title, cells: [st.thoughts, st.plan, st.create, st.result] }
  })

  const fulfilled = THEMES.filter((t) => chapterOf(d, t.month).fulfilledAt).length
  const totalMinutes = worked.reduce((a, s) => a + s.minutes, 0)
  const reflected = THEMES.filter((t) => chapterOf(d, t.month).reflectedAt).length
  const planned = d.steps.filter((s) => s.status === 'planned').length

  return {
    now,
    bars,
    outcomes,
    grid,
    kpis: [
      { id: 'fulfilled', label: 'Dreams came true', value: String(fulfilled), sub: 'of 12' },
      { id: 'time', label: 'Time for yourself', value: minutesLabel(totalMinutes), sub: 'logged' },
      { id: 'steps', label: 'Steps taken', value: String(outcomes[0].n + outcomes[1].n), sub: `${planned} planned` },
      { id: 'reflected', label: 'Chapters reflected', value: String(reflected), sub: 'of 12' },
    ],
  }
}
