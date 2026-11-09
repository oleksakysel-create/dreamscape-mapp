import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Quote } from '../components/DreamCard'
import { Button, cx, Eyebrow } from '../components/ui'
import { chapterMonthLong } from '../lib/dates'
import { demoData } from '../lib/demo'
import { WINDOWS, type WindowId } from '../lib/planner'
import { firstOfMonth, useStore } from '../lib/store'
import { haptic } from '../lib/ui'

function WordsVisual() {
  return (
    <div className="dream-surface rounded-[28px] p-5 w-[270px] -rotate-2 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
      <div className="text-[11px] font-medium tracking-[0.06em] uppercase text-mute">Chapter 6 · Courage</div>
      <div className="mt-6">
        <Quote size={44} />
      </div>
      <p className="mt-3 text-[21px] font-medium leading-[1.2] tracking-[-0.03em]">A test drive in May — and my own in two years.</p>
      <div className="mt-5 text-[12px] text-mute">Your words · Sports car</div>
    </div>
  )
}

function WeekVisual() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const marks = [1, 0, 0, 1, 0, 1, 0]
  return (
    <div className="w-[290px] rounded-[28px] bg-card border border-white/[0.07] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between text-[13px]">
        <span className="text-mute">Time for yourself</span>
        <span>
          <b className="font-semibold">2 h</b> <span className="text-mute">of 4 h</span>
        </span>
      </div>
      <div className="mt-3 h-1 rounded-full bg-white/10">
        <div className="h-full w-1/2 bg-sky rounded-full" />
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {days.map((d, i) => (
          <div key={d} className="flex flex-col items-center gap-1.5">
            <span className="text-[11px] text-mute">{d}</span>
            <span className={cx('w-2 h-2 rounded-full', marks[i] ? 'bg-sky' : 'bg-white/10')} />
          </div>
        ))}
      </div>
    </div>
  )
}

function PhotoVisual() {
  return (
    <div className="w-[240px] rotate-2">
      <img src="./demo/sea.jpg" alt="" className="w-full aspect-[4/5] object-cover rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.55)]" />
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-[17px] font-semibold">Islands</span>
        <span className="text-[12px] font-semibold text-sage">Came true</span>
      </div>
    </div>
  )
}

const SLIDES: { visual: ReactNode; eyebrow: string; title: string; text: string }[] = [
  { visual: <WordsVisual />, eyebrow: 'Dreamscape', title: 'Your age is no reason to forget your dreams.', text: 'We fit your dreams into your real life — around work, family and everything else you carry.' },
  { visual: <WeekVisual />, eyebrow: 'Balance', title: 'No more choosing between yourself and your obligations.', text: 'Dreamscape finds time for what matters inside your actual week. No pressure, no guilt.' },
  { visual: <PhotoVisual />, eyebrow: '12 months · 12 themes', title: 'Your words until it happens. A photo once it does.', text: 'Thoughts, a gentle plan, small steps — and one day, a picture of the dream that came true.' },
]

const HOURS = [60, 120, 180, 300, 480]

