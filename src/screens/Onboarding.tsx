import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { Button, cx, Eyebrow } from '../components/ui'
import { chapterMonthLong } from '../lib/dates'
import { demoData } from '../lib/demo'
import { WINDOWS, type WindowId } from '../lib/planner'
import { firstOfMonth, useStore } from '../lib/store'
import { haptic, useUI } from '../lib/ui'
import Intro from './Intro'
import Stories from './Stories'

const HOURS = [60, 120, 180, 300, 480]

export default function Onboarding() {
  const finish = useStore((s) => s.finishOnboarding)
  const load = useStore((s) => s.load)
  const openStories = useUI((s) => s.openStories)
  const [intro, setIntro] = useState(true)
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

  const total = 4
  const canNext = step === 0 ? name.trim().length > 0 : step === 2 ? windows.length > 0 : true
  const next = () => {
    if (step < total - 1) return go(step + 1)
    finish({ name: name.trim(), weeklyMinutes: minutes, windows, start: startFor(startOffset) })
  }

  const choice = (on: boolean) => cx('w-full min-h-14 px-4 rounded-[18px] border flex items-center justify-between text-left', on ? 'bg-skysoft border-sky/40' : 'border-white/[0.1]')

  if (intro)
    return (
      <motion.div className="absolute inset-0 z-[70]" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        <Intro onStart={() => setIntro(false)} onDemo={() => load(demoData())} onStories={() => openStories({ hub: true, play: null })} />
        <Stories onStart={() => setIntro(false)} />
      </motion.div>
    )

  return (
    <motion.div className="absolute inset-0 z-[70] bg-ink flex flex-col" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="relative flex-1 flex flex-col px-6 pt-[max(58px,calc(env(safe-area-inset-top)+14px))] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between h-9">
          <button onClick={() => (step === 0 ? setIntro(true) : go(step - 1))} aria-label="Back" className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-fg/80">
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={cx('h-1 rounded-full transition-all', i === step ? 'w-5 bg-sky' : 'w-1.5 bg-white/20')} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: 'easeOut' }} className="flex-1 flex flex-col pt-10">
            {step === 0 && (
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

            {step === 1 && (
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

            {step === 2 && (
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

            {step === 3 && (
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

        <Button onClick={next} disabled={!canNext} data-testid="setup-next" className="w-full">
          {step === total - 1 ? 'Begin my journey' : 'Continue'}
        </Button>
      </div>
    </motion.div>
  )
}
