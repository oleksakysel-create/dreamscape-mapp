const pad = (n: number) => String(n).padStart(2, '0')

export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
/** Monday of the week containing d. */
export function startOfWeek(d: Date) {
  const day = (d.getDay() + 6) % 7
  return addDays(startOfDay(d), -day)
}
export const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6

export const DAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

export const dayShort = (d: Date) => DAY_SHORT[(d.getDay() + 6) % 7]!
export const dayLabel = (d: Date) => `${dayShort(d)}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
export const dateLabel = (d: Date) => `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`

/** Calendar month name for chapter N given the journey start (YYYY-MM-01). */
export function chapterMonthName(start: string, chapter: number) {
  const s = parseYmd(start)
  const d = new Date(s.getFullYear(), s.getMonth() + chapter - 1, 1)
  return `${MONTHS_NOM[d.getMonth()]} ${d.getFullYear()}`
}

/** 1-based chapter for today, clamped to 1..12. */
export function chapterFor(start: string, now = new Date()) {
  const s = parseYmd(start)
  const months = (now.getFullYear() - s.getFullYear()) * 12 + now.getMonth() - s.getMonth()
  return Math.min(12, Math.max(1, months + 1))
}

export function minutesLabel(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m} мин`
  return m ? `${h} ч ${m} мин` : `${h} ч`
}

export function greeting(now = new Date()) {
  const h = now.getHours()
  if (h < 5) return 'Доброй ночи'
  if (h < 12) return 'Доброе утро'
  if (h < 18) return 'Добрый день'
  return 'Добрый вечер'
}
