import { motion } from 'framer-motion'
import { useState } from 'react'
import { DreamTile } from '../components/DreamCard'
import { cx, LargeTitle } from '../components/ui'
import { THEMES } from '../data/themes'
import { chapterOf, phraseOf, useStore } from '../lib/store'
import { haptic, useUI } from '../lib/ui'

type Filter = 'all' | 'true' | 'way'

export default function Board() {
  const data = useStore()
  const openChapter = useUI((s) => s.openChapter)
  const [filter, setFilter] = useState<Filter>('all')
  const came = THEMES.filter((t) => chapterOf(data, t.month).fulfilledAt)
  const items = THEMES.filter((t) => {
    const f = Boolean(chapterOf(data, t.month).fulfilledAt)
    return filter === 'all' || (filter === 'true' ? f : !f)
  })
  const cols: (typeof THEMES)[] = [[], []]
  items.forEach((t, i) => cols[i % 2]!.push(t))
  const heightOf = (m: number, i: number) => {
    if (chapterOf(data, m).fulfilledAt) return i % 2 ? 220 : 252
    const p = phraseOf(data, m)
    if (!p) return 112
    return p.length > 70 ? 204 : 168
  }

  return (
    <div className="pb-4">
      <LargeTitle title="Board" sub={`${came.length} came true · ${12 - came.length} on the way`} />
      <div className="px-5 pb-4 flex gap-1.5" role="tablist" aria-label="Filter">
        {(
          [
            ['all', 'All'],
            ['true', 'Came true'],
            ['way', 'On the way'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={filter === id}
            onClick={() => {
              haptic()
              setFilter(id)
            }}
            className={cx('h-[34px] px-3.5 rounded-full text-[13px]', filter === id ? 'bg-paper text-[#141414] font-semibold' : 'border border-white/[0.16] text-[#D8D6D1] font-medium')}
          >
            {label}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="px-5 text-[15px] text-mute leading-relaxed">Nothing here yet. When a dream comes true, add its photo — it will appear on this board.</p>
      ) : (
        <div className="px-4 grid grid-cols-2 gap-2.5" data-testid="board">
          {cols.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-2.5">
              {col.map((t, i) => (
                <motion.button
                  key={t.month}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i * 2 + ci) * 0.03 }}
                  onClick={() => openChapter(t.month)}
                  data-testid={`board-${t.month}`}
                  data-fulfilled={Boolean(chapterOf(data, t.month).fulfilledAt)}
                  className="block w-full"
                >
                  <DreamTile month={t.month} height={heightOf(t.month, i + ci)} />
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
