import { CalendarArrowUp, Check, CircleDashed, Download, Leaf, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getArtwork } from '../art'
import { getTheme } from '../data/themes'
import { addDays, dayLabel, dayShort, minutesLabel, parseYmd, startOfWeek, ymd } from '../lib/dates'
import { exportPng } from '../lib/export'
import { findSlot, weekSlots, windowOf, type Horizon, type StepStatus, type WindowId } from '../lib/planner'
import { chapterOf, useStore } from '../lib/store'
import { haptic, useUI } from '../lib/ui'
import { ArtView } from './ArtView'
import { Button, cx, Eyebrow, Segmented, Sheet } from './ui'

const DURATIONS = [15, 30, 45, 60, 90, 120]

function AddStepSheet({ month, initialTitle, onClose }: { month: number; initialTitle?: string; onClose: () => void }) {
  const profile = useStore((s) => s.profile!)
  const steps = useStore((s) => s.steps)
  const addStep = useStore((s) => s.addStep)
  const notify = useUI((s) => s.notify)
  const [title, setTitle] = useState(initialTitle ?? '')
  const [minutes, setMinutes] = useState(30)
  const [horizon, setHorizon] = useState<Horizon>('week')
  const auto = useMemo(() => findSlot(profile, steps, minutes), [profile, steps, minutes])
  const [pick, setPick] = useState<{ date: string; window: WindowId } | null>(null)
  useEffect(() => setPick(null), [minutes])
  const chosen = pick ?? auto

  const options = useMemo(() => {
    const today = ymd(new Date())
    const w0 = startOfWeek(new Date())
    return [...weekSlots(profile, steps, w0), ...weekSlots(profile, steps, addDays(w0, 7))]
      .filter((s) => s.date >= today && s.capacity - s.used >= Math.min(minutes, s.capacity))
      .slice(0, 8)
  }, [profile, steps, minutes])

  const save = () => {
    const t = title.trim()
    if (!t) return
    const s = addStep({ month, title: t, minutes, horizon, ...(horizon === 'week' && chosen ? { date: chosen.date, window: chosen.window } : {}) })
    haptic(12)
    if (s.date) {
      const d = parseYmd(s.date)
      const nextWeek = d >= addDays(startOfWeek(new Date()), 7)
      notify(nextWeek ? 'Эта неделя заполнена' : 'Вписано в неделю', `${dayLabel(d)} · ${windowOf(s.window!).label.toLowerCase()}`)
    } else notify('Шаг добавлен', horizon === 'month' ? 'Сделаете, когда будет окно в этом месяце' : 'Без даты и без спешки')
    onClose()
  }

  return (
    <div className="space-y-5 pb-2">
      <input
        autoFocus={!initialTitle}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Что вы сделаете?"
        aria-label="Шаг"
        data-testid="step-title"
        className="w-full h-14 rounded-2xl bg-white/[0.06] hairline px-4 text-[17px] outline-none focus:border-gold/50"
      />
      <div>
        <Eyebrow>Сколько времени</Eyebrow>
        <div className="mt-2 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Длительность">
          {DURATIONS.map((m) => (
            <button
              key={m}
              role="radio"
              aria-checked={minutes === m}
              onClick={() => setMinutes(m)}
              className={cx('h-11 rounded-xl text-[13px] font-semibold tnum', minutes === m ? 'bg-gold text-[#17130C]' : 'bg-white/[0.05]')}
            >
              {m < 60 ? `${m}м` : `${m / 60}ч`}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Eyebrow>Когда</Eyebrow>
        <div className="mt-2">
          <Segmented
            value={horizon}
            onChange={setHorizon}
            options={[
              { id: 'week', label: 'Вписать' },
              { id: 'month', label: 'В этом месяце' },
              { id: 'someday', label: 'Без даты' },
            ]}
          />
        </div>
        {horizon === 'week' &&
          (chosen ? (
            <div className="mt-3">
              <div className="text-[14px] text-mute">Свободное окно, которое мы нашли:</div>
              <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
                {(options.some((o) => o.date === chosen.date && o.window === chosen.window) ? options : [{ ...chosen, capacity: 0, used: 0 }, ...options]).map((o) => {
                  const on = o.date === chosen.date && o.window === chosen.window
                  const d = parseYmd(o.date)
                  return (
                    <button
                      key={o.date + o.window}
                      onClick={() => setPick({ date: o.date, window: o.window })}
                      className={cx('shrink-0 px-3.5 py-2.5 rounded-2xl text-left hairline', on ? 'bg-goldsoft border-gold/50' : 'bg-white/[0.04]')}
                    >
                      <div className="text-[14px] font-semibold">
                        {dayShort(d)}, {d.getDate()}
                      </div>
                      <div className="text-[12px] text-mute">{windowOf(o.window).label.toLowerCase()}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-[14px] text-mute">Ближайшие недели заполнены. Сохраним шаг без даты — он подождёт свободного окна.</p>
          ))}
      </div>
      <Button className="w-full" onClick={save} disabled={!title.trim()} data-testid="save-step">
        Сохранить шаг
      </Button>
    </div>
  )
}

function StepSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const step = useStore((s) => s.steps.find((x) => x.id === id))
  const log = useStore((s) => s.logResult)
  const reschedule = useStore((s) => s.reschedule)
  const remove = useStore((s) => s.removeStep)
  const notify = useUI((s) => s.notify)
  const [note, setNote] = useState(step?.result ?? '')
  if (!step) return null
  const when = step.date ? `${dayLabel(parseYmd(step.date))} · ${step.window ? windowOf(step.window).label.toLowerCase() : ''}` : step.horizon === 'month' ? 'В этом месяце' : 'Без даты'

  const mark = (status: StepStatus, title: string) => {
    haptic(12)
    log(step.id, status, note.trim() || undefined)
    notify(title)
    onClose()
  }

  return (
    <div className="space-y-5 pb-2">
      <div>
        <div className="text-[19px] font-semibold leading-snug">{step.title}</div>
        <div className="text-[14px] text-mute mt-1">
          {when} · {minutesLabel(step.minutes)} · {getTheme(step.month)!.title}
        </div>
      </div>
      <div>
        <label htmlFor="result" className="text-[15px] font-medium">Что получилось?</label>
        <textarea
          id="result"
          data-testid="step-result"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Пара слов для себя — по желанию"
          className="mt-2 w-full rounded-2xl bg-white/[0.06] hairline px-4 py-3 text-[16px] outline-none resize-none focus:border-gold/50"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => mark('done', 'Отмечено — так держать')} data-testid="mark-done">
          <Check size={18} /> Сделано
        </Button>
        <Button variant="glass" onClick={() => mark('partly', 'Частично — это тоже движение')} data-testid="mark-partly">
          <CircleDashed size={18} /> Частично
        </Button>
        <Button
          variant="glass"
          onClick={() => {
            const n = reschedule(step.id)
            notify('Перенесено', n?.date ? `${dayLabel(parseYmd(n.date))} · ${windowOf(n.window!).label.toLowerCase()}` : 'Без даты — когда появится окно')
            onClose()
          }}
          data-testid="mark-move"
        >
          <CalendarArrowUp size={18} /> Перенести
        </Button>
        <Button variant="glass" onClick={() => mark('released', 'Отпустили. Это тоже решение')}>
          <Leaf size={18} /> Отпустить
        </Button>
      </div>
      <button
        onClick={() => {
          remove(step.id)
          onClose()
        }}
        className="w-full h-11 text-[14px] text-mute flex items-center justify-center gap-2"
      >
        <Trash2 size={15} /> Удалить шаг
      </button>
    </div>
  )
}

function DreamSheet({ month }: { month: number }) {
  const theme = getTheme(month)!
  const c = useStore((s) => chapterOf(s, month))
  const caption = (c.answers[theme.dreamQuestion] ?? '').trim()
  return (
    <div className="space-y-4 pb-2">
      <div className="rounded-[22px] overflow-hidden bg-white">
        <ArtView id={theme.art} fills={c.fills} className="w-full aspect-[3/4]" />
      </div>
      {caption && <p className="serif text-[22px] leading-snug">«{caption}»</p>}
      <Button variant="glass" className="w-full" onClick={() => void exportPng(getArtwork(theme.art), c.fills, `dreamscape-${theme.art}.png`)}>
        <Download size={18} /> Сохранить изображение
      </Button>
    </div>
  )
}

export function Sheets() {
  const sheet = useUI((s) => s.sheet)
  const openSheet = useUI((s) => s.openSheet)
  const close = () => openSheet(null)
  return (
    <>
      <Sheet open={sheet?.type === 'addStep'} onClose={close} title="Новый шаг">
        {sheet?.type === 'addStep' && <AddStepSheet key={sheet.title ?? ''} month={sheet.month} initialTitle={sheet.title} onClose={close} />}
      </Sheet>
      <Sheet open={sheet?.type === 'step'} onClose={close} label="Шаг">
        {sheet?.type === 'step' && <StepSheet key={sheet.id} id={sheet.id} onClose={close} />}
      </Sheet>
      <Sheet open={sheet?.type === 'dream'} onClose={close} title={sheet?.type === 'dream' ? getTheme(sheet.month)!.dream : ''}>
        {sheet?.type === 'dream' && <DreamSheet month={sheet.month} />}
      </Sheet>
    </>
  )
}
