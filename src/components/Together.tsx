import { ChevronRight, Users } from 'lucide-react'
import { chapterOf, useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { cx } from './ui'

export function Initial({ name, tone = 'sky', size = 28, className }: { name: string; tone?: 'sky' | 'sage'; size?: number; className?: string }) {
  return (
    <span
      className={cx('inline-flex items-center justify-center rounded-full font-semibold shrink-0', tone === 'sky' ? 'bg-[#22303D] text-sky' : 'bg-[#22332B] text-sage', className)}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  )
}

/** Two overlapping initials: you and your partner. */
export function Pair({ me, partner, size = 28 }: { me: string; partner: string; size?: number }) {
  return (
    <span className="inline-flex items-center">
      <Initial name={me} size={size} className="ring-2 ring-[#121214]" />
      <Initial name={partner} tone="sage" size={size} className="-ml-2 ring-2 ring-[#121214]" />
    </span>
  )
}

/** “Do it together”: invite someone and split the steps of this chapter's dream. */
export function Together({ month }: { month: number }) {
  const partner = useStore((s) => chapterOf(s, month).partner)
  const me = useStore((s) => s.profile?.name ?? 'You')
  const steps = useStore((s) => s.steps).filter((s) => s.month === month && s.status !== 'released')
  const openSheet = useUI((s) => s.openSheet)
  const done = (x: (typeof steps)[number]) => x.status === 'done' || x.status === 'partly'

  if (!partner)
    return (
      <button onClick={() => openSheet({ type: 'partner', month })} className="w-full flex items-center gap-3.5 p-4 rounded-[22px] border border-dashed border-white/[0.16] text-left" data-testid="together">
        <span className="w-10 h-10 rounded-full bg-skysoft text-sky flex items-center justify-center shrink-0">
          <Users size={19} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[15.5px] font-semibold">Do it together</span>
          <span className="block text-[13px] text-mute mt-0.5">Invite a partner or a friend and split the steps</span>
        </span>
        <ChevronRight size={18} className="text-mute" />
      </button>
    )

  const mine = steps.filter((s) => s.owner !== 'partner')
  const theirs = steps.filter((s) => s.owner === 'partner')
  const total = Math.max(1, steps.length)
  return (
    <button onClick={() => openSheet({ type: 'partner', month })} className="w-full p-4 rounded-[22px] bg-card border border-white/[0.06] text-left" data-testid="together">
      <span className="flex items-center gap-3">
        <Pair me={me} partner={partner} size={34} />
        <span className="flex-1 min-w-0">
          <span className="block text-[15.5px] font-semibold">Shared with {partner}</span>
          <span className="block text-[13px] text-mute mt-0.5">One dream, steps split between you</span>
        </span>
        <ChevronRight size={18} className="text-mute" />
      </span>
      <span className="mt-4 flex h-2 gap-[2px] rounded-full overflow-hidden bg-white/[0.06]" aria-hidden>
        <span className="h-full bg-sky rounded-l-full" style={{ width: `${(mine.filter(done).length / total) * 100}%` }} />
        <span className="h-full bg-sage" style={{ width: `${(theirs.filter(done).length / total) * 100}%` }} />
      </span>
      <span className="mt-2.5 flex justify-between text-[12.5px] tnum">
        <span className="flex items-center gap-1.5 text-soft">
          <span className="w-2 h-2 rounded-full bg-sky" /> You · {mine.filter(done).length} of {mine.length} done
        </span>
        <span className="flex items-center gap-1.5 text-soft">
          <span className="w-2 h-2 rounded-full bg-sage" /> {partner} · {theirs.filter(done).length} of {theirs.length}
        </span>
      </span>
    </button>
  )
}
