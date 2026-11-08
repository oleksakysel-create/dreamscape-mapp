import { memo } from 'react'
import { getArtwork } from '../art'

/** Static rendering of a coloring page (thumbnails, board, previews). */
export const ArtView = memo(function ArtView({ id, fills, className, line = '#1E1E20' }: { id: string; fills?: Record<string, string>; className?: string; line?: string }) {
  const art = getArtwork(id)
  return (
    <svg viewBox={art.viewBox} className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      {art.regions.map((r) => (
        <path key={r.id} d={r.d} fill={fills?.[r.id] ?? '#FFFFFF'} fillRule={r.eo ? 'evenodd' : undefined} stroke={line} strokeWidth={0.9} strokeLinejoin="round" />
      ))}
    </svg>
  )
})
