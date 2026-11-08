import { getArtwork } from '../art'
import { THEMES } from '../data/themes'
import { addDays, startOfWeek, ymd } from './dates'
import type { Step } from './planner'
import type { Data } from './store'

const realistic = (art: string, share = 1) => {
  const a = getArtwork(art)
  const n = Math.round(a.regions.length * share)
  return Object.fromEntries(a.regions.slice(0, n).map((r) => [r.id, r.tone]))
}

/** A believable mid-journey: two chapters done, the third in progress. */
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
    profile: { name: 'Анна', start, weeklyMinutes: 240, windows: ['wd-morning', 'wd-evening', 'we-morning'] },
    chapters: {
      1: {
        answers: {
          [t(1).questions[0]!.id]: 'Работа с 9 до 19, дорога, ужин, дети. Моё — только утренний кофе в тишине.',
          [t(1).questions[1]!.id]: 'Светлый дом у моря, панорамные окна, терраса и бассейн. Утром — солнце на кухне.',
          [t(1).questions[2]!.id]: '4',
          [t(1).questions[3]!.id]: 'Собрать подборку домов и посчитать бюджет',
        },
        reflectedAt: past(58),
        closingNote: 'Поняла, что мечта реальнее, чем казалось: нужен план на 6 лет.',
        fills: realistic('villa'),
        coloredAt: past(40),
      },
      2: {
        answers: {
          [t(2).questions[0]!.id]: 'В горах, в прошлом сентябре. Без ноутбука и новостей.',
          [t(2).questions[1]!.id]: 'Вечерние рабочие чаты и поздний сон.',
          [t(2).questions[2]!.id]: '5',
          [t(2).questions[3]!.id]: 'Ложиться до 23:00',
        },
        reflectedAt: past(28),
        fills: realistic('retreat'),
        coloredAt: past(12),
      },
      3: {
        answers: {
          [t(3).questions[0]!.id]: 'Спокойно выбрать отпуск, не глядя на цену.',
          [t(3).questions[1]!.id]: 'Доставка еды и подписки, которыми не пользуюсь.',
        },
        fills: realistic('watch', 0.35),
      },
    },
    steps: [
      step({ id: 'd1', month: 1, title: 'Собрать подборку домов и посчитать бюджет', minutes: 60, date: ymd(addDays(wk, -50)), window: 'we-morning', status: 'done', result: 'Нашла три района, бюджет ясен.', doneAt: past(50) }),
      step({ id: 'd2', month: 2, title: 'Ложиться до 23:00 три вечера', minutes: 30, date: ymd(addDays(wk, -20)), window: 'wd-evening', status: 'partly', result: 'Получилось два вечера из трёх.', doneAt: past(20) }),
      step({ id: 'd3', month: 2, title: 'Забронировать выходные без телефона', minutes: 45, date: ymd(addDays(wk, -15)), window: 'we-morning', status: 'done', result: 'Домик в Карелии на май.', doneAt: past(15) }),
      step({ id: 'd4', month: 3, title: 'Разобрать подписки и регулярные траты', minutes: 45, date: ymd(addDays(wk, 1)), window: 'wd-evening' }),
      step({ id: 'd5', month: 3, title: 'Открыть отдельный счёт «Мечта»', minutes: 30, date: ymd(addDays(wk, 5)), window: 'we-morning' }),
      step({ id: 'd6', month: 3, title: 'Настроить автоперевод в день зарплаты', minutes: 15, horizon: 'month' }),
    ],
  }
}
