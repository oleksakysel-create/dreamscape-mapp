import { Check, ChevronRight } from 'lucide-react'
import { getArtwork } from '../art'
import { getTheme } from '../data/themes'
import { chapterOf, coloringProgress, useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { ArtView } from './ArtView'

/** The month's one coloring sheet — part of the chapter, opened from its page or from Today. */
export function MonthColoring({ month, label = 'This month’s coloring' }: { month: number; label?: string }) {
  const data = useStore()
  const openStudio = useUI((s) => s.openStudio)
  const theme = getTheme(month)!
  const c = chapterOf(data, month)
  const p = coloringProgress(data, month)
  return (
    <button
      onClick={() => openStudio(month)}
      data-testid={`coloring-${month}`}
      className="w-full flex items-center gap-3.5 p-3 pr-4 rounded-[22px] bg-[#121213] border border-white/[0.07] text-left"
    >
      <span className="w-[54px] shrink-0 rounded-[6px] overflow-hidden bg-white">
        <ArtView id={theme.art} fills={c.fills} className="block w-full aspect-[3/4]" line="#2A2A2C" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[14.5px] font-medium">{label}</span>
        <span className="block text-[12.5px] text-mute mt-0.5">
          {c.coloredAt ? (
            <span className="text-sage inline-flex items-center gap-1">
              <Check size={12} strokeWidth={3} /> {getArtwork(theme.art).title} · colored in
            </span>
          ) : p > 0 ? (
            `${getArtwork(theme.art).title} · ${Math.round(p * 100)}% · ten quiet minutes`
          ) : (
            `${getArtwork(theme.art).title} · ten quiet minutes for yourself`
          )}
        </span>
        <span className="mt-2 block h-[3px] rounded-full bg-white/10 overflow-hidden">
          <span className="block h-full bg-sky rounded-full" style={{ width: `${Math.round(p * 100)}%` }} />
        </span>
      </span>
      <ChevronRight size={16} className="text-mute shrink-0" />
    </button>
  )
}
