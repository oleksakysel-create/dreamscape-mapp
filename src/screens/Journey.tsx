import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ArtView } from '../components/ArtView'
import { cx, Eyebrow } from '../components/ui'
import { THEMES } from '../data/themes'
import { chapterFor, chapterMonthName } from '../lib/dates'
import { chapterOf, chapterStages, isChapterComplete, useStore } from '../lib/store'
import { useUI } from '../lib/ui'

function Dots({ s }: { s: ReturnType<typeof chapterStages> }) {
  const items = [s.reflect, s.plan, s.results, s.color]
  return (
    <span className="flex gap-1" aria-hidden>
      {items.map((on, i) => (
        <span key={i} className={cx('h-1 w-5 rounded-full', on ? 'bg-gold' : 'bg-white/15')} />
      ))}
    </span>
  )
}

export default function Journey() {
  const data = useStore()
  const openChapter = useUI((s) => s.openChapter)
  const profile = data.profile!
  const now = chapterFor(profile.start)
  const done = THEMES.filter((t) => isChapterComplete(data, t.month)).length

  return (
    <div className="px-5">
      <header className="pt-2 pb-5">
        <Eyebrow>Ваш год</Eyebrow>
        <h1 className="serif text-[38px] leading-[1.05] mt-1">12 глав</h1>
        <p className="text-[14px] text-mute mt-2">Каждая глава открыта всегда. Идите в своём темпе.</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div className="h-full bg-gold rounded-full" initial={{ width: 0 }} animate={{ width: `${(done / 12) * 100}%` }} transition={{ duration: 0.8 }} />
          </div>
          <span className="text-[13px] text-mute tnum">{done}/12</span>
        </div>
      </header>
      <ol className="space-y-3">
        {THEMES.map((t, i) => {
          const c = chapterOf(data, t.month)
          const st = chapterStages(data, t.month)
          const complete = isChapterComplete(data, t.month)
          const isNow = t.month === now
          return (
            <motion.li key={t.month} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}>
              <button
                onClick={() => openChapter(t.month)}
                data-testid={`chapter-${t.month}`}
                className={cx('w-full flex gap-4 p-3 pr-4 rounded-[24px] bg-card hairline text-left', isNow && 'border-gold/40')}
              >
                <div className="relative w-[78px] h-[104px] rounded-[16px] overflow-hidden shrink-0 bg-white">
                  <ArtView id={t.art} fills={c.fills} className="w-full h-full" />
                  {complete && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gold text-[#17130C] flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-mute tnum">{String(t.month).padStart(2, '0')}</span>
                    <span className="text-[12px] text-mute">{chapterMonthName(profile.start, t.month)}</span>
                    {isNow && <span className="ml-auto text-[10px] font-bold tracking-[0.14em] uppercase text-gold">сейчас</span>}
                  </div>
                  <div className="serif text-[25px] leading-tight mt-0.5">{t.title}</div>
                  <div className="text-[13px] text-mute truncate">{t.dream}</div>
                  <div className="mt-auto pt-2">
                    <Dots s={st} />
                  </div>
                </div>
              </button>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
