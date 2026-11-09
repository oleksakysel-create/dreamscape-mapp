import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Artwork } from '../art'

const MIN_K = 1
const MAX_K = 6
const TAP_SLOP = 6
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))

export interface CanvasHandle {
  zoomBy: (f: number) => void
  reset: () => void
}

const RegionPath = memo(function RegionPath({ id, d, eo, fill, hint }: { id: string; d: string; eo?: boolean; fill?: string; hint?: string }) {
  return (
    <path
      data-region={id}
      data-filled={fill ? 'true' : 'false'}
      d={d}
      fill={fill ?? hint ?? '#FFFFFF'}
      fillOpacity={!fill && hint ? 0.9 : 1}
      fillRule={eo ? 'evenodd' : undefined}
      stroke="#1E1E20"
      strokeWidth={0.9}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      style={{ transition: 'fill 160ms ease-out' }}
    />
  )
})

interface Props {
  art: Artwork
  fills: Record<string, string>
  onTap: (regionId: string) => void
  /** Show realistic tones on unfilled regions (reference peek). */
  peek?: boolean
}

/** Tap-to-fill SVG canvas with pinch/wheel zoom and drag-to-pan. */
export const ColorCanvas = forwardRef<CanvasHandle, Props>(function ColorCanvas({ art, fills, onTap, peek }, ref) {
  const [, , vbW, vbH] = art.viewBox.split(' ').map(Number) as [number, number, number, number]
  const [view, setView] = useState({ k: 1, x: 0, y: 0 })
  const box = useRef<HTMLDivElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const g = useRef<{ sx: number; sy: number; dragged: boolean; pinch?: number }>({ sx: 0, sy: 0, dragged: false })

  const fit = useCallback(
    (v: { k: number; x: number; y: number }) => {
      const k = clamp(v.k, MIN_K, MAX_K)
      return { k, x: clamp(v.x, vbW * (1 - k), 0), y: clamp(v.y, vbH * (1 - k), 0) }
    },
    [vbW, vbH],
  )
  const unit = () => vbW / (box.current?.getBoundingClientRect().width || vbW)
  const zoomAt = useCallback(
    (f: number, sx: number, sy: number) =>
      setView((v) => {
        const k = clamp(v.k * f, MIN_K, MAX_K)
        const r = k / v.k
        return fit({ k, x: sx - (sx - v.x) * r, y: sy - (sy - v.y) * r })
      }),
    [fit],
  )

  useImperativeHandle(ref, () => ({ zoomBy: (f) => zoomAt(f, vbW / 2, vbH / 2), reset: () => setView({ k: 1, x: 0, y: 0 }) }))

  useEffect(() => {
    const el = box.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const u = vbW / r.width
      zoomAt(Math.exp(-e.deltaY * 0.002), (e.clientX - r.left) * u, (e.clientY - r.top) * u)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [vbW, zoomAt])

  const two = () => [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }]

  return (
    <div
      ref={box}
      data-testid="canvas"
      data-zoom={view.k.toFixed(2)}
      className="relative w-full touch-none select-none overflow-hidden rounded-[6px] bg-white"
      style={{ aspectRatio: `${vbW} / ${vbH}` }}
      onPointerDown={(e) => {
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (pointers.current.size === 1) g.current = { sx: e.clientX, sy: e.clientY, dragged: false }
        if (pointers.current.size === 2) {
          const [a, b] = two()
          g.current.pinch = Math.hypot(a.x - b.x, a.y - b.y)
          g.current.dragged = true
        }
      }}
      onPointerMove={(e) => {
        const prev = pointers.current.get(e.pointerId)
        if (!prev) return
        const u = unit()
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (pointers.current.size >= 2) {
          const [a, b] = two()
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          const r = box.current!.getBoundingClientRect()
          if (g.current.pinch) zoomAt(dist / g.current.pinch, ((a.x + b.x) / 2 - r.left) * u, ((a.y + b.y) / 2 - r.top) * u)
          g.current.pinch = dist
          return
        }
        if (!g.current.dragged && Math.hypot(e.clientX - g.current.sx, e.clientY - g.current.sy) > TAP_SLOP) {
          g.current.dragged = true
          box.current?.setPointerCapture?.(e.pointerId)
        }
        if (g.current.dragged) setView((v) => fit({ ...v, x: v.x + (e.clientX - prev.x) * u, y: v.y + (e.clientY - prev.y) * u }))
      }}
      onPointerUp={(e) => {
        pointers.current.delete(e.pointerId)
        if (pointers.current.size < 2) g.current.pinch = undefined
      }}
      onPointerCancel={(e) => pointers.current.delete(e.pointerId)}
      onClick={(e) => {
        if (g.current.dragged) {
          g.current.dragged = false
          return
        }
        const id = (e.target as Element).closest('[data-region]')?.getAttribute('data-region')
        if (id) onTap(id)
      }}
    >
      <svg viewBox={art.viewBox} className="block w-full h-full" role="img" aria-label={`Coloring sheet: ${art.title}`}>
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {art.regions.map((r) => (
            <RegionPath key={r.id} id={r.id} d={r.d} eo={r.eo} fill={fills[r.id]} hint={peek ? r.tone : undefined} />
          ))}
        </g>
      </svg>
    </div>
  )
})
