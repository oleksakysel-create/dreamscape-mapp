import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Palette, PencilLine, Plus, Share } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { DreamCard } from '../components/DreamCard'
import { Button, cx, Eyebrow, NavBar, UnderlineTabs } from '../components/ui'
import { getTheme } from '../data/themes'
import { chapterMonthLong } from '../lib/dates'
import { WINDOWS } from '../lib/planner'
import { chapterOf, chapterStages, nextStage, STAGES, useStore, type StageId } from '../lib/store'
import { haptic, useUI } from '../lib/ui'
import { StepRow } from './Today'

const field = 'w-full border-0 border-b border-white/[0.16] bg-transparent py-2 text-[16px] leading-relaxed outline-none resize-none focus:border-sky'

function Thoughts({ month, onDone }: { month: number; onDone: () => void }) {
  const theme = getTheme(month)!
  const chapter = useStore((s) => chapterOf(s, month))
  const save = useStore((s) => s.saveAnswers)
  const finish = useStore((s) => s.finishReflection)
  const reopen = useStore((s) => s.reopenReflection)
  const [answers, setAnswers] = useState(chapter.answers)
  const [error, setError] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const locked = Boolean(chapter.reflectedAt)

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => save(month, answers), 500)
    return () => clearTimeout(timer.current)
  }, [answers, month, save])

  const complete = () => {
    const filled = theme.questions.filter((q) => (answers[q.id] ?? '').trim()).length
    if (filled < 2) return setError(true)
    save(month, answers)
    finish(month)
    onDone()
  }

  return (
    <div className="space-y-8">
      {theme.questions.map((q, i) => (
        <div key={q.id} className="space-y-2">
          <div className="text-[12px] text-mute tnum">
            {i + 1} / {theme.questions.length}
            {q.id === theme.dreamQuestion && <span className="text-sky"> · shown on your dream card</span>}
          </div>
          <label htmlFor={q.id} className="block text-[19px] font-medium leading-[1.3] tracking-[-0.025em]">
            {q.prompt}
          </label>
          <div className="text-[13px] text-mute">{q.hint}</div>
          {q.kind === 'text' ? (
            <textarea
              id={q.id}
              data-testid={`answer-${q.id}`}
              readOnly={locked}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              placeholder="Your answer…"
              rows={2}
              className={cx(field, locked && 'text-soft')}
            />
          ) : (
            <div className="pt-1 grid grid-cols-10 gap-1" role="radiogroup" aria-label={q.prompt}>
              {Array.from({ length: 10 }, (_, k) => String(k + 1)).map((v) => (
                <button
                  key={v}
                  role="radio"
                  aria-checked={answers[q.id] === v}
                  disabled={locked}
                  data-testid={`scale-${q.id}-${v}`}
                  onClick={() => {
                    haptic()
                    setAnswers((a) => ({ ...a, [q.id]: v }))
                  }}
                  className={cx('h-11 rounded-[12px] text-[15px] font-semibold tnum', answers[q.id] === v ? 'bg-sky text-[#0B1622]' : 'bg-white/[0.06] text-soft')}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      {error && !locked && <p className="text-[14px] text-rose">Answer at least two questions — even briefly.</p>}
      {locked ? (
        <Button variant="glass" className="w-full" onClick={() => reopen(month)}>
          <PencilLine size={18} /> Edit answers
        </Button>
      ) : (
        <Button className="w-full" onClick={complete} data-testid="finish-thoughts">
          Save my thoughts
        </Button>
      )}
    </div>
  )
}

function Plan({ month }: { month: number }) {
  const theme = getTheme(month)!
  const chapter = useStore((s) => chapterOf(s, month))
  const allSteps = useStore((s) => s.steps)
  const steps = allSteps.filter((s) => s.month === month)
  const profile = useStore((s) => s.profile!)
  const openSheet = useUI((s) => s.openSheet)
  const own = (chapter.answers[theme.stepQuestion] ?? '').trim()
  const taken = new Set(steps.map((s) => s.title.toLowerCase()))

  return (
    <div className="space-y-7">
      {own && !taken.has(own.toLowerCase()) && (
        <div className="rounded-[24px] p-5 bg-skysoft border border-sky/20">
          <Eyebrow className="text-sky">From your thoughts</Eyebrow>
          <div className="text-[17px] font-medium mt-2 leading-snug">“{own}”</div>
          <Button className="w-full mt-4 h-12" onClick={() => openSheet({ type: 'addStep', month, title: own })} data-testid="add-own-step">
            <Plus size={18} /> Fit it into my week
          </Button>
        </div>
      )}
      {!own && !chapter.reflectedAt && <p className="text-[15px] text-mute leading-relaxed">The plan grows out of your thoughts. Start there — or add your own step right now.</p>}
      <div>
        <Eyebrow>Ideas for “{theme.dream}”</Eyebrow>
        <div className="mt-3 flex flex-wrap gap-2">
          {theme.suggestions
            .filter((s) => !taken.has(s.toLowerCase()))
            .map((s) => (
              <button key={s} onClick={() => openSheet({ type: 'addStep', month, title: s })} className="px-3.5 py-2.5 rounded-[16px] border border-white/[0.12] text-[14px] text-left flex items-center gap-2">
                <Plus size={14} className="text-sky shrink-0" /> {s}
              </button>
            ))}
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <Eyebrow>Steps this month</Eyebrow>
          <button onClick={() => openSheet({ type: 'addStep', month })} className="text-[14px] text-sky font-semibold" data-testid="add-step">
            + Your own step
          </button>
        </div>
        {steps.length ? (
          <div className="mt-1 divide-y divide-white/[0.08]">
            {steps.map((s) => (
              <StepRow key={s.id} step={s} onClick={() => openSheet({ type: 'step', id: s.id })} />
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-mute mt-3">Nothing yet. One small step is already movement.</p>
        )}
        <p className="text-[12.5px] text-mute/90 mt-4 leading-relaxed">
          Steps go into your windows ({profile.windows.map((w) => WINDOWS.find((x) => x.id === w)!.label.toLowerCase()).join(', ')}) and never exceed {Math.round(profile.weeklyMinutes / 60)} h a week. If a week is full, we move things — we don’t overload you.
        </p>
      </div>
    </div>
  )
}

function Create({ month }: { month: number }) {
  const steps = useStore((s) => s.steps).filter((s) => s.month === month)
  const chapter = useStore((s) => chapterOf(s, month))
  const setNote = useStore((s) => s.setClosingNote)
  const openSheet = useUI((s) => s.openSheet)
  const [note, setLocal] = useState(chapter.closingNote ?? '')
  useEffect(() => {
    const t = setTimeout(() => setNote(month, note), 500)
    return () => clearTimeout(t)
  }, [note, month, setNote])
  const count = (st: string) => steps.filter((s) => s.status === st).length

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-3 text-center">
        {(
          [
            ['Done', count('done')],
            ['Partly', count('partly')],
            ['Let go', count('released')],
          ] as const
        ).map(([l, n]) => (
          <div key={l} className="flex flex-col gap-0.5">
            <span className="text-[26px] font-medium tnum tracking-tight">{n}</span>
            <span className="text-[12px] text-mute">{l}</span>
          </div>
        ))}
      </div>
      {steps.length > 0 ? (
        <div className="divide-y divide-white/[0.08]">
          {steps.map((s) => (
            <div key={s.id}>
              <StepRow step={s} onClick={() => openSheet({ type: 'step', id: s.id })} />
              {s.result && <div className="text-[13.5px] text-soft pb-3 pl-[34px] -mt-1">“{s.result}”</div>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[14px] text-mute">Your steps and what came of them will appear here. Tap a step to log it — no grades.</p>
      )}
      <div className="space-y-1">
        <label htmlFor="closing" className="block text-[17px] font-medium">
          What did this month change for you?
        </label>
        <textarea id="closing" value={note} onChange={(e) => setLocal(e.target.value)} rows={2} placeholder="A couple of sentences for yourself a year from now" className={field} />
      </div>
    </div>
  )
}

function Result({ month }: { month: number }) {
  const theme = getTheme(month)!
  const chapter = useStore((s) => chapterOf(s, month))
  const unfulfill = useStore((s) => s.unfulfill)
  const ui = useUI()
  if (chapter.fulfilledAt) {
    return (
      <div className="space-y-3">
        <p className="text-[15px] text-soft leading-relaxed">It came true. Your photo is now the cover of this dream on the board.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="glass" onClick={() => ui.openSheet({ type: 'attach', month })}>
            <Camera size={18} /> Change photo
          </Button>
          <Button onClick={() => ui.openSheet({ type: 'share', month })}>
            <Share size={18} /> Share
          </Button>
        </div>
        <button onClick={() => unfulfill(month)} className="w-full h-11 text-[13px] text-mute">
          Mark as not yet fulfilled
        </button>
      </div>
    )
  }
  return (
    <div className="space-y-5">
      <p className="text-[15px] text-soft leading-relaxed">
        When “{theme.dream.toLowerCase()}” comes true, add a real photo of it. Until then, your own words stay on the card — there’s no deadline.
      </p>
      <Button className="w-full" onClick={() => ui.openSheet({ type: 'attach', month })} data-testid="open-attach">
        <Camera size={18} /> It came true — add a photo
      </Button>
      <Button
        variant="glass"
        className="w-full"
        onClick={() => {
          ui.openChapter(null)
          ui.setTab('pause')
          ui.openStudio(month)
        }}
      >
        <Palette size={18} /> Color this dream while you wait
      </Button>
    </div>
  )
}

export default function Chapter({ month, back, onBack }: { month: number; back: string; onBack: () => void }) {
  const theme = getTheme(month)!
  const data = useStore()
  const st = chapterStages(data, month)
  const [tab, setTab] = useState<StageId>(() => nextStage(data, month))
  const ui = useUI()
  const done: Record<StageId, boolean> = { thoughts: st.thoughts, plan: st.plan, create: st.create, result: st.result }

  return (
    <div>
      <NavBar
        back={back}
        onBack={onBack}
        title={theme.dream}
        right={
          <button aria-label="Share" onClick={() => ui.openSheet({ type: 'share', month })} className="w-11 h-11 flex items-center justify-center text-sky" data-testid="chapter-share">
            <Share size={21} strokeWidth={1.9} />
          </button>
        }
      />
      <div className="px-5 pt-3 pb-5 space-y-1.5">
        <div className="text-[13px] text-mute">
          Chapter {month} · {chapterMonthLong(data.profile!.start, month)}
        </div>
        <h1 className="text-[30px] font-semibold tracking-tightest leading-[1.05]">{theme.title}</h1>
        <p className="text-[14.5px] text-mute leading-relaxed">{theme.intro}</p>
      </div>
      <div className="px-4">
        <DreamCard month={month} meta={false} minHeight={280} />
      </div>
      <div className="px-5 pt-6 sticky top-[env(safe-area-inset-top)] sm:top-[54px] z-10 bg-ink/95 backdrop-blur">
        <UnderlineTabs value={tab} onChange={setTab} options={STAGES.map((s) => ({ ...s, done: done[s.id] }))} />
      </div>
      <div className="px-5 pt-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {tab === 'thoughts' && (
              <Thoughts
                month={month}
                onDone={() => {
                  ui.notify('Thoughts saved', 'Now let’s turn them into a plan')
                  setTab('plan')
                }}
              />
            )}
            {tab === 'plan' && <Plan month={month} />}
            {tab === 'create' && <Create month={month} />}
            {tab === 'result' && <Result month={month} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
