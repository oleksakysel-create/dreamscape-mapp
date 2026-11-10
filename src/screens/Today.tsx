import { Camera, Check, CircleDashed, Leaf, Share } from 'lucide-react'
import { DreamCard } from '../components/DreamCard'
import { MonthColoring } from '../components/MonthColoring'
import { Initial } from '../components/Together'
import { Button, cx, IconButton, LargeTitle } from '../components/ui'
import { THEMES } from '../data/themes'
import { chapterFor, dayShort, longDay, minutesLabel, parseYmd, startOfWeek } from '../lib/dates'
import { weekLoad, windowOf, type Step } from '../lib/planner'
import { chapterOf, nextStage, useStore, type StageId } from '../lib/store'
import { useUI } from '../lib/ui'

const NEXT_LABEL: Record<StageId, string> = { thoughts: 'Start with thoughts', plan: 'Plan my week', create: 'Log what you did', result: 'Add the photo' }

export function StepRow({ step, onClick }: { step: Step; onClick: () => void }) {
  const d = step.date ? parseYmd(step.date) : null
  const status = step.status
  const partner = useStore((s) => (step.owner === 'partner' ? chapterOf(s, step.month).partner : undefined))
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-3 text-left" data-testid={`step-${step.id}`}>
      <span
        className={cx(
          'w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0',
          status === 'done' && 'bg-sage text-ink',
          status === 'partly' && 'bg-sage/25 text-sage',
          status === 'released' && 'bg-white/[0.06] text-mute',
          status === 'planned' && 'border-[1.5px] border-white/30',
        )}
      >
        {status === 'done' ? <Check size={13} strokeWidth={3} /> : status === 'partly' ? <CircleDashed size={13} /> : status === 'released' ? <Leaf size={11} /> : null}
      </span>
      <span className="flex-1 min-w-0">
        <span className={cx('block text-[15px] truncate', status === 'released' && 'text-mute line-through')}>{step.title}</span>
        <span className="block text-[12.5px] text-mute mt-0.5">
          {partner ? `${partner}’s step · ` : ''}
          {d ? `${dayShort(d)} ${d.getDate()} · ${step.window ? windowOf(step.window).short : ''}` : step.horizon === 'month' ? 'This month' : 'No date'} · {minutesLabel(step.minutes)}
        </span>
      </span>
      {partner && <Initial name={partner} tone="sage" size={26} />}
    </button>
  )
}

export default function Today() {
  const data = useStore()
  const ui = useUI()
  const profile = data.profile!
  const month = chapterFor(profile.start)
  const theme = THEMES[month - 1]!
  const fulfilled = Boolean(chapterOf(data, month).fulfilledAt)
  const stage = nextStage(data, month)
  const load = weekLoad(profile, data.steps, startOfWeek(new Date()))
  const weekSteps = [...load.steps].sort((a, b) => (a.date! + (a.window ?? '')).localeCompare(b.date! + (b.window ?? '')))
  const loose = data.steps.filter((s) => !s.date && s.status === 'planned' && s.month === month)

  const primary = () => {
    if (fulfilled) return ui.openChapter(month)
    if (stage === 'result') return ui.openSheet({ type: 'attach', month })
    ui.openChapter(month)
  }

  return (
    <div className="pb-4">
      <LargeTitle
        title="Today"
        sub={longDay(new Date())}
        right={
          <button onClick={() => ui.openProfile(true)} aria-label="Profile" className="w-[38px] h-[38px] mb-1 rounded-full bg-[#22252B] text-sky text-[15px] font-semibold">
            {profile.name.slice(0, 1).toUpperCase()}
          </button>
        }
      />

      <div className="px-4">
        <DreamCard month={month}>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={primary} data-testid="primary-action">
              {fulfilled ? 'Open the dream' : NEXT_LABEL[stage]}
            </Button>
            {!fulfilled && (
              <IconButton label="It came true — add a photo" onClick={() => ui.openSheet({ type: 'attach', month })} className="bg-transparent border border-dashed border-white/30" data-testid="attach">
                <Camera size={20} strokeWidth={1.8} />
              </IconButton>
            )}
            <IconButton label="Share" onClick={() => ui.openSheet({ type: 'share', month })} data-testid="share">
              <Share size={19} strokeWidth={1.9} />
            </IconButton>
          </div>
        </DreamCard>
      </div>

      <section className="px-5 mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[13px] font-medium tracking-[0.06em] uppercase text-mute">This week</h2>
          <span className="text-[13px] text-soft tnum">
            <span className="text-fg font-semibold">{minutesLabel(load.planned)}</span> of {minutesLabel(load.budget)} for yourself
          </span>
        </div>
        <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden" aria-hidden>
          <div className="h-full bg-sky rounded-full transition-[width] duration-700" style={{ width: `${Math.min(100, (load.planned / Math.max(1, load.budget)) * 100)}%` }} />
        </div>
        {weekSteps.length + loose.length === 0 ? (
          <p className="text-[14px] text-mute mt-4 leading-relaxed">Your week is still open. Start with {theme.title.toLowerCase()} — we’ll suggest steps that fit around your life.</p>
        ) : (
          <div className="mt-1 divide-y divide-white/[0.08]">
            {[...weekSteps, ...loose].map((s) => (
              <StepRow key={s.id} step={s} onClick={() => ui.openSheet({ type: 'step', id: s.id })} />
            ))}
          </div>
        )}
      </section>

      <div className="px-4 mt-6">
        <MonthColoring month={month} />
      </div>
    </div>
  )
}
