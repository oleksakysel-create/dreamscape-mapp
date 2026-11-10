import { motion } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'
import { cx, LargeTitle } from '../components/ui'
import { StoriesRail } from './Stories'
import { THEMES } from '../data/themes'
import { chapterFor, chapterMonthName } from '../lib/dates'
import { usePhoto } from '../lib/photos'
import { chapterOf, chapterStages, dreamOf, phraseOf, useStore } from '../lib/store'
import { useUI } from '../lib/ui'

function Thumb({ month }: { month: number }) {
  const c = useStore((s) => chapterOf(s, month))
  const url = usePhoto(c.fulfilledAt ? c.photo : undefined)
  if (url) return <img src={url} alt="" className="w-12 h-12 rounded-[14px] object-cover shrink-0" />
  return (
    <span className={cx('w-12 h-12 rounded-[14px] shrink-0 flex items-center justify-center text-[15px] font-semibold tnum', c.reflectedAt ? 'dream-surface text-sky' : 'border border-white/[0.1] text-mute')}>
      {String(month).padStart(2, '0')}
    </span>
  )
}

export default function Journey() {
  const data = useStore()
  const openChapter = useUI((s) => s.openChapter)
  const profile = data.profile!
  const now = chapterFor(profile.start)
  const fulfilled = THEMES.filter((t) => chapterOf(data, t.month).fulfilledAt).length

  return (
    <div className="pb-4">
      <LargeTitle title="Journey" sub={`12 chapters · ${fulfilled} came true`} />
      <StoriesRail />
      <ol className="px-4 space-y-2">
        {THEMES.map((t, i) => {
          const st = chapterStages(data, t.month)
          const phrase = phraseOf(data, t.month)
          const isNow = t.month === now
          return (
            <motion.li key={t.month} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <button
                onClick={() => openChapter(t.month)}
                data-testid={`chapter-${t.month}`}
                className={cx('w-full flex items-center gap-3.5 p-3 pr-3.5 rounded-[22px] text-left border', isNow ? 'bg-card border-sky/30' : 'bg-transparent border-white/[0.06]')}
              >
                <Thumb month={t.month} />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 text-[12px] text-mute">
                    <span>{chapterMonthName(profile.start, t.month)}</span>
                    {isNow && <span className="text-sky font-semibold">· Now</span>}
                    {st.result && (
                      <span className="text-sage font-semibold flex items-center gap-0.5">
                        · <Check size={11} strokeWidth={3} /> Came true
                      </span>
                    )}
                  </span>
                  <span className="block text-[17px] font-semibold tracking-tight mt-0.5">{t.title}</span>
                  <span className="block text-[13px] text-mute truncate">{phrase ? `“${phrase}”` : dreamOf(data, t.month)}</span>
                </span>
                <span className="flex flex-col items-end gap-2">
                  <span className="flex gap-1" aria-label={`${[st.thoughts, st.plan, st.create, st.result].filter(Boolean).length} of 4 stages`}>
                    {[st.thoughts, st.plan, st.create, st.result].map((on, k) => (
                      <span key={k} className={cx('w-1.5 h-1.5 rounded-full', on ? 'bg-sky' : 'bg-white/[0.15]')} />
                    ))}
                  </span>
                  <ChevronRight size={16} className="text-mute" />
                </span>
              </button>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
