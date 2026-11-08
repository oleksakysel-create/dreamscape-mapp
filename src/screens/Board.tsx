import { motion } from 'framer-motion'
import { ArtView } from '../components/ArtView'
import { Eyebrow } from '../components/ui'
import { THEMES } from '../data/themes'
import { chapterOf, coloringProgress, useStore } from '../lib/store'
import { useUI } from '../lib/ui'

export default function Board() {
  const data = useStore()
  const openSheet = useUI((s) => s.openSheet)
  const openChapter = useUI((s) => s.openChapter)
  const colored = THEMES.filter((t) => chapterOf(data, t.month).coloredAt)
  const cols: (typeof THEMES)[] = [[], []]
  THEMES.forEach((t, i) => cols[i % 2]!.push(t))

  return (
    <div className="px-5">
      <header className="pt-2 pb-5">
        <Eyebrow>Доска визуализации</Eyebrow>
        <h1 className="serif text-[38px] leading-[1.05] mt-1">Мои мечты</h1>
        <p className="text-[14px] text-mute mt-2">
          {colored.length ? `Раскрашено ${colored.length} из 12. Каждая картина — цель, у которой есть место в вашей неделе.` : 'Раскрасьте мечту месяца — и она появится здесь в цвете.'}
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3" data-testid="board">
        {cols.map((col, ci) => (
          <div key={ci} className={ci ? 'space-y-3 pt-10' : 'space-y-3'}>
            {col.map((t, i) => {
              const c = chapterOf(data, t.month)
              const p = coloringProgress(data, t.month)
              const caption = (c.answers[t.dreamQuestion] ?? '').trim()
              const done = Boolean(c.coloredAt)
              return (
                <motion.button
                  key={t.month}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i * 2 + ci) * 0.04 }}
                  onClick={() => (done ? openSheet({ type: 'dream', month: t.month }) : openChapter(t.month))}
                  data-testid={`board-${t.month}`}
                  data-done={done}
                  className="block w-full text-left"
                >
                  <div className="relative rounded-[18px] overflow-hidden bg-white">
                    <ArtView id={t.art} fills={c.fills} className={done ? 'w-full aspect-[3/4]' : 'w-full aspect-[3/4] opacity-[0.88]'} />
                    {!done && (
                      <span className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/70 text-[11px] font-semibold tnum">
                        {p > 0 ? `${Math.round(p * 100)}%` : `Глава ${t.month}`}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 px-0.5">
                    <div className="text-[14px] font-semibold">{t.dream}</div>
                    {caption && <div className="text-[12.5px] text-mute line-clamp-2 mt-0.5">{caption}</div>}
                  </div>
                </motion.button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