export default function Onboarding() {
  const finish = useStore((s) => s.finishOnboarding)
  const load = useStore((s) => s.load)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [minutes, setMinutes] = useState(180)
  const [windows, setWindows] = useState<WindowId[]>(['wd-morning', 'we-morning'])
  const [startOffset, setStartOffset] = useState(0)

  const go = (n: number) => {
    haptic()
    setStep(n)
  }
  const startFor = (o: number) => {
    const d = new Date()
    return firstOfMonth(new Date(d.getFullYear(), d.getMonth() + o, 1))
  }

  const total = SLIDES.length + 4
  const isSlide = step < SLIDES.length
  const slide = SLIDES[Math.min(step, SLIDES.length - 1)]!
  const canNext = step === SLIDES.length ? name.trim().length > 0 : step === SLIDES.length + 2 ? windows.length > 0 : true
  const next = () => {
    if (step < total - 1) return go(step + 1)
    finish({ name: name.trim(), weeklyMinutes: minutes, windows, start: startFor(startOffset) })
  }

  const choice = (on: boolean) => cx('w-full min-h-14 px-4 rounded-[18px] border flex items-center justify-between text-left', on ? 'bg-skysoft border-sky/40' : 'border-white/[0.1]')

  return (
    <motion.div className="absolute inset-0 z-[70] bg-ink flex flex-col" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="relative flex-1 flex flex-col px-6 pt-[max(58px,calc(env(safe-area-inset-top)+14px))] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between h-9">
          {step > 0 ? (
            <button onClick={() => go(step - 1)} aria-label="Back" className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-fg/80">
              <ChevronLeft size={24} />
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={cx('h-1 rounded-full transition-all', i === step ? 'w-5 bg-sky' : 'w-1.5 bg-white/20')} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: 'easeOut' }} className={cx('flex-1 flex flex-col', !isSlide && 'pt-10')}>
            {isSlide && (
              <>
                <div className="flex-1 flex items-center justify-center py-6">{slide.visual}</div>
                <Eyebrow className="text-sky">{slide.eyebrow}</Eyebrow>
                <h1 className="text-[32px] font-semibold leading-[1.08] tracking-tightest mt-3">{slide.title}</h1>
                <p className="text-[16px] leading-relaxed text-mute mt-3 mb-6">{slide.text}</p>
              </>
            )}

            {step === SLIDES.length && (
              <>
                <Eyebrow>Hello</Eyebrow>
                <h1 className="text-[32px] font-semibold leading-[1.08] tracking-tightest mt-3">What should we call you?</h1>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canNext && next()}
                  maxLength={40}
                  placeholder="Your name"
                  aria-label="Name"
                  className="mt-10 h-16 border-0 border-b border-white/[0.2] bg-transparent text-[26px] outline-none focus:border-sky"
                />
              </>
            )}

            {step === SLIDES.length + 1 && (
              <>
                <Eyebrow>Time for yourself</Eyebrow>
                <h1 className="text-[32px] font-semibold leading-[1.08] tracking-tightest mt-3">How much time a week can you give your dreams?</h1>
                <p className="text-[15px] text-mute mt-3">Honestly, with work and family in mind. You can change it any time.</p>
                <div className="grid grid-cols-3 gap-2.5 mt-8" role="radiogroup" aria-label="Hours a week">
                  {HOURS.map((m) => (
                    <button
                      key={m}
                      role="radio"
                      aria-checked={minutes === m}
                      onClick={() => {
                        haptic()
                        setMinutes(m)
                      }}
                      className={cx('h-20 rounded-[20px] flex flex-col items-center justify-center', minutes === m ? 'bg-paper text-[#141414]' : 'border border-white/[0.1]')}
                    >
                      <span className="text-[24px] font-semibold tnum">{m / 60}</span>
                      <span className={cx('text-[12px]', minutes === m ? 'text-[#141414]/60' : 'text-mute')}>{m === 60 ? 'hour' : 'hours'}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === SLIDES.length + 2 && (
              <>
                <Eyebrow>Your rhythm</Eyebrow>
                <h1 className="text-[32px] font-semibold leading-[1.08] tracking-tightest mt-3">When do you usually have a window?</h1>
                <p className="text-[15px] text-mute mt-3">Steps only go into these windows, around your obligations.</p>
                <div className="mt-7 space-y-2" role="group" aria-label="Windows">
                  {WINDOWS.map((w) => {
                    const on = windows.includes(w.id)
                    return (
                      <button
                        key={w.id}
                        role="checkbox"
                        aria-checked={on}
                        onClick={() => {
                          haptic()
                          setWindows((ws) => (on ? ws.filter((x) => x !== w.id) : [...ws, w.id]))
                        }}
                        className={choice(on)}
                      >
                        <span className="text-[16px] font-medium">{w.label}</span>
                        <span className="flex items-center gap-3">
                          <span className="text-[13px] text-mute tnum">≈ {w.time}</span>
                          <span className={cx('w-6 h-6 rounded-full flex items-center justify-center', on ? 'bg-sky text-[#0B1622]' : 'border border-white/20')}>{on && <Check size={15} strokeWidth={3} />}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {step === SLIDES.length + 3 && (
              <>
                <Eyebrow>The first chapter</Eyebrow>
                <h1 className="text-[32px] font-semibold leading-[1.08] tracking-tightest mt-3">When should chapter one begin?</h1>
                <div className="mt-8 space-y-2" role="radiogroup" aria-label="Start month">
                  {[0, 1].map((o) => (
                    <button key={o} role="radio" aria-checked={startOffset === o} onClick={() => setStartOffset(o)} className={choice(startOffset === o)}>
                      <span className="text-[17px] font-medium">{chapterMonthLong(startFor(o), 1)}</span>
                      <span className="text-[13px] text-mute">{o === 0 ? 'this month' : 'next month'}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[14px] text-mute mt-5 leading-relaxed">Twelve chapters run through the year. Open any of them early or come back later — you set the pace.</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <Button onClick={next} disabled={!canNext} data-testid="onb-next" className="w-full">
          {step === total - 1 ? 'Begin my journey' : step === 0 ? 'Get started' : 'Continue'}
        </Button>
        {step === 0 && (
          <Button variant="ghost" className="mt-1 w-full" onClick={() => load(demoData())} data-testid="onb-demo">
            See an example
          </Button>
        )}
      </div>
    </motion.div>
  )
}
