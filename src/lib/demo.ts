import { getArtwork } from '../art'
import { THEMES } from '../data/themes'
import { addDays, startOfWeek, ymd } from './dates'
import type { Step } from './planner'
import type { Data } from './store'

const partial = (art: string, share: number) => {
  const a = getArtwork(art)
  const n = Math.round(a.regions.length * share)
  return Object.fromEntries(a.regions.slice(0, n).map((r) => [r.id, r.tone]))
}

/** A believable mid-journey: one dream already came true, the third chapter is in progress. */
export function demoData(today = new Date()): Data {
  const start = ymd(new Date(today.getFullYear(), today.getMonth() - 2, 1))
  const wk = startOfWeek(today)
  const iso = (d: Date) => d.toISOString()
  const past = (days: number) => iso(addDays(today, -days))
  const t = (m: number) => THEMES[m - 1]!
  const step = (s: Partial<Step> & Pick<Step, 'id' | 'month' | 'title' | 'minutes'>): Step => ({
    horizon: 'week', status: 'planned', createdAt: past(20), ...s,
  })
  return {
    demo: true,
    realisticBrush: false,
    profile: { name: 'Anna', start, weeklyMinutes: 240, windows: ['wd-morning', 'wd-evening', 'we-morning'] },
    chapters: {
      1: {
        answers: {
          [t(1).questions[0]!.id]: 'Work from 9 to 7, the commute, dinner, the kids. The only thing that’s mine is the morning coffee in silence.',
          [t(1).questions[1]!.id]: 'A bright house by the sea. Morning sun in the kitchen, a terrace for long dinners.',
          [t(1).questions[2]!.id]: '4',
          [t(1).questions[3]!.id]: 'Collect three listings and work out the budget',
        },
        reflectedAt: past(58),
        closingNote: 'The dream is more real than it looked — it needs a six-year plan.',
        fills: partial('villa', 1),
        coloredAt: past(40),
      },
      2: {
        answers: {
          [t(2).questions[0]!.id]: 'Three quiet days in the mountains. No laptop, no news — just the lake in the morning.',
          [t(2).questions[1]!.id]: 'Work chats in the evening and going to bed late.',
          [t(2).questions[2]!.id]: '5',
          [t(2).questions[3]!.id]: 'In bed before 11 pm',
        },
        reflectedAt: past(28),
        fills: partial('retreat', 0.6),
        fulfilledAt: past(9),
        photo: './demo/mountains.jpg',
        memo: 'Booked it in October, went in the first snow. I slept nine hours every night.',
      },
      3: {
        answers: {
          [t(3).questions[0]!.id]: 'Choosing a holiday calmly, without looking at the price first.',
          [t(3).questions[1]!.id]: 'Food delivery and subscriptions I never open.',
        },
        fills: partial('watch', 0.35),
      },
    },
    steps: [
      step({ id: 'd1', month: 1, title: 'Collect three listings and work out the budget', minutes: 60, date: ymd(addDays(wk, -50)), window: 'we-morning', status: 'done', result: 'Found three areas I like; the budget is clear.', doneAt: past(50) }),
      step({ id: 'd2', month: 2, title: 'In bed before 11 pm three nights', minutes: 30, date: ymd(addDays(wk, -20)), window: 'wd-evening', status: 'partly', result: 'Two nights out of three.', doneAt: past(20) }),
      step({ id: 'd3', month: 2, title: 'Book a weekend without your phone', minutes: 45, date: ymd(addDays(wk, -15)), window: 'we-morning', status: 'done', result: 'A cabin by the lake, first weekend of December.', doneAt: past(15) }),
      step({ id: 'd4', month: 3, title: 'Review subscriptions and regular spending', minutes: 45, date: ymd(addDays(wk, 1)), window: 'wd-evening' }),
      step({ id: 'd5', month: 3, title: 'Open a separate “Dream” account', minutes: 30, date: ymd(addDays(wk, 5)), window: 'we-morning' }),
      step({ id: 'd6', month: 3, title: 'Set up an automatic transfer on payday', minutes: 15, horizon: 'month' }),
    ],
  }
}
