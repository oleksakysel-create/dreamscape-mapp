import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { getTheme } from '../data/themes'
import { dateLabel } from '../lib/dates'
import { usePhoto } from '../lib/photos'
import { chapterOf, chapterStages, dreamOf, phraseOf, useStore } from '../lib/store'
import { Chip, cx, StageBar } from './ui'

export function Quote({ size = 54 }: { size?: number }) {
  return (
    <span aria-hidden className="block text-sky font-semibold" style={{ fontSize: size, lineHeight: 0.6, height: size * 0.48 }}>
      “
    </span>
  )
}

/**
 * The dream, as the person sees it:
 * - until it comes true — their own words, big and quiet;
 * - once it does — the photo of it, Pinterest-style, with text below (never on top).
 */
export function DreamCard({ month, children, meta = true, minHeight = 400, className }: { month: number; children?: ReactNode; meta?: boolean; minHeight?: number; className?: string }) {
  const data = useStore()
  const theme = getTheme(month)!
  const chapter = chapterOf(data, month)
  const st = chapterStages(data, month)
  const phrase = phraseOf(data, month)
  const dream = dreamOf(data, month)
  const photo = usePhoto(chapter.fulfilledAt ? chapter.photo : undefined)

  if (chapter.fulfilledAt) {
    return (
      <article className={cx('flex flex-col gap-4', className)} data-testid="dream-card" data-state="fulfilled">
        <div className="relative rounded-[28px] overflow-hidden bg-raised aspect-[4/5]">
          {photo ? (
            <img src={photo} alt={`${dream} — your photo`} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 dream-surface flex items-center justify-center text-mute text-[13px]">Your photo</div>
          )}
        </div>
        <div className="px-1 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[28px] font-semibold tracking-tightest leading-none">{dream}</h2>
            <Chip tone="sage">
              <Check size={12} strokeWidth={3} /> {dateLabel(new Date(chapter.fulfilledAt))}
            </Chip>
          </div>
          {(chapter.memo || phrase) && <p className="text-[15px] leading-relaxed text-soft">“{chapter.memo || phrase}”</p>}
          {meta && (
            <span className="text-[12.5px] text-mute">
              Chapter {month} · {theme.title} · {st.done} step{st.done === 1 ? '' : 's'} done
            </span>
          )}
          {children && <div className="pt-2">{children}</div>}
        </div>
      </article>
    )
  }

  return (
    <article className={cx('dream-surface rounded-[32px] p-[22px] flex flex-col', className)} style={{ minHeight }} data-testid="dream-card" data-state="words">
      <div className="flex items-center justify-between gap-2">
        <Chip>
          Chapter {month} · {theme.title}
        </Chip>
        <Chip tone="sky">{st.thoughts ? 'In progress' : 'New'}</Chip>
      </div>
      <div className="mt-8 flex flex-col gap-3.5">
        <Quote />
        {phrase ? (
          <p className="text-[27px] font-medium leading-[1.2] tracking-[-0.035em]" data-testid="dream-phrase">
            {phrase}
          </p>
        ) : (
          <p className="text-[24px] font-medium leading-[1.25] tracking-[-0.03em] text-mute">
            {dream}. Describe it in your own words in Thoughts — it will live here.
          </p>
        )}
        <span className="text-[13px] text-mute">{phrase ? `Your words · ${dream}` : theme.tagline}</span>
      </div>
      <div className="mt-auto pt-7 flex flex-col gap-4">
        <StageBar done={[st.thoughts, st.plan, st.create, st.result]} />
        {children}
      </div>
    </article>
  )
}

/** Small tile for lists / board: photo with caption below, or the phrase. */
export function DreamTile({ month, height }: { month: number; height: number }) {
  const data = useStore()
  const chapter = chapterOf(data, month)
  const phrase = phraseOf(data, month)
  const dream = dreamOf(data, month)
  const photo = usePhoto(chapter.fulfilledAt ? chapter.photo : undefined)
  if (chapter.fulfilledAt) {
    return (
      <span className="flex flex-col gap-2 text-left">
        <span className="block rounded-[20px] overflow-hidden bg-raised" style={{ height }}>
          {photo && <img src={photo} alt={`${dream} — your photo`} className="w-full h-full object-cover" />}
        </span>
        <span className="flex flex-col gap-0.5 px-1">
          <span className="text-[14px] font-semibold">{dream}</span>
          <span className="text-[12px] text-sage">Came true · {dateLabel(new Date(chapter.fulfilledAt)).replace(/ \d+,/, '')}</span>
        </span>
      </span>
    )
  }
  return (
    <span className={cx('dream-surface rounded-[20px] p-3.5 flex flex-col text-left', !phrase && 'border-dashed')} style={{ height }}>
      {phrase ? (
        <>
          <Quote size={30} />
          <span className="mt-2 text-[14.5px] font-medium leading-[1.3] tracking-[-0.02em] line-clamp-5">{phrase}</span>
        </>
      ) : (
        <span className="text-[15px] font-medium text-soft">{dream}</span>
      )}
      <span className="mt-auto text-[11.5px] text-mute">
        {phrase ? `${dream} · ` : ''}ch. {month}
      </span>
    </span>
  )
}
