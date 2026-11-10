import { Lock, Play } from 'lucide-react'
import { PHOTOS } from '../assets/photos'
import { usePhoto } from '../lib/photos'
import { memoriesReady } from '../lib/memories'
import { chapterOf, useStore } from '../lib/store'
import { THEMES } from '../data/themes'
import { useUI } from '../lib/ui'
import { cx } from './ui'

function Thumb({ src, className }: { src?: string; className?: string }) {
  const url = usePhoto(src)
  return url ? <img src={url} alt="" className={cx('absolute object-cover rounded-[10px] border border-white/10 shadow-lg', className)} /> : null
}

/** Entry to “Your year in memories” — the finale of chapter 12. */
export function MemoriesCard() {
  const data = useStore()
  const open = useUI((s) => s.openMemories)
  const ready = memoriesReady(data)
  const shots = THEMES.map((t) => chapterOf(data, t.month)).filter((c) => c.fulfilledAt && c.photo).map((c) => c.photo!)
  const [a, b, c] = [shots[0] ?? PHOTOS.beach, shots[1] ?? PHOTOS.ballet, shots[2] ?? PHOTOS.dreamCar]
  return (
    <button
      onClick={() => ready && open(true)}
      disabled={!ready}
      className="w-full relative overflow-hidden flex items-center gap-4 p-4 rounded-[22px] bg-gradient-to-br from-[#16202A] to-[#121214] border border-sky/[0.18] text-left disabled:opacity-80"
      data-testid="memories-card"
    >
      <span className={cx('relative w-[74px] h-[64px] shrink-0', !ready && 'grayscale opacity-50')}>
        <Thumb src={a} className="left-0 top-2 w-10 h-12 -rotate-[8deg]" />
        <Thumb src={c} className="right-0 top-2 w-10 h-12 rotate-[8deg]" />
        <Thumb src={b} className="left-[17px] top-0 w-10 h-[52px]" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[11.5px] font-semibold tracking-[0.1em] uppercase text-sky">The finale</span>
        <span className="block text-[16px] font-semibold mt-0.5">Your year in memories</span>
        <span className="block text-[12.5px] text-mute mt-0.5 leading-snug">{ready ? 'Thoughts and photos from the whole journey' : 'Unlocks when you finish chapter 12'}</span>
      </span>
      <span className={cx('w-10 h-10 rounded-full flex items-center justify-center shrink-0', ready ? 'bg-paper text-[#141414]' : 'bg-white/[0.08] text-mute')}>
        {ready ? <Play size={16} fill="currentColor" className="ml-0.5" /> : <Lock size={15} />}
      </span>
    </button>
  )
}
