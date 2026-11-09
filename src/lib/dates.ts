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

export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MON = MONTHS.map((m) => m.slice(0, 3))

export const dayShort = (d: Date) => DAY_SHORT[(d.getDay() + 6) % 7]!
/** "Tue, Nov 10" */
export const dayLabel = (d: Date) => `${dayShort(d)}, ${MON[d.getMonth()]} ${d.getDate()}`
/** "Nov 10, 2026" */
export const dateLabel = (d: Date) => `${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
/** "Monday, November 9" */
export const longDay = (d: Date) => `${d.toLocaleDateString('en-US', { weekday: 'long' })}, ${MONTHS[d.getMonth()]} ${d.getDate()}`

/** "Nov 2026" for chapter N given the journey start (YYYY-MM-01). */
export function chapterMonthName(start: string, chapter: number) {
  const s = parseYmd(start)
  const d = new Date(s.getFullYear(), s.getMonth() + chapter - 1, 1)
  return `${MON[d.getMonth()]} ${d.getFullYear()}`
}
export function chapterMonthLong(start: string, chapter: number) {
  const s = parseYmd(start)
  const d = new Date(s.getFullYear(), s.getMonth() + chapter - 1, 1)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
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
  if (!h) return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}

export function greeting(now = new Date()) {
  const h = now.getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
