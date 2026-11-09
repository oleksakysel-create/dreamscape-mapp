import { getArtwork } from '../art'
import { THEMES } from '../data/themes'
import { addDays, startOfWeek, ymd } from './dates'
import type { Step } from './planner'
import type { Chapter, Data } from './store'

const partial = (art: string, share: number) => {
  const a = getArtwork(art)
  const n = Math.round(a.regions.length * share)
  return Object.fromEntries(a.regions.slice(0, n).map((r) => [r.id, r.tone]))
}

/**
 * A believable journey nine months in: three dreams already came true
 * (with real photos), the rest live as the person's own words.
 */
export function demoData(today = new Date()): Data {
  const start = new Date(today.getFullYear(), today.getMonth() - 9, 1)
  const day = (m: number, d: number) => {
    const x = new Date(start.getFullYear(), start.getMonth() + m - 1, d, 10)
    return x > today ? today : x
  }
  const iso = (d: Date) => d.toISOString()
  const wk = startOfWeek(today)
  const t = (m: number) => THEMES[m - 1]!
  const q = (m: number, i: number) => t(m).questions[i]!.id

  const ch = (m: number, answers: string[], extra: Partial<Chapter> = {}): Chapter => ({
    answers: Object.fromEntries(answers.map((a, i) => [q(m, i), a]).filter(([, a]) => a)),
    reflectedAt: iso(day(m, 6)),
    fills: {},
    ...extra,
  })

  const step = (s: Partial<Step> & Pick<Step, 'id' | 'month' | 'title' | 'minutes'>): Step => ({
    horizon: 'week', status: 'done', createdAt: iso(day(s.month, 7)), ...s,
  })
  const doneOn = (m: number, d: number, window: Step['window'] = 'we-morning') => ({ date: ymd(day(m, d)), window, doneAt: iso(day(m, d)) })

  return {
    demo: true,
    realisticBrush: false,
    profile: { name: 'Anna', start: ymd(start), weeklyMinutes: 240, windows: ['wd-morning', 'wd-evening', 'we-morning'] },
    chapters: {
      1: ch(1, [
        'Work from 9 to 7, the commute, dinner, the kids. The only thing that’s mine is the morning coffee in silence.',
        'A bright house by the sea. Morning sun in the kitchen, a terrace for long dinners.',
        '4',
        'Collect three listings and work out the budget',
      ], { fills: partial('villa', 1), coloredAt: iso(day(1, 20)), closingNote: 'The dream is more real than it looked — it needs a six-year plan.' }),
      2: ch(2, [
        'Three quiet days in the mountains. No laptop, no news — just the lake in the morning.',
        'Work chats in the evening and going to bed late.',
        '5',
        'In bed before 11 pm',
      ], { fills: partial('retreat', 0.6) }),
      3: ch(3, [
        'Choosing a holiday calmly, without looking at the price first.',
        'Food delivery and subscriptions I never open.',
        '6',
        '300 a month into a separate account',
      ]),
      4: ch(4, [
        'Madeira in spring — black sand, green cliffs and the ocean all to myself.',
        'Telling myself there would be a better time.',
        'The first week of April',
      ], {
        title: 'Madeira',
        fulfilledAt: iso(day(7, 4)),
        photo: './demo/beach.jpg',
        memo: 'Five days, no notifications. I ran into the ocean every single morning.',
        fills: partial('islands', 1),
        coloredAt: iso(day(4, 22)),
      }),
      5: ch(5, ['My sister, my kids, two old friends.', 'More Sunday dinners with my sister and her kids.', '7', 'Call Lena on Sunday']),
      6: ch(6, [
        'A car I chose for myself — not the sensible one. The keys in my hand by summer.',
        'That it’s an indulgence at my age.',
        'Book a test drive this Saturday',
      ], {
        title: 'My own car',
        fulfilledAt: iso(day(8, 16)),
        photo: './demo/dream-car.jpg',
        memo: 'Picked it up on a Tuesday after work. Still can’t stop smiling.',
      }),
      7: ch(7, ['A day on the water with friends, nobody checking their phones.', 'The school run on Wednesdays — my partner can take it.', '6', 'Hand over the Wednesday school run']),
      8: ch(8, ['Building a small studio people love working with.', 'Joy: making things. Only money: the reports.', '6', 'Two hours a week on my own project']),
      9: ch(9, [
        'Ballet. I always said I’d go “one day”.',
        'A box at the Mariinsky, a glass of champagne and Swan Lake.',
        'Buy the tickets the day they go on sale',
      ], {
        title: 'A night at the ballet',
        fulfilledAt: iso(day(9, 24)),
        photo: './demo/ballet.jpg',
        memo: 'Second tier, Swan Lake. It felt like stepping into another century.',
      }),
      10: {
        answers: {
          [q(10, 0)]: 'Time. I’d take one whole weekday a month just for myself.',
          [q(10, 1)]: 'Flying anywhere I like, whenever I like.',
          [q(10, 3)]: 'One spontaneous trip a year — booked on a Friday, gone by Saturday.',
        },
        fills: partial('jet', 0.3),
      },
    },
    steps: [
      step({ id: 'd1', month: 1, title: 'Collect three listings and work out the budget', minutes: 60, ...doneOn(1, 12), result: 'Three areas I like; the budget is clear.' }),
      step({ id: 'd2', month: 2, title: 'In bed before 11 pm three nights', minutes: 30, ...doneOn(2, 14, 'wd-evening'), status: 'partly', result: 'Two nights out of three.' }),
      step({ id: 'd3', month: 3, title: 'Open a separate “Dream” account', minutes: 30, ...doneOn(3, 9) }),
      step({ id: 'd4', month: 4, title: 'Pick dates and book the time off', minutes: 30, ...doneOn(4, 8, 'wd-morning'), result: 'First week of April, approved.' }),
      step({ id: 'd5', month: 4, title: 'Compare three flight and stay options', minutes: 60, ...doneOn(4, 13) }),
      step({ id: 'd6', month: 6, title: 'Book a test drive of the dream car', minutes: 90, ...doneOn(6, 11), result: 'Drove it. Knew immediately.' }),
      step({ id: 'd7', month: 6, title: 'Work out the real cost of owning one', minutes: 45, ...doneOn(6, 15, 'wd-evening') }),
      step({ id: 'd8', month: 9, title: 'Buy the tickets the day they go on sale', minutes: 15, ...doneOn(9, 3, 'wd-morning'), result: 'Box seats, second tier.' }),
      step({ id: 'd9', month: 10, title: 'Break the big goal into three stages', minutes: 45, status: 'planned', date: ymd(addDays(wk, 1)), window: 'wd-evening', createdAt: iso(addDays(today, -3)) }),
      step({ id: 'd10', month: 10, title: 'Find a community with similar goals', minutes: 30, status: 'planned', date: ymd(addDays(wk, 5)), window: 'we-morning', createdAt: iso(addDays(today, -3)) }),
    ],
  }
}
