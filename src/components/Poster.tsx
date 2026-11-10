import { memo } from 'react'
import { getArtwork } from '../art'
import { cx } from './ui'

/** A fully painted artwork without outlines — a flat editorial poster. */
export const Poster = memo(function Poster({ art, className }: { art: string; className?: string }) {
  const a = getArtwork(art)
  return (
    <svg viewBox={a.viewBox} className={cx('block', className)} aria-hidden preserveAspectRatio="xMidYMid slice">
      {a.regions.map((r) => (
        <path key={r.id} d={r.d} fill={r.tone} stroke={r.tone} strokeWidth={0.6} strokeLinejoin="round" fillRule={r.eo ? 'evenodd' : undefined} />
      ))}
    </svg>
  )
})
