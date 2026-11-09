import { ArtView } from '../components/ArtView'
import { Button, LargeTitle } from '../components/ui'
import { THEMES } from '../data/themes'
import { chapterFor } from '../lib/dates'
import { chapterOf, coloringProgress, useStore } from '../lib/store'
import { useUI } from '../lib/ui'

/** Coloring lives here: a pause to breathe out, never the look of the app. */
export default function Pause() {
  const data = useStore()
  const openStudio = useUI((s) => s.openStudio)
  const month = chapterFor(data.profile!.start)
  const current = THEMES[month - 1]!
  const p = coloringProgress(data, month)
  const others = THEMES.filter((t) => t.month !== month)

  return (
    <div className="pb-4">
      <LargeTitle title="Pause" sub="10 minutes for yourself" />
      <p className="px-5 -mt-2 text-[14px] text-mute">Coloring with no goal and no scores. Just breathe out.</p>
      <div className="flex justify-center pt-7">
        <button onClick={() => openStudio(month)} className="w-[250px] rounded-[6px] overflow-hidden bg-white shadow-[0_30px_70px_rgba(0,0,0,0.6)]" aria-label={`Coloring sheet: ${current.dream}`}>
          <ArtView id={current.art} fills={chapterOf(data, month).fills} className="w-full aspect-[3/4] block" line="#2A2A2C" />
        </button>
      </div>
      <div className="px-5 pt-6 space-y-3">
        <div className="flex justify-between text-[13px]">
          <span className="text-mute">
            {current.dream} · chapter {month}
          </span>
          <span className="font-semibold tnum">{Math.round(p * 100)}%</span>
        </div>
        <Button className="w-full" onClick={() => openStudio(month)} data-testid="open-studio">
          {p === 0 ? 'Start coloring' : 'Continue coloring'}
        </Button>
      </div>
      <div className="px-5 pt-7">
        <div className="text-[12px] font-medium tracking-[0.06em] uppercase text-mute">Other sheets</div>
        <div className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
          {others.map((t) => (
            <button key={t.month} onClick={() => openStudio(t.month)} aria-label={`Coloring sheet: ${t.dream}`} className="shrink-0 w-[66px] rounded-[4px] overflow-hidden bg-white">
              <ArtView id={t.art} fills={chapterOf(data, t.month).fills} className="w-full aspect-[3/4] block" line="#2A2A2C" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
