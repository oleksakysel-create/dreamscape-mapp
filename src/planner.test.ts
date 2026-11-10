import { describe, expect, it } from 'vitest'
import { ARTWORK_IDS, getArtwork, paletteOf } from './art'
import { THEMES } from './data/themes'
import { addDays, chapterFor, startOfWeek, ymd } from './lib/dates'
import { findSlot, weekLoad, weekSlots, type Budget, type Step } from './lib/planner'

const budget: Budget = { weeklyMinutes: 120, windows: ['wd-evening', 'we-morning'] }
const monday = new Date(2026, 10, 2, 8) // Mon 2 Nov 2026
const step = (date: string, minutes: number, extra: Partial<Step> = {}): Step => ({
  id: Math.random().toString(36), month: 1, title: 't', minutes, horizon: 'week', date, window: 'wd-evening', status: 'planned', createdAt: '', ...extra,
})

describe('balance engine', () => {
  it('spreads the weekly budget across the chosen windows only', () => {
    const slots = weekSlots(budget, [], startOfWeek(monday))
    expect(slots).toHaveLength(7) // 5 weekday evenings + 2 weekend mornings
    expect(slots.every((s) => s.capacity >= 15)).toBe(true)
  })

  it('places a step into the earliest window with room', () => {
    expect(findSlot(budget, [], 15, monday)).toMatchObject({ date: ymd(monday), window: 'wd-evening', weekOffset: 0 })
  })

  it('never overfills a week — moves to next week instead', () => {
    const full = [step(ymd(monday), 60), step(ymd(addDays(monday, 1)), 60)]
    expect(weekLoad(budget, full, startOfWeek(monday)).planned).toBe(120)
    const slot = findSlot(budget, full, 30, monday)
    expect(slot?.weekOffset).toBe(1)
  })

  it('released steps free their time', () => {
    const steps = [step(ymd(monday), 120, { status: 'released' })]
    expect(weekLoad(budget, steps, startOfWeek(monday)).planned).toBe(0)
    expect(findSlot(budget, steps, 30, monday)?.weekOffset).toBe(0)
  })

  it('maps dates to chapters 1..12', () => {
    expect(chapterFor('2026-01-01', new Date(2026, 2, 10))).toBe(3)
    expect(chapterFor('2026-01-01', new Date(2028, 0, 1))).toBe(12)
  })
})

describe('content & artwork', () => {
  it('has 12 themes, each linked to a distinct dream artwork', () => {
    expect(THEMES).toHaveLength(12)
    expect(new Set(THEMES.map((t) => t.art)).size).toBe(12)
    for (const t of THEMES) {
      expect(ARTWORK_IDS).toContain(t.art)
      expect(t.questions.map((q) => q.id)).toContain(t.stepQuestion)
      expect(t.suggestions.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('every region has a realistic tone and a valid path', () => {
    for (const id of ARTWORK_IDS) {
      const art = getArtwork(id)
      expect(art.regions.length).toBeGreaterThan(25)
      expect(new Set(art.regions.map((r) => r.id)).size).toBe(art.regions.length)
      for (const r of art.regions) {
        expect(r.tone).toMatch(/^#[0-9A-Fa-f]{6}$/)
        expect(r.d).not.toMatch(/NaN|undefined/)
      }
      expect(paletteOf(art).length).toBeGreaterThan(5)
    }
  })
})

describe('dream card logic', () => {
  it('shows the person’s own words, then the photo once it came true', async () => {
    const { useStore, phraseOf, nextStage, isFulfilled } = await import('./lib/store')
    const t1 = THEMES[0]!
    useStore.getState().reset()
    expect(phraseOf(useStore.getState(), 1)).toBe('')
    expect(nextStage(useStore.getState(), 1)).toBe('thoughts')
    useStore.getState().saveAnswers(1, { [t1.dreamQuestion]: '  A bright house by the sea  ' })
    expect(phraseOf(useStore.getState(), 1)).toBe('A bright house by the sea')
    useStore.getState().finishReflection(1)
    expect(nextStage(useStore.getState(), 1)).toBe('plan')
    useStore.getState().fulfill(1, { date: new Date(2027, 2, 14).toISOString(), photo: 'idb:x', memo: 'Done' })
    expect(isFulfilled(useStore.getState(), 1)).toBe(true)
    expect(useStore.getState().chapters[1]!.photo).toBe('idb:x')
    useStore.getState().unfulfill(1)
    expect(isFulfilled(useStore.getState(), 1)).toBe(false)
  })

  it('example journey has three dreams that came true, each with a photo', async () => {
    const { demoData } = await import('./lib/demo')
    const { chapterFor } = await import('./lib/dates')
    const d = demoData()
    expect(chapterFor(d.profile!.start)).toBe(10)
    const fulfilled = Object.entries(d.chapters).filter(([, c]) => c.fulfilledAt)
    expect(fulfilled.map(([m]) => Number(m))).toEqual([4, 6, 9])
    for (const [, c] of fulfilled) {
      expect(c.photo).toBeTruthy()
      expect(new Date(c.fulfilledAt!).getTime()).toBeLessThanOrEqual(Date.now())
    }
  })
})
