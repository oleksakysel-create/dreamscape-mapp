import { AnimatePresence, motion } from 'framer-motion'
import { Check, History, RotateCcw, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Quote } from '../components/DreamCard'
import { Button, cx } from '../components/ui'
import { THEMES } from '../data/themes'
import { chapterMonthName } from '../lib/dates'
import { agoLabel, buildMemories, type Memory } from '../lib/memories'
import { usePhoto } from '../lib/photos'
import { overview } from '../lib/stats'
import { useStore } from '../lib/store'
import { haptic, useUI } from '../lib/ui'

const ease = [0.22, 1, 0.36, 1] as const
type Slide = { kind: 'open' } | Memory | { kind: 'end' }
const MS = { open: 4200, photo: 5200, thought: 5600, end: 0 } as const

function Label({ m }: { m: Memory }) {
  return (
    <div className="flex items-center gap-2 text-[12.5px] text-soft">
      <span className="w-7 h-7 rounded-full bg-skysoft text-sky flex items-center justify-center">
        <History size={14} />
      </span>
      <span>
        <span className="text-fg font-semibold">{agoLabel(m.date)}</span> · Chapter {m.month} · {THEMES[m.month - 1]!.title}
      </span>
    </div>
  )
}

function PhotoSlide({ m }: { m: Extract<Memory, { kind: 'photo' }> }) {
  const url = usePhoto(m.photo)
  return (
    <div className="flex-1 min-h-0 flex flex-col justify-center">
      <Label m={m} />
      <motion.div initial={{ opacity: 0, y: 24, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, ease }} className="mt-4 relative rounded-[26px] overflow-hidden aspect-[4/5] max-h-[46vh] sm:max-h-[400px] bg-raised shadow-[0_40px_80px_rgba(0,0,0,0.55)]">
        {url && <motion.img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" initial={{ scale: 1.02 }} animate={{ scale: 1.14 }} transition={{ duration: MS.photo / 1000 + 1, ease: 'linear' }} />}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7, ease }}>
        <div className="mt-4 flex items-center justify-between gap-3">
          <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.03em]">{m.title}</h2>
          <span className="h-7 px-[10px] shrink-0 rounded-full bg-sage/[0.16] text-sage text-[12px] font-semibold inline-flex items-center gap-1">
            <Check size={12} strokeWidth={3} /> Came true
          </span>
        </div>
        {m.text && <p className="mt-2 text-[15px] leading-relaxed text-soft">“{m.text}”</p>}
      </motion.div>
    </div>
  )
}

function ThoughtSlide({ m }: { m: Extract<Memory, { kind: 'thought' }> }) {
  const long = m.text.length > 110
  return (
    <div className="flex-1 flex flex-col justify-center">
      <Label m={m} />
      <p className="mt-8 text-[15px] text-mute">{m.source}</p>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9, ease }} className="mt-4">
        <Quote size={48} />
        <p className={cx('mt-3 font-semibold tracking-[-0.035em]', long ? 'text-[24px] leading-[1.2]' : 'text-[30px] leading-[1.12]')}>{m.text}</p>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mt-6 text-[13px] text-mute">
        You wrote this.
      </motion.p>
    </div>
  )
}

