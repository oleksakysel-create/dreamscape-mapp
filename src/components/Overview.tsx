import { useState } from 'react'
import { minutesLabel } from '../lib/dates'
import { overview } from '../lib/stats'
import { useStore } from '../lib/store'
import { cx } from './ui'

const STAGES = ['Thoughts', 'Plan', 'Create', 'Result']

function Panel({ title, readout, children }: { title: string; readout?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] bg-card border border-white/[0.07] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[13px] font-medium text-soft">{title}</h3>
        {readout && <span className="text-[12px] text-mute tnum truncate">{readout}</span>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

/** Time for yourself per month: one series, one hue; hover/tap a bar for its value. */
function MonthlyTime({ bars, now }: { bars: ReturnType<typeof overview>['bars']; now: number }) {
  const [pick, setPick] = useState<number | null>(null)
  const max = Math.max(60, ...bars.map((b) => b.minutes ?? 0))
  const peak = bars.reduce((best, b) => ((b.minutes ?? 0) > (best.minutes ?? 0) ? b : best), bars[0]!)
  const shown = pick !== null ? bars[pick]! : null
  const H = 96
  return (
    <Panel title="Time for yourself, by month" readout={shown ? `${shown.long} · ${shown.minutes === null ? 'not yet' : minutesLabel(shown.minutes)}` : `Most: ${peak.label} · ${minutesLabel(peak.minutes ?? 0)}`}>
      <div className="relative" onPointerLeave={() => setPick(null)}>
        {/* recessive gridline at the top value */}
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-white/[0.08]" aria-hidden />
        <div className="grid grid-cols-12 items-end gap-[3px]" style={{ height: H }}>
          {bars.map((b, i) => {
            const h = b.minutes === null ? 0 : Math.max(b.minutes ? 4 : 2, (b.minutes / max) * H)
            const active = pick === i
            return (
              <button
                key={b.month}
                onPointerEnter={() => setPick(i)}
                onClick={() => setPick(active ? null : i)}
                aria-label={`${b.long}: ${b.minutes === null ? 'not reached yet' : minutesLabel(b.minutes)}`}
                className="h-full flex items-end justify-center"
                data-testid={`bar-${b.month}`}
              >
                {b.minutes === null ? (
                  <span className="w-full h-[2px] rounded-full bg-white/[0.08]" />
                ) : (
                  <span
                    className={cx('w-full rounded-t-[4px] transition-opacity', b.month === now && 'outline outline-1 outline-offset-2 outline-white/25')}
                    style={{ height: h, background: '#9CCBF0', opacity: pick === null || active ? 1 : 0.4 }}
                  />
                )}
              </button>
            )
          })}
        </div>
        <div className="mt-2 grid grid-cols-12 gap-[3px] text-center text-[10px] text-mute tnum">
          {bars.map((b) => (
            <span key={b.month} className={b.month === now ? 'text-fg font-semibold' : ''}>
              {b.label.slice(0, 1)}
            </span>
          ))}
        </div>
      </div>
    </Panel>
  )
}

/** How steps ended: one stacked bar with legend + direct counts. */
function Outcomes({ outcomes }: { outcomes: ReturnType<typeof overview>['outcomes'] }) {
  const total = outcomes.reduce((a, o) => a + o.n, 0)
  const [pick, setPick] = useState<string | null>(null)
  const shown = outcomes.find((o) => o.id === pick)
  return (
    <Panel title="How steps ended" readout={shown ? `${shown.label} · ${shown.n} of ${total}` : `${total} logged`}>
      {total === 0 ? (
        <p className="text-[13px] text-mute">Log a step as done, partly or let go — it will show here.</p>
      ) : (
        <>
          <div className="flex h-3 gap-[2px]" onPointerLeave={() => setPick(null)}>
            {outcomes
              .filter((o) => o.n > 0)
              .map((o, i, arr) => (
                <button
                  key={o.id}
                  aria-label={`${o.label}: ${o.n}`}
                  onPointerEnter={() => setPick(o.id)}
                  onClick={() => setPick(pick === o.id ? null : o.id)}
                  className={cx('h-full', i === 0 && 'rounded-l-[4px]', i === arr.length - 1 && 'rounded-r-[4px]')}
                  style={{ flex: o.n, background: o.color, opacity: pick === null || pick === o.id ? 1 : 0.4 }}
                />
              ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {outcomes.map((o) => (
              <span key={o.id} className="flex items-center gap-1.5 text-[12.5px] text-soft">
                <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: o.color }} aria-hidden />
                {o.label} <span className="text-fg font-semibold tnum">{o.n}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </Panel>
  )
}

/** 12 chapters × 4 stages: filled where the stage is done. */
function ChapterGrid({ grid, now }: { grid: ReturnType<typeof overview>['grid']; now: number }) {
  const [pick, setPick] = useState<{ m: number; s: number } | null>(null)
  const readout = pick ? `Ch. ${pick.m} ${grid[pick.m - 1]!.title} · ${STAGES[pick.s]} ${grid[pick.m - 1]!.cells[pick.s] ? 'done' : 'not yet'}` : 'Each column is a chapter'
  return (
    <Panel title="Your year, stage by stage" readout={readout}>
      <div className="flex gap-2" onPointerLeave={() => setPick(null)}>
        <div className="flex flex-col justify-between py-[1px] text-[10px] text-mute">
          {STAGES.map((s) => (
            <span key={s} className="h-[14px] leading-[14px]">
              {s}
            </span>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-12 gap-[3px]">
          {grid.map((col) => (
            <div key={col.month} className="flex flex-col gap-[4px]">
              {col.cells.map((on, s) => (
                <button
                  key={s}
                  aria-label={`Chapter ${col.month}, ${STAGES[s]}: ${on ? 'done' : 'not yet'}`}
                  onPointerEnter={() => setPick({ m: col.month, s })}
                  onClick={() => setPick({ m: col.month, s })}
                  className={cx('h-[14px] rounded-[3px]', on ? 'bg-sky' : 'bg-white/[0.07]', pick?.m === col.month && pick.s === s && 'ring-1 ring-fg')}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 pl-[52px] grid grid-cols-12 gap-[3px] text-center text-[10px] text-mute tnum">
        {grid.map((c) => (
          <span key={c.month} className={c.month === now ? 'text-fg font-semibold' : ''}>
            {c.month}
          </span>
        ))}
      </div>
    </Panel>
  )
}

export function Overview() {
  const data = useStore()
  const o = overview(data)
  return (
    <div className="space-y-2.5" data-testid="overview">
      <div className="grid grid-cols-2 gap-2.5">
        {o.kpis.map((k) => (
          <div key={k.id} className="rounded-[22px] bg-card border border-white/[0.07] p-4" data-testid={`kpi-${k.id}`}>
            <div className="text-[12px] text-mute">{k.label}</div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-[26px] font-semibold tracking-tightest tnum leading-none">{k.value}</span>
              <span className="text-[12px] text-mute">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>
      <MonthlyTime bars={o.bars} now={o.now} />
      <div className="grid grid-cols-1 gap-2.5">
        <ChapterGrid grid={o.grid} now={o.now} />
        <Outcomes outcomes={o.outcomes} />
      </div>
    </div>
  )
}
