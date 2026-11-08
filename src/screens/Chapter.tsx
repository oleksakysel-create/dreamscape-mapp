import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Palette, PencilLine, Plus, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ArtView } from '../components/ArtView'
import { Button, Card, cx, Eyebrow, Segmented } from '../components/ui'
import { getTheme } from '../data/themes'
import { chapterMonthName } from '../lib/dates'
import { WINDOWS } from '../lib/planner'
import { chapterOf, chapterStages, nextStage, useStore, type StageId } from '../lib/store'
import { haptic, useUI } from '../lib/ui'
import { StepRow } from './Today'

const TABS: { id: StageId; label: string }[] = [
  { id: 'reflect', label: 'Рефлексия' },
  { id: 'plan', label: 'План' },
  { id: 'results', label: 'Итоги' },
  { id: 'color', label: 'Мечта' },
]

function Reflection({ month, onDone }: { month: number; onDone: () => void }) {
  const theme = getTheme(month)!
  const chapter = useStore((s) => chapterOf(s, month))
  const save = useStore((s) => s.saveAnswers)
  const finish = useStore((s) => s.finishReflection)
  const reopen = useStore((s) => s.reopenReflection)
  const [answers, setAnswers] = useState(chapter.answers)
  const [error, setError] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const locked = Boolean(chapter.reflectedAt)

  // autosave drafts
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
    <div className="space-y-6">
      {theme.questions.map((q, i) => (
        <div key={q.id}>
          <div className="flex gap-3">
            <span className="serif text-[22px] text-gold leading-none pt-0.5 tnum">{i + 1}</span>
            <div className="flex-1">
              <label htmlFor={q.id} className="block text-[17px] font-medium leading-snug">
                {q.prompt}
              </label>
              <div className="text-[13px] text-mute mt-1">{q.hint}</div>
            </div>
          </div>
          {q.kind === 'text' ? (
            <textarea
              id={q.id}
              data-testid={`answer-${q.id}`}
              readOnly={locked}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              placeholder="Ваш ответ…"
              rows={3}
              className={cx('mt-3 w-full rounded-2xl bg-white/[0.05] hairline px-4 py-3 text-[16px] leading-relaxed outline-none resize-none focus:border-gold/50', locked && 'opacity-80')}
            />
          ) : (
            <div className="mt-3 grid grid-cols-10 gap-1" role="radiogroup" aria-label={q.prompt}>
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
                  className={cx('h-11 rounded-xl text-[15px] font-semibold tnum', answers[q.id] === v ? 'bg-gold text-[#17130C]' : 'bg-white/[0.05] text-fg/80')}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      {error && !locked && <p className="text-[14px] text-rose">Ответьте хотя бы на два вопроса — пусть даже коротко.</p>}
      {locked ? (
        <Button variant="glass" className="w-full" onClick={() => reopen(month)}>
          <PencilLine size={18} /> Изменить ответы
        </Button>
      ) : (
        <Button className="w-full" onClick={complete} data-testid="finish-reflection">
          Завершить рефлексию
        </Button>
      )}
    </div>
  )
}

function Plan({ month }: { month: number }) {
  const theme = getTheme(month)!
  const chapter = useStore((s) => chapterOf(s, month))
  const steps = useStore((s) => s.steps).filter((s) => s.month === month)
  const profile = useStore((s) => s.profile!)
  const openSheet = useUI((s) => s.openSheet)
  const own = (chapter.answers[theme.stepQuestion] ?? '').trim()
  const taken = new Set(steps.map((s) => s.title.toLowerCase()))

  return (
    <div className="space-y-5">
      {own && !taken.has(own.toLowerCase()) && (
        <Card className="p-5 border-gold/30 bg-goldsoft">
          <Eyebrow className="text-gold">Из вашей рефлексии</Eyebrow>
          <div className="text-[17px] font-medium mt-2 leading-snug">«{own}»</div>
          <Button className="w-full mt-4 h-12" onClick={() => openSheet({ type: 'addStep', month, title: own })} data-testid="add-own-step">
            <Plus size={18} /> Вписать в неделю
          </Button>
        </Card>
      )}
      {!chapter.reflectedAt && !own && (
        <Card className="p-5">
          <div className="text-[15px] text-mute">План строится из ответов. Начните с рефлексии — или добавьте свой шаг прямо сейчас.</div>
        </Card>
      )}
      <div>
        <Eyebrow className="px-1">Идеи для мечты «{theme.dream}»</Eyebrow>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {theme.suggestions
            .filter((s) => !taken.has(s.toLowerCase()))
            .map((s) => (
              <button key={s} onClick={() => openSheet({ type: 'addStep', month, title: s })} className="px-3.5 py-2.5 rounded-2xl bg-white/[0.05] hairline text-[14px] text-left flex items-center gap-2">
                <Plus size={14} className="text-gold shrink-0" /> {s}
              </button>
            ))}
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between px-1">
          <Eyebrow>Шаги месяца</Eyebrow>
          <button onClick={() => openSheet({ type: 'addStep', month })} className="text-[14px] text-gold font-semibold" data-testid="add-step">
            + Свой шаг
          </button>
        </div>
        {steps.length ? (
          <Card className="px-4 mt-2 divide-y divide-white/[0.06]">
            {steps.map((s) => (
              <StepRow key={s.id} step={s} onClick={() => openSheet({ type: 'step', id: s.id })} />
            ))}
          </Card>
        ) : (
          <p className="text-[14px] text-mute px-1 mt-2">Пока пусто. Один небольшой шаг — уже движение.</p>
        )}
        <p className="text-[12.5px] text-mute/80 px-1 mt-3 leading-relaxed">
          Шаги ложатся в ваши окна ({profile.windows.map((w) => WINDOWS.find((x) => x.id === w)!.label.toLowerCase()).join(', ')}) и не превышают {Math.round(profile.weeklyMinutes / 60)} ч в неделю. Если неделя заполнена — переносим, а не перегружаем.
        </p>
      </div>
    </div>
  )
}

function Results({ month }: { month: number }) {
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
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        {[
          ['Сделано', count('done'), 'text-sage'],
          ['Частично', count('partly'), 'text-gold'],
          ['Отпущено', count('released'), 'text-mute'],
        ].map(([l, n, c]) => (
          <Card key={l as string} className="p-4">
            <div className={cx('serif text-[34px] leading-none tnum', c as string)}>{n}</div>
            <div className="text-[12px] text-mute mt-1">{l}</div>
          </Card>
        ))}
      </div>
      {steps.length > 0 ? (
        <Card className="px-4 divide-y divide-white/[0.06]">
          {steps.map((s) => (
            <div key={s.id}>
              <StepRow step={s} onClick={() => openSheet({ type: 'step', id: s.id })} />
              {s.result && <div className="text-[13px] text-fg/70 pb-3 pl-[46px] -mt-1 italic">«{s.result}»</div>}
            </div>
          ))}
        </Card>
      ) : (
        <p className="text-[14px] text-mute">Здесь появятся итоги ваших шагов. Отмечайте, что получилось, — без оценок.</p>
      )}
      <div>
        <label htmlFor="closing" className="block text-[17px] font-medium">Что этот месяц изменил для вас?</label>
        <textarea
          id="closing"
          value={note}
          onChange={(e) => setLocal(e.target.value)}
          rows={3}
          placeholder="Пара предложений для себя через год"
          className="mt-3 w-full rounded-2xl bg-white/[0.05] hairline px-4 py-3 text-[16px] leading-relaxed outline-none resize-none focus:border-gold/50"
        />
      </div>
    </div>
  )
}

function Dream({ month }: { month: number }) {
  const theme = getTheme(month)!
  const data = useStore()
  const c = chapterOf(data, month)
  const st = chapterStages(data, month)
  const openStudio = useUI((s) => s.openStudio)
  const caption = (c.answers[theme.dreamQuestion] ?? '').trim()
  return (
    <div className="space-y-5">
      <button onClick={() => openStudio(month)} className="block w-full rounded-[24px] overflow-hidden bg-white" aria-label="Открыть раскраску">
        <ArtView id={theme.art} fills={c.fills} className="w-full aspect-[3/4]" />
      </button>
      {caption && (
        <p className="serif text-[22px] leading-snug text-fg/90">
          <span className="text-gold">“</span>
          {caption}
          <span className="text-gold">”</span>
        </p>
      )}
      <div className="flex items-center justify-between text-[14px]">
        <span className="text-mute">{st.color ? 'Раскраска завершена — она на вашей доске' : 'Раскрашено'}</span>
        <span className="tnum font-semibold">{Math.round(st.coloring * 100)}%</span>
      </div>
      <Button className="w-full" onClick={() => openStudio(month)} data-testid="open-studio">
        <Palette size={18} /> {st.coloring === 0 ? 'Раскрасить мечту' : st.color ? 'Открыть раскраску' : 'Продолжить раскраску'}
      </Button>
    </div>
  )
}

export default function Chapter({ month, onBack }: { month: number; onBack: () => void }) {
  const theme = getTheme(month)!
  const data = useStore()
  const c = chapterOf(data, month)
  const [tab, setTab] = useState<StageId>(() => nextStage(data, month) ?? 'reflect')
  const notify = useUI((s) => s.notify)

  return (
    <div>
      <div className="relative h-[360px] overflow-hidden">
        <ArtView id={theme.art} fills={c.fills} className="absolute inset-0 w-full h-full" line="rgba(0,0,0,0.3)" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <button onClick={onBack} aria-label="Назад" className="absolute left-4 top-[max(54px,calc(env(safe-area-inset-top)+8px))] w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft size={22} />
        </button>
        <div className="absolute inset-x-0 bottom-0 px-5 pb-4">
          <Eyebrow className="text-gold">
            Глава {month} · {chapterMonthName(data.profile!.start, month)}
          </Eyebrow>
          <h1 className="serif text-[44px] leading-none mt-2">{theme.title}</h1>
          <p className="text-[14.5px] text-fg/70 mt-2 leading-relaxed">{theme.intro}</p>
        </div>
      </div>
      <div className="px-5 pt-3 sticky top-0 z-10">
        <div className="glass rounded-[20px] p-1">
          <Segmented value={tab} onChange={setTab} options={TABS} />
        </div>
      </div>
      <div className="px-5 pt-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {tab === 'reflect' && (
              <Reflection
                month={month}
                onDone={() => {
                  notify('Рефлексия сохранена', 'Теперь превратим ответы в план')
                  setTab('plan')
                }}
              />
            )}
            {tab === 'plan' && <Plan month={month} />}
            {tab === 'results' && <Results month={month} />}
            {tab === 'color' && <Dream month={month} />}
          </motion.div>
        </AnimatePresence>
        {tab === 'plan' && (
          <p className="mt-6 flex items-center gap-2 text-[12.5px] text-mute">
            <Sparkles size={14} className="text-gold" /> Мечта месяца ждёт во вкладке «Мечта».
          </p>
        )}
      </div>
    </div>
  )
}