/** “Your year in memories”: the journey played back, Facebook-memories style, different every time. */
export default function Memories() {
  const data = useStore()
  const { memories: open, openMemories } = useUI()
  const [round, setRound] = useState(0)
  const [i, setI] = useState(0)
  // a new random selection every time the film is played
  const slides = useMemo<Slide[]>(() => [{ kind: 'open' }, ...buildMemories(data), { kind: 'end' }], [round, open]) // eslint-disable-line react-hooks/exhaustive-deps
  const slide = slides[i] ?? slides[0]!
  const ms = MS[slide.kind]
  const stats = useMemo(() => overview(data).kpis, [data])
  const profile = data.profile

  useEffect(() => {
    if (!open) return
    setI(0)
  }, [open, round])
  useEffect(() => {
    if (!open || !ms) return
    const t = setTimeout(() => setI((v) => Math.min(v + 1, slides.length - 1)), ms)
    return () => clearTimeout(t)
  }, [open, i, ms, slides.length])

  const go = (n: number) => {
    haptic()
    setI(Math.max(0, Math.min(slides.length - 1, n)))
  }
  const close = () => openMemories(false)

  return (
    <AnimatePresence>
      {open && profile && (
        <motion.div className="absolute inset-0 z-[86] bg-ink flex flex-col overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} data-testid="memories" data-slide={slide.kind}>
          <motion.div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[460px] rounded-full bg-sky/[0.10] blur-[110px]" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 6, repeat: Infinity }} />

          <div className="relative z-10 px-5 pt-[max(58px,calc(env(safe-area-inset-top)+12px))]">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0,1fr))` }} aria-hidden>
              {slides.map((s, k) => (
                <span key={k} className="h-[3px] rounded-full bg-white/[0.16] overflow-hidden">
                  {k < i && <span className="block h-full w-full bg-fg" />}
                  {k === i && (MS[s.kind] ? <motion.span key={`${round}-${i}`} className="block h-full bg-fg" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: MS[s.kind] / 1000, ease: 'linear' }} /> : <span className="block h-full w-full bg-fg" />)}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[13px] font-semibold tracking-[0.1em] uppercase text-sky">Your year in memories</span>
              <button onClick={close} aria-label="Close" className="w-9 h-9 -mr-2 rounded-full flex items-center justify-center text-fg/80" data-testid="memories-close">
                <X size={22} />
              </button>
            </div>
          </div>

          {slide.kind !== 'end' && (
            <>
              <button aria-label="Previous" className="absolute left-0 top-32 bottom-0 w-1/3 z-[5]" onClick={() => go(i - 1)} />
              <button aria-label="Next" className="absolute right-0 top-32 bottom-0 w-2/3 z-[5]" onClick={() => go(i + 1)} data-testid="memories-next" />
            </>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={`${round}-${i}`} className="relative flex-1 min-h-0 flex flex-col px-6 pt-4 pb-[max(36px,env(safe-area-inset-bottom))]" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }} transition={{ duration: 0.5, ease }}>
              {slide.kind === 'open' && (
                <div className="flex-1 flex flex-col justify-center">
                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }} className="text-[15px] text-mute">
                    {chapterMonthName(profile.start, 1)} — {chapterMonthName(profile.start, 12)}
                  </motion.div>
                  <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9, ease }} className="mt-3 text-[40px] font-semibold leading-[1.04] tracking-[-0.05em]">
                    Look how far
                    <br />
                    you’ve come, <span className="text-sky">{profile.name}.</span>
                  </motion.h1>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-5 text-[16px] text-mute leading-relaxed">
                    Twelve chapters, played back in moments.
                  </motion.p>
                </div>
              )}
              {slide.kind === 'photo' && <PhotoSlide m={slide} />}
              {slide.kind === 'thought' && <ThoughtSlide m={slide} />}
              {slide.kind === 'end' && (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-2">
                      {stats.map((k, n) => (
                        <motion.div key={k.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * n, duration: 0.6, ease }} className="p-4 rounded-[20px] bg-white/[0.05] border border-white/[0.06]">
                          <div className="text-[12.5px] text-mute">{k.label}</div>
                          <div className="mt-1 text-[24px] font-semibold tracking-tight tnum whitespace-nowrap">
                            {k.value.replace(' min', 'm').replace(' h', 'h')} <span className="text-[13px] font-normal text-mute">{k.sub}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <motion.h2 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8, ease }} className="mt-9 text-[34px] font-semibold leading-[1.06] tracking-[-0.045em]">
                      You can achieve more
                      <br />
                      <span className="text-sky">at every age.</span>
                    </motion.h2>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" onClick={() => setRound((r) => r + 1)} data-testid="memories-replay">
                      <RotateCcw size={17} /> Play other memories
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={close}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
