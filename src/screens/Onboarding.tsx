import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { ArtView } from '../components/ArtView'
import { Button, cx, Eyebrow } from '../components/ui'
import { getArtwork } from '../art'
import { chapterMonthName } from '../lib/dates'
import { demoData } from '../lib/demo'
import { WINDOWS, type WindowId } from '../lib/planner'
import { firstOfMonth, useStore } from '../lib/store'
import { haptic } from '../lib/ui'

const full = (id: string) => Object.fromEntries(getArtwork(id).regions.map((r) => [r.id, r.tone]))

const SLIDES = [
  { art: 'car', eyebrow: 'Dreamscape', title: 'Ваш возраст — не причина забыть о мечтах.', text: 'Мы вписываем реализацию мечты в вашу реальную жизнь — с работой, семьёй и обязательствами.' },
  { art: 'villa', eyebrow: 'Баланс', title: 'Больше не нужно выбирать между собой и обязанностями.', text: 'Приложение находит в вашей неделе время для важного. Без давления, без чувства вины.' },
  { art: 'yacht', eyebrow: '12 месяцев · 12 тем', title: 'Рефлексия. План. Итоги. Мечта.', text: 'Каждый месяц — новая тема и раскраска вашей мечты для доски визуализации.' },
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
  const start = (() => {
    const d = new Date()
    return firstOfMonth(new Date(d.getFullYear(), d.getMonth() + startOffset, 1))
  })()

  const total = SLIDES.length + 4
  const isSlide = step < SLIDES.length
  const slide = SLIDES[Math.min(step, SLIDES.length - 1)]!

  const canNext = step === SLIDES.length ? name.trim().length > 0 : step === SLIDES.length + 2 ? windows.length > 0 : true

  const next = () => {
    if (step < total - 1) return go(step + 1)
    finish({ name: name.trim(), weeklyMinutes: minutes, windows, start })
  }

  return (
    <motion.div className="absolute inset-0 z-[70] bg-ink flex flex-col" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      {isSlide && (
        <div className="absolute inset-x-0 top-0 h-[54%] overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div key={slide.art} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <ArtView id={slide.art} fills={full(slide.art)} className="w-full h-full" line="rgba(0,0,0,0.25)" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/10 via-50% to-ink" />
        </div>
      )}

      <div className="relative flex-1 flex flex-col px-6 pt-[max(56px,calc(env(safe-area-inset-top)+12px))] pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between h-8">
          {step > 0 ? (
            <button onClick={() => go(step - 1)} aria-label="Назад" className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-fg/80">
              <ChevronLeft size={22} />
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={cx('h-1 rounded-full transition-all', i === step ? 'w-5 bg-gold' : 'w-1.5 bg-white/20')} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={cx('flex-1 flex flex-col', isSlide ? 'justify-end pb-4' : 'pt-10')}
          >
            {isSlide && (
              <>
                <Eyebrow className="text-gold">{slide.eyebrow}</Eyebrow>
                <h1 className="serif text-[40px] leading-[1.02] mt-3">{slide.title}</h1>
                <p className="text-[16px] leading-relaxed text-mute mt-4">{slide.text}</p>
              </>
            )}

            {step === SLIDES.length && (
              <>
                <Eyebrow>Знакомство</Eyebrow>
                <h1 className="serif text-[36px] leading-[1.05] mt-3">Как к вам обращаться?</h1>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canNext && next()}
                  maxLength={40}
                  placeholder="Имя"
                  aria-label="Имя"
                  className="mt-8 h-16 rounded-2xl bg-white/[0.06] hairline px-5 text-[22px] outline-none focus:border-gold/60"
                />
              </>
            )}

            {step === SLIDES.length + 1 && (
              <>
                <Eyebrow>Время для себя</Eyebrow>
                <h1 className="serif text-[36px] leading-[1.05] mt-3">Сколько времени в неделю вы готовы отдавать мечтам?</h1>
                <p className="text-[15px] text-mute mt-3">Честно, с учётом работы и семьи. Это можно изменить в любой момент.</p>
                <div className="grid grid-cols-3 gap-2.5 mt-8" role="radiogroup" aria-label="Часов в неделю">
                  {HOURS.map((m) => (
                    <button
                      key={m}
                      role="radio"
                      aria-checked={minutes === m}
                      onClick={() => {
                        haptic()
                        setMinutes(m)
                      }}
                      className={cx('h-20 rounded-2xl hairline flex flex-col items-center justify-center', minutes === m ? 'bg-gold text-[#17130C]' : 'bg-white/[0.04]')}
                    >
                      <span className="text-[24px] font-semibold tnum">{m / 60}</span>
                      <span className={cx('text-[12px]', minutes === m ? 'text-[#17130C]/70' : 'text-mute')}>{m === 60 ? 'час' : m < 300 ? 'часа' : 'часов'}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === SLIDES.length + 2 && (
              <>
                <Eyebrow>Ваш ритм</Eyebrow>
                <h1 className="serif text-[36px] leading-[1.05] mt-3">Когда у вас обычно есть окно?</h1>
                <p className="text-[15px] text-mute mt-3">Шаги будут ложиться только в эти окна, вокруг ваших обязательств.</p>
                <div className="mt-7 space-y-2" role="group" aria-label="Окна">
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
                        className={cx('w-full h-14 px-4 rounded-2xl hairline flex items-center justify-between', on ? 'bg-goldsoft border-gold/40' : 'bg-white/[0.04]')}
                      >
                        <span className="text-[16px] font-medium">{w.label}</span>
                        <span className="flex items-center gap-3">
                          <span className="text-[13px] text-mute tnum">≈ {w.time}</span>
                          <span className={cx('w-6 h-6 rounded-full flex items-center justify-center', on ? 'bg-gold text-[#17130C]' : 'border border-white/20')}>{on && <Check size={15} strokeWidth={3} />}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {step === SLIDES.length + 3 && (
              <>
                <Eyebrow>Начало пути</Eyebrow>
                <h1 className="serif text-[36px] leading-[1.05] mt-3">С какого месяца начнём первую главу?</h1>
                <div className="mt-8 space-y-2" role="radiogroup" aria-label="Месяц начала">
                  {[0, 1].map((o) => {
                    const d = new Date()
                    const s = firstOfMonth(new Date(d.getFullYear(), d.getMonth() + o, 1))
                    return (
                      <button
                        key={o}
                        role="radio"
                        aria-checked={startOffset === o}
                        onClick={() => setStartOffset(o)}
                        className={cx('w-full h-16 px-5 rounded-2xl hairline flex items-center justify-between', startOffset === o ? 'bg-goldsoft border-gold/40' : 'bg-white/[0.04]')}
                      >
                        <span className="text-[17px] font-medium">{chapterMonthName(s, 1)}</span>
                        <span className="text-[13px] text-mute">{o === 0 ? 'сейчас' : 'со следующего'}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-[14px] text-mute mt-5 leading-relaxed">Двенадцать глав пройдут через весь год. Каждую можно открыть заранее или вернуться к ней позже — темп задаёте вы.</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <Button onClick={next} disabled={!canNext} data-testid="onb-next">
          {step === total - 1 ? 'Начать путь' : isSlide && step === 0 ? 'Начать' : 'Продолжить'}
        </Button>
        {step === 0 && (
          <Button variant="ghost" className="mt-1" onClick={() => load(demoData())} data-testid="onb-demo">
            Посмотреть на примере
          </Button>
        )}
      </div>
    </motion.div>
  )
}
