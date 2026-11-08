import { ArrowRight, CalendarClock, Check, CircleDashed, Leaf } from 'lucide-react'
import { ArtView } from '../components/ArtView'
import { Card, cx, Eyebrow, Ring } from '../components/ui'
import { THEMES } from '../data/themes'
import { addDays, chapterFor, chapterMonthName, dayShort, greeting, minutesLabel, parseYmd, startOfWeek, ymd } from '../lib/dates'
import { weekLoad, windowOf, type Step } from '../lib/planner'
import { chapterOf, nextStage, useStore, type StageId } from '../lib/store'
import { useUI } from '../lib/ui'

const STAGE_LABEL: Record<StageId, string> = { reflect: 'Рефлексия', plan: 'План', color: 'Раскраска мечты', results: 'Итоги' }

export function StepRow({ step, onClick }: { step: Step; onClick: () => void }) {
  const d = step.date ? parseYmd(step.date) : null
  const status = step.status
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3.5 py-3 text-left" data-testid={`step-${step.id}`}>
      <span
        className={cx(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          status === 'done' && 'bg-sage text-ink',
          status === 'partly' && 'bg-sage/25 text-sage',
          status === 'released' && 'bg-white/[0.06] text-mute',
          status === 'planned' && 'border border-white/20 text-mute',
        )}
      >
        {status === 'done' ? <Check size={16} strokeWidth={3} /> : status === 'partly' ? <CircleDashed size={16} /> : status === 'released' ? <Leaf size={14} /> : null}
      </span>
      <span className="flex-1 min-w-0">
        <span className={cx('block text-[15px] font-medium truncate', status === 'released' && 'text-mute line-through')}>{step.title}</span>
        <span className="block text-[12.5px] text-mute mt-0.5">
          {d ? `${dayShort(d)}, ${d.getDate()} · ${step.window ? windowOf(step.window).short : ''}` : step.horizon === 'month' ? 'В этом месяце' : 'Когда получится'} · {minutesLabel(step.minutes)}
        </span>
      </span>
    </button>
  )
}

export default function Today() {
  const data = useStore()
  const ui = useUI()
  const profile = data.profile!
  const month = chapterFor(profile.start)
  const theme = THEMES[month - 1]!
  const chapter = chapterOf(data, month)
  const stage = nextStage(data, month)
  const week = startOfWeek(new Date())
  const load = weekLoad(profile, data.steps, week)
  const todayYmd = ymd(new Date())
  const weekSteps = [...load.steps].sort((a, b) => (a.date! + (a.window ?? '')).localeCompare(b.date! + (b.window ?? '')))
  const loose = data.steps.filter((s) => !s.date && s.status === 'planned')

  const openStage = () => {
    if (stage === 'color') ui.openStudio(month)
    else ui.openChapter(month)
  }

  return (
    <div className="px-5 space-y-5">
      <header className="flex items-start justify-between pt-2">
        <div>
          <Eyebrow>{greeting()}</Eyebrow>
          <h1 className="serif text-[38px] leading-[1.05] mt-1">{profile.name}</h1>
        </div>
        <button onClick={() => ui.openProfile(true)} aria-label="Профиль" className="w-11 h-11 rounded-full bg-white/[0.07] hairline flex items-center justify-center text-[16px] font-semibold text-gold">
          {profile.name.slice(0, 1).toUpperCase()}
        </button>
      </header>

      <Card onClick={openStage} className="relative overflow-hidden h-[300px] p-0" >
        <ArtView id={theme.art} fills={chapter.fills} className="absolute inset-0 w-full h-full" line="rgba(0,0,0,0.35)" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <Eyebrow className="text-gold">
            Глава {month} · {chapterMonthName(profile.start, month)}
          </Eyebrow>
          <div className="serif text-[34px] leading-none mt-2">{theme.title}</div>
          <div className="text-[14px] text-fg/70 mt-1.5">{theme.tagline}</div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[13px] text-fg/60">Мечта месяца — {theme.dream.toLowerCase()}</span>
            <span className="h-10 pl-4 pr-3 rounded-full bg-gold text-[#17130C] text-[14px] font-semibold flex items-center gap-1.5" data-testid="continue-chapter">
              {stage ? STAGE_LABEL[stage] : 'Глава завершена'} <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Ring value={load.budget ? load.planned / load.budget : 0} size={76} stroke={6}>
            <Ring value={load.budget ? load.done / load.budget : 0} size={56} stroke={6} color="#7FB59A" />
          </Ring>
          <div className="flex-1 min-w-0">
            <Eyebrow>Время для важного</Eyebrow>
            <div className="text-[19px] font-semibold mt-1">
              {minutesLabel(load.planned)} <span className="text-mute font-normal">из {minutesLabel(load.budget)}</span>
            </div>
            <div className="text-[13px] text-mute mt-0.5">
              Сделано {minutesLabel(load.done)} · {load.planned > load.budget ? 'неделя насыщенная — можно перенести' : 'без перегрузки'}
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }, (_, i) => {
            const d = addDays(week, i)
            const key = ymd(d)
            const n = load.steps.filter((s) => s.date === key)
            const isToday = key === todayYmd
            return (
              <div key={key} className={cx('rounded-xl py-2 flex flex-col items-center gap-1', isToday ? 'bg-white/[0.08]' : '')}>
                <span className={cx('text-[11px]', isToday ? 'text-gold font-semibold' : 'text-mute')}>{dayShort(d)}</span>
                <span className="text-[15px] font-semibold tnum">{d.getDate()}</span>
                <span className="flex gap-0.5 h-1.5">
                  {n.slice(0, 3).map((s) => (
                    <span key={s.id} className={cx('w-1.5 h-1.5 rounded-full', s.status === 'planned' ? 'bg-gold' : 'bg-sage')} />
                  ))}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      <section>
        <div className="flex items-baseline justify-between px-1">
          <h2 className="serif text-[26px]">На этой неделе</h2>
          <span className="text-[13px] text-mute">{weekSteps.length ? `${weekSteps.length} шаг.` : ''}</span>
        </div>
        {weekSteps.length === 0 ? (
          <Card className="p-5 mt-2 flex items-start gap-3">
            <CalendarClock size={22} className="text-gold shrink-0 mt-0.5" />
            <div>
              <div className="text-[15px] font-semibold">Неделя пока свободна</div>
              <div className="text-[13px] text-mute mt-1">Пройдите рефлексию месяца — и мы предложим шаги, которые впишутся в ваши окна.</div>
            </div>
          </Card>
        ) : (
          <Card className="px-4 mt-2 divide-y divide-white/[0.06]">
            {weekSteps.map((s) => (
              <StepRow key={s.id} step={s} onClick={() => ui.openSheet({ type: 'step', id: s.id })} />
            ))}
          </Card>
        )}
        {loose.length > 0 && (
          <Card className="px-4 mt-3 divide-y divide-white/[0.06]">
            <div className="pt-3.5 pb-1 text-[12px] text-mute font-semibold uppercase tracking-[0.14em]">Без даты</div>
            {loose.map((s) => (
              <StepRow key={s.id} step={s} onClick={() => ui.openSheet({ type: 'step', id: s.id })} />
            ))}
          </Card>
        )}
      </section>
      <p className="text-center text-[12px] text-mute/70 pb-2">Ваш возраст — не причина забыть о мечтах.</p>
    </div>
  )
}
