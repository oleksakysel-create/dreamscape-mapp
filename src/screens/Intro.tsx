import { AnimatePresence, motion } from 'framer-motion'
import { Check, Play, Share } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { PHOTOS } from '../assets/photos'
import { Quote } from '../components/DreamCard'
import { Button, cx } from '../components/ui'
import { haptic } from '../lib/ui'

/** Film mode (`?film`) plays the intro hands-free, for recording the video. */
export const FILM = typeof location !== 'undefined' && new URLSearchParams(location.search).has('film')

const ease = [0.22, 1, 0.36, 1] as const

function Typewriter({ text, delay = 0, speed = 38, className }: { text: string; delay?: number; speed?: number; className?: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    let id: ReturnType<typeof setInterval> | undefined
    const t = setTimeout(() => {
      id = setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), speed)
    }, delay)
    return () => {
      clearTimeout(t)
      clearInterval(id)
    }
  }, [text, delay, speed])
  return (
    <span className={className}>
      {text.slice(0, n)}
      <span className={cx('inline-block w-[2px] h-[0.9em] -mb-[0.1em] ml-0.5 bg-sky align-baseline', n >= text.length && 'opacity-0')} />
    </span>
  )
}

/** Value that steps through a list on a timer (for scripted UI moments). */
function useScript<T>(values: T[], every: number, start = 0) {
  const [i, setI] = useState(0)
  useEffect(() => {
    setI(0)
    const ids: ReturnType<typeof setTimeout>[] = []
    values.forEach((_, k) => k > 0 && ids.push(setTimeout(() => setI(k), start + k * every)))
    return () => ids.forEach(clearTimeout)
  }, [values.length, every, start])
  return values[i]!
}

/* ───────────── visuals ───────────── */

function DreamVisual() {
  return (
    <motion.div initial={{ opacity: 0, y: 30, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: -2 }} transition={{ duration: 0.9, ease }} className="dream-surface rounded-[30px] p-6 w-[300px] shadow-[0_40px_80px_rgba(0,0,0,0.55)]">
      <div className="flex justify-between items-center">
        <span className="h-7 px-[11px] rounded-full border border-white/[0.16] text-[12px] font-medium text-[#D8D6D1] inline-flex items-center">Chapter 9 · Discovery</span>
        <span className="h-7 px-[11px] rounded-full bg-skysoft text-sky text-[12px] font-medium inline-flex items-center">New dream</span>
      </div>
      <div className="mt-8">
        <Quote size={50} />
      </div>
      <p className="mt-3 text-[25px] font-medium leading-[1.2] tracking-[-0.035em] min-h-[120px]">
        <Typewriter text="A night at the ballet. A box seat, champagne and Swan Lake." delay={700} />
      </p>
      <div className="mt-4 text-[12.5px] text-mute">Your words</div>
    </motion.div>
  )
}

function ReflectVisual() {
  const pick = useScript([0, 3, 5, 7], 380, 900)
  return (
    <div className="w-[320px] space-y-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="rounded-[26px] bg-card border border-white/[0.07] p-5">
        <div className="text-[12px] text-mute">Question 3 of 4</div>
        <div className="mt-2 text-[18px] font-medium leading-snug tracking-[-0.02em]">How close is your life today to the one you want?</div>
        <div className="mt-4 grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, k) => (
            <span key={k} className={cx('h-9 rounded-[10px] flex items-center justify-center text-[13px] font-semibold transition-colors duration-200', pick === k + 1 ? 'bg-sky text-[#0B1622]' : 'bg-white/[0.06] text-soft')}>
              {k + 1}
            </span>
          ))}
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 2.2, ease }} className="rounded-[26px] bg-card border border-white/[0.07] p-5">
        <div className="text-[12px] text-mute">Question 2 of 4</div>
        <div className="mt-2 text-[18px] font-medium leading-snug tracking-[-0.02em]">What has stopped you so far?</div>
        <div className="mt-3 pb-2 border-b border-white/[0.16] text-[15px] text-soft min-h-[44px]">
          <Typewriter text="Telling myself there would be a better time." delay={2900} speed={34} />
        </div>
      </motion.div>
    </div>
  )
}

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PLAN = [
  { day: 1, title: 'Buy the tickets the day they go on sale', meta: 'Tue · evening · 15 min' },
  { day: 3, title: 'Pick an outfit for the evening', meta: 'Thu · morning · 30 min' },
  { day: 5, title: 'Read the story of Swan Lake', meta: 'Sat · morning · 45 min' },
]

