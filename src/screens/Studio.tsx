import { AnimatePresence, motion } from 'framer-motion'
import { Eraser, Eye, Maximize2, Pipette, Redo2, Undo2, Wand2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getArtwork, paletteOf } from '../art'
import { ArtView } from '../components/ArtView'
import { ColorCanvas, type CanvasHandle } from '../components/ColorCanvas'
import { Button, cx, Eyebrow } from '../components/ui'
import { getTheme } from '../data/themes'
import { chapterOf, useStore } from '../lib/store'
import { haptic, useUI } from '../lib/ui'

interface Op {
  id: string
  prev?: string
  next?: string
}

export default function Studio({ month, onClose }: { month: number; onClose: () => void }) {
  const theme = getTheme(month)!
  const art = getArtwork(theme.art)
  const palette = useMemo(() => paletteOf(art), [art])
  const saved = useStore((s) => chapterOf(s, month))
  const setFillsStore = useStore((s) => s.setFills)
  const complete = useStore((s) => s.completeColoring)
  const realistic = useStore((s) => s.realisticBrush)
  const setRealistic = useStore((s) => s.setRealisticBrush)
  const ui = useUI()

  const [fills, setFills] = useState<Record<string, string>>(saved.fills)
  const [past, setPast] = useState<Op[]>([])
  const [future, setFuture] = useState<Op[]>([])
  const [color, setColor] = useState(palette[Math.floor(palette.length / 2)]!)
  const [eraser, setEraser] = useState(false)
  const [peek, setPeek] = useState(false)
  const [done, setDone] = useState(false)
  const canvas = useRef<CanvasHandle>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const latest = useRef(fills)

  const total = art.regions.length
  const filled = art.regions.filter((r) => fills[r.id]).length
  const progress = filled / total

  const persist = useCallback(() => {
    clearTimeout(timer.current)
    setFillsStore(month, latest.current)
  }, [month, setFillsStore])

  const commit = (next: Record<string, string>) => {
    latest.current = next
    setFills(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(persist, 400)
  }

  useEffect(() => () => persist(), [persist])

  useEffect(() => {
    if (filled === total && !saved.coloredAt) {
      persist()
      complete(month)
      setDone(true)
      haptic(30)
    }
  }, [filled, total, saved.coloredAt, persist, complete, month])

  const apply = (ops: Op[], dir: 'next' | 'prev') => {
    const n = { ...latest.current }
    for (const op of ops) {
      const v = op[dir]
      if (v) n[op.id] = v
      else delete n[op.id]
    }
    commit(n)
  }

  const onTap = (id: string) => {
    const region = art.regions.find((r) => r.id === id)!
    const nextColor = eraser ? undefined : realistic ? region.tone : color
    const prev = latest.current[id]
    if (prev === nextColor) return
    haptic(6)
    const op = { id, prev, next: nextColor }
    setPast((p) => [...p.slice(-300), op])
    setFuture([])
    apply([op], 'next')
  }
  const undo = () => {
    const op = past[past.length - 1]
    if (!op) return
    setPast((p) => p.slice(0, -1))
    setFuture((f) => [op, ...f])
    apply([op], 'prev')
  }
  const redo = () => {
    const [op, ...rest] = future
    if (!op) return
    setFuture(rest)
    setPast((p) => [...p, op])
    apply([op], 'next')
  }

  const close = () => {
    persist()
    onClose()
  }

  return (
    <motion.div
      className="absolute inset-0 z-[50] bg-ink flex flex-col"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 40 }}
    >
      <div className="px-4 pt-[max(54px,calc(env(safe-area-inset-top)+8px))] pb-3 flex items-center gap-3">
        <button onClick={close} aria-label="Закрыть" className="w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center">
          <X size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <Eyebrow className="text-gold">Глава {month}</Eyebrow>
          <div className="serif text-[24px] leading-tight truncate">{theme.dream}</div>
        </div>
        <button onClick={undo} disabled={!past.length} aria-label="Отменить" className="w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center disabled:opacity-30">
          <Undo2 size={18} />
        </button>
        <button onClick={redo} disabled={!future.length} aria-label="Повторить" className="w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center disabled:opacity-30">
          <Redo2 size={18} />
        </button>
      </div>

      <div className="px-4">
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full bg-gold" animate={{ width: `${progress * 100}%` }} />
        </div>
        <div className="flex justify-between text-[12px] text-mute mt-1.5 tnum">
          <span data-testid="progress">
            {filled}/{total}
          </span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-2">
        <div className="h-full max-w-full" style={{ aspectRatio: '3 / 4' }}>
          <ColorCanvas ref={canvas} art={art} fills={fills} onTap={onTap} peek={peek} />
        </div>
      </div>

      <div className="glass rounded-t-[28px] px-4 pt-3 pb-[max(18px,env(safe-area-inset-bottom))] space-y-3">
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => setPeek(true)}
            onPointerUp={() => setPeek(false)}
            onPointerLeave={() => setPeek(false)}
            className={cx('h-10 px-3 rounded-full text-[13px] font-semibold flex items-center gap-1.5', peek ? 'bg-gold text-[#17130C]' : 'bg-white/[0.07]')}
            aria-label="Удерживайте, чтобы увидеть эталон"
          >
            <Eye size={16} /> Эталон
          </button>
          <button
            onClick={() => {
              haptic()
              setRealistic(!realistic)
              setEraser(false)
            }}
            aria-pressed={realistic}
            data-testid="realistic"
            className={cx('h-10 px-3 rounded-full text-[13px] font-semibold flex items-center gap-1.5', realistic ? 'bg-gold text-[#17130C]' : 'bg-white/[0.07]')}
          >
            <Wand2 size={16} /> Как в жизни
          </button>
          <span className="flex-1" />
          <button onClick={() => setEraser((e) => !e)} aria-pressed={eraser} aria-label="Ластик" className={cx('w-10 h-10 rounded-full flex items-center justify-center', eraser ? 'bg-gold text-[#17130C]' : 'bg-white/[0.07]')}>
            <Eraser size={17} />
          </button>
          <button onClick={() => canvas.current?.reset()} aria-label="Вписать в экран" className="w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center">
            <Maximize2 size={16} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1" role="radiogroup" aria-label="Цвета мечты">
          {palette.map((c) => {
            const on = !eraser && !realistic && c === color
            return (
              <button
                key={c}
                role="radio"
                aria-checked={on}
                aria-label={c}
                data-color={c}
                onClick={() => {
                  haptic()
                  setColor(c)
                  setEraser(false)
                  setRealistic(false)
                }}
                className={cx('w-10 h-10 shrink-0 rounded-full transition-transform', on ? 'ring-2 ring-gold ring-offset-[3px] ring-offset-[#161619] scale-105' : 'ring-1 ring-white/10')}
                style={{ background: c }}
              />
            )
          })}
          <label className="relative w-10 h-10 shrink-0 rounded-full bg-[conic-gradient(#e7b0a0,#e9d48e,#9cc79a,#8fb7dc,#b49fd8,#e7b0a0)] flex items-center justify-center ring-1 ring-white/10">
            <Pipette size={15} className="text-black/60" />
            <input type="color" aria-label="Свой цвет" value={color} onChange={(e) => (setColor(e.target.value.toUpperCase()), setRealistic(false), setEraser(false))} className="absolute inset-0 opacity-0" />
          </label>
        </div>
        <p className="text-[11.5px] text-mute text-center">
          {realistic ? 'Каждая область окрашивается в свой настоящий цвет' : 'Палитра подобрана по реальным цветам мечты · удерживайте «Эталон»'}
        </p>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div className="absolute inset-0 z-[5] bg-black/80 backdrop-blur-md flex flex-col justify-end p-6 pb-[max(28px,env(safe-area-inset-bottom))]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="mx-auto w-[64%] rounded-[22px] overflow-hidden shadow-2xl">
              <ArtView id={theme.art} fills={fills} className="w-full aspect-[3/4]" />
            </motion.div>
            <Eyebrow className="text-gold text-center mt-7">Глава {month} · готово</Eyebrow>
            <h2 className="serif text-[34px] leading-tight text-center mt-2">{theme.dream} — теперь на вашей доске</h2>
            <p className="text-[14.5px] text-mute text-center mt-2">Пусть эта картина напоминает, ради чего вы находите время.</p>
            <Button
              className="w-full mt-6"
              onClick={() => {
                close()
                ui.setTab('board')
              }}
              data-testid="to-board"
            >
              Открыть доску мечты
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setDone(false)}>
              Ещё полюбоваться
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