function PlanVisual() {
  const landed = useScript([0, 1, 2, 3], 650, 600)
  const minutes = [0, 15, 45, 90][landed]!
  return (
    <div className="w-[330px] rounded-[28px] bg-card border border-white/[0.07] p-5">
      <div className="flex justify-between text-[13px]">
        <span className="text-mute">Time for yourself</span>
        <span className="tnum">
          <b className="font-semibold">{minutes ? `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)} h ` : ''}${minutes % 60 ? `${minutes % 60} min` : ''}` : '0 min'}</b> <span className="text-mute">of 4 h</span>
        </span>
      </div>
      <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div className="h-full bg-sky rounded-full" animate={{ width: `${(minutes / 240) * 100}%` }} transition={{ duration: 0.5, ease }} />
      </div>
      <div className="mt-5 grid grid-cols-7 gap-1 text-center">
        {WEEK.map((d, i) => {
          const on = PLAN.some((p, k) => p.day === i && k < landed)
          return (
            <div key={d} className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] text-mute">{d}</span>
              <motion.span animate={{ scale: on ? [1, 1.6, 1] : 1 }} transition={{ duration: 0.4 }} className={cx('w-2 h-2 rounded-full', on ? 'bg-sky' : 'bg-white/[0.12]')} />
            </div>
          )
        })}
      </div>
      <div className="mt-4 space-y-2 min-h-[186px]">
        <AnimatePresence>
          {PLAN.slice(0, landed).map((p) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: -18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45, ease }} className="flex items-center gap-3 rounded-[16px] bg-white/[0.04] px-3.5 py-3">
              <span className="w-[20px] h-[20px] rounded-full border-[1.5px] border-white/30 shrink-0" />
              <span className="min-w-0">
                <span className="block text-[14px] truncate">{p.title}</span>
                <span className="block text-[12px] text-mute">{p.meta}</span>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function StepsVisual() {
  const done = useScript([0, 1, 2, 3], 800, 700)
  const stages = ['Thoughts', 'Plan', 'Create', 'Result']
  const stageDone = [true, true, done >= 2, done >= 3]
  return (
    <div className="w-[330px] space-y-4">
      <div className="rounded-[28px] bg-card border border-white/[0.07] px-5 py-2 divide-y divide-white/[0.08]">
        {PLAN.map((p, k) => {
          const on = k < done
          return (
            <div key={p.title} className="flex items-center gap-3 py-3">
              <motion.span animate={{ scale: on ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.35 }} className={cx('w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-colors duration-300', on ? 'bg-sage text-ink' : 'border-[1.5px] border-white/30')}>
                {on && <Check size={13} strokeWidth={3} />}
              </motion.span>
              <span className="min-w-0">
                <span className={cx('block text-[14px] truncate transition-colors', on ? 'text-soft' : '')}>{p.title}</span>
                <span className="block text-[12px] text-mute">{on ? 'Done' : p.meta}</span>
              </span>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-4 gap-1.5 px-1">
        {stages.map((s, i) => (
          <div key={s} className="flex flex-col gap-1.5">
            <span className="h-[3px] rounded-full bg-white/[0.14] overflow-hidden">
              <motion.span className="block h-full bg-fg" initial={false} animate={{ width: stageDone[i] ? '100%' : '0%' }} transition={{ duration: 0.6, ease }} />
            </span>
            <span className={cx('text-[11px]', stageDone[i] ? 'text-soft' : 'text-mute')}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ShowVisual() {
  const shared = useScript([false, true], 2300)
  return (
    <div className="relative w-[min(290px,32vh)]">
      <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
        <img src={PHOTOS.ballet} alt="" className="w-full aspect-[4/5] object-cover rounded-[26px] shadow-[0_40px_80px_rgba(0,0,0,0.55)]" />
        <div className="mt-3 flex flex-col items-start gap-2 px-1">
          <span className="text-[17px] font-semibold tracking-tight whitespace-nowrap">A night at the ballet</span>
          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1, type: 'spring', stiffness: 300, damping: 18 }} className="h-7 px-[10px] shrink-0 whitespace-nowrap rounded-full bg-sage/[0.16] text-sage text-[12px] font-semibold inline-flex items-center gap-1">
            <Check size={12} strokeWidth={3} /> Came true
          </motion.span>
        </div>
      </motion.div>
      <AnimatePresence>
        {shared && (
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease }} className="absolute -right-10 top-[30%] w-[104px] rounded-[16px] overflow-hidden bg-ink border border-white/[0.14] shadow-[0_24px_50px_rgba(0,0,0,0.6)] rotate-[5deg]">
            <img src={PHOTOS.ballet} alt="" className="w-full aspect-[3/4] object-cover" />
            <div className="px-2.5 py-2">
              <div className="text-[10px] font-semibold">A night at the ballet</div>
              <div className="text-[7.5px] font-bold tracking-[0.1em] text-sky mt-0.5">DREAMSCAPE</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {shared && (
          <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: [1, 1.12, 1] }} transition={{ duration: 0.6 }} className="absolute -left-5 top-[52%] w-12 h-12 rounded-full bg-paper text-[#141414] flex items-center justify-center shadow-xl">
            <Share size={20} />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

function Mark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden>
      <rect width="512" height="512" rx="120" fill="#1D232B" />
      <rect x="6" y="6" width="500" height="500" rx="114" fill="none" stroke="#9CCBF0" strokeOpacity=".25" strokeWidth="6" />
      <path d="M136 300a120 120 0 0 1 240 0" fill="none" stroke="#9CCBF0" strokeWidth="24" strokeLinecap="round" />
      <path d="M104 344h304" stroke="#9CCBF0" strokeWidth="18" strokeLinecap="round" />
      <path d="M172 384h168" stroke="#9CCBF0" strokeOpacity=".45" strokeWidth="14" strokeLinecap="round" />
      <circle cx="256" cy="186" r="15" fill="#DDEEFB" />
    </svg>
  )
}

function FinalVisual() {
  const photos = [
    { src: PHOTOS.beach, r: -9, x: -96, d: 0.1 },
    { src: PHOTOS.dreamCar, r: 7, x: 96, d: 0.25 },
    { src: PHOTOS.ballet, r: -1, x: 0, d: 0.4 },
  ]
  return (
    <div className="relative w-[320px] h-[min(250px,30vh)]">
      {photos.map((p) => (
        <motion.img
          key={p.src}
          src={p.src}
          alt=""
          initial={{ opacity: 0, y: 40, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: p.r }}
          transition={{ delay: p.d, duration: 0.9, ease }}
          className="absolute left-1/2 top-0 w-[min(150px,18vh)] aspect-[4/5] object-cover rounded-[20px] shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10"
          style={{ marginLeft: `calc(min(150px, 18vh) / -2 + ${p.x}px)` }}
        />
      ))}
    </div>
  )
}

/* ───────────── scenes ───────────── */

interface Scene {
  id: string
  eyebrow: string
  title: ReactNode
  text: string
  visual: () => ReactNode
  ms: number
}

const SCENES: Scene[] = [
  { id: 'dream', eyebrow: '01 · Dream', title: 'Dream big.', text: 'Write your dream in your own words. Nothing is too big — or too late.', visual: () => <DreamVisual />, ms: 5200 },
  { id: 'reflect', eyebrow: '02 · Reflect', title: 'Think it through.', text: 'Honest questions about your life, your money, your energy and the people you love.', visual: () => <ReflectVisual />, ms: 5600 },
  { id: 'plan', eyebrow: '03 · Plan', title: 'Set small steps.', text: 'Each step lands in a free window of your real week. Never overloaded.', visual: () => <PlanVisual />, ms: 4800 },
  { id: 'create', eyebrow: '04 · Create', title: 'Reach them one by one.', text: 'Done, partly, moved or let go — every step counts. No guilt.', visual: () => <StepsVisual />, ms: 4600 },
  { id: 'show', eyebrow: '05 · Result', title: 'Show your success to the world.', text: 'Add a photo of the dream that came true — and share it.', visual: () => <ShowVisual />, ms: 5200 },
]

export default function Intro({ onStart, onDemo, onStories }: { onStart: () => void; onDemo: () => void; onStories: () => void }) {
  const [i, setI] = useState(0)
  // in film mode, wait for the recorder to say "action"
  const [rolling, setRolling] = useState(!FILM)
  const final = i >= SCENES.length
  const scene = SCENES[i]

  useEffect(() => {
    if (rolling) return
    const go = () => setRolling(true)
    window.addEventListener('film:start', go)
    return () => window.removeEventListener('film:start', go)
  }, [rolling])

  useEffect(() => {
    if (!rolling || final) return
    const t = setTimeout(() => setI((v) => v + 1), scene!.ms)
    return () => clearTimeout(t)
  }, [i, final, scene, rolling])

  const go = (n: number) => {
    haptic()
    setI(Math.max(0, Math.min(SCENES.length, n)))
  }

  if (!rolling) return <div className="absolute inset-0 bg-ink" />

  return (
    <div className="absolute inset-0 flex flex-col bg-ink overflow-hidden" data-testid="intro" data-scene={final ? 'final' : scene!.id}>
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[520px] h-[420px] rounded-full bg-sky/[0.08] blur-[100px]" />

      <div className="relative z-10 px-5 pt-[max(58px,calc(env(safe-area-inset-top)+12px))] flex items-center gap-3">
        <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${SCENES.length + 1}, minmax(0, 1fr))` }} aria-hidden>
          {[...SCENES.map((s) => s.ms), 0].map((ms, k) => (
            <span key={k} className="h-[3px] rounded-full bg-white/[0.16] overflow-hidden">
              {k < i && <span className="block h-full w-full bg-fg" />}
              {k === i && (ms ? <motion.span key={i} className="block h-full bg-fg" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: ms / 1000, ease: 'linear' }} /> : <span className="block h-full w-full bg-fg" />)}
            </span>
          ))}
        </div>
        {!final && !FILM && (
          <button onClick={() => go(SCENES.length)} className="h-8 px-3 -mr-2 text-[14px] text-mute font-medium" data-testid="intro-skip">
            Skip
          </button>
        )}
      </div>

      {/* tap zones: left = back, right = forward (stories-style) */}
      {!final && !FILM && (
        <>
          <button aria-label="Previous" className="absolute left-0 top-24 bottom-0 w-1/3 z-[5]" onClick={() => go(i - 1)} />
          <button aria-label="Next" className="absolute right-0 top-24 bottom-0 w-2/3 z-[5]" onClick={() => go(i + 1)} data-testid="intro-next" />
        </>
      )}

      <AnimatePresence mode="wait">
        {!final ? (
          <motion.div key={scene!.id} className="relative flex-1 flex flex-col px-6 pb-[max(36px,env(safe-area-inset-bottom))]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
            <div className="flex-1 flex items-center justify-center py-6">{scene!.visual()}</div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7, ease }}>
              <div className="text-[12px] font-semibold tracking-[0.12em] uppercase text-sky">{scene!.eyebrow}</div>
              <h1 className="mt-3 text-[38px] font-semibold leading-[1.04] tracking-[-0.045em]">{scene!.title}</h1>
              <p className="mt-3 text-[16px] leading-relaxed text-mute max-w-[340px]">{scene!.text}</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="final" className="relative flex-1 flex flex-col px-6 pb-[max(28px,env(safe-area-inset-bottom))]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex-1 flex items-center justify-center pt-6">
              <FinalVisual />
            </div>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8, ease }}>
              <h1 className="text-[34px] font-semibold leading-[1.06] tracking-[-0.045em]" data-testid="intro-title">
                <span className="block whitespace-nowrap">You can achieve more</span>
                <span className="block whitespace-nowrap text-sky">at every age.</span>
              </h1>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.7, ease }} className="mt-5 flex items-center gap-3">
              <Mark size={40} />
              <span className="text-[17px] text-soft">
                Start with <span className="text-fg font-semibold">Dreamscape</span>
              </span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 0.7, ease }} className="mt-7 space-y-2.5">
              <Button className="w-full" onClick={onStart} data-testid="onb-next">
                Start my dreamscape
              </Button>
              <Button variant="glass" className="w-full" onClick={onStories} data-testid="onb-stories">
                <Play size={15} fill="currentColor" /> Watch people who already achieved
              </Button>
              <Button variant="ghost" className="w-full !mt-0.5" onClick={onDemo} data-testid="onb-demo">
                Watch an example
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
