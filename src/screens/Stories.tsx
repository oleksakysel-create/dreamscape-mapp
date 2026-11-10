import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { Check, ChevronLeft, Clock, Play, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Poster } from '../components/Poster'
import { Button, cx } from '../components/ui'
import { STORIES, type Story } from '../data/stories'
import { useStore } from '../lib/store'
import { haptic, useUI } from '../lib/ui'

/** The photo of the dream that came true, or its poster when there is none. */
function Cover({ story, className }: { story: Story; className?: string }) {
  if (story.photo) return <img src={story.photo} alt="" className={cx('block object-cover', className)} style={{ objectPosition: story.focus }} draggable={false} />
  return <Poster art={story.art} className={className} />
}

/** “I want this too”: borrow the dream as a draft in the matching chapter. */
function WantThis({ story, className, compact, onOpen }: { story: Story; className?: string; compact?: boolean; onOpen?: (month: number) => void }) {
  const taken = useStore((s) => s.drafts.includes(story.id))
  const onboarded = useStore((s) => Boolean(s.profile))
  const take = useStore((s) => s.takeDream)
  const notify = useUI((s) => s.notify)
  const label = taken ? (onboarded && onOpen ? 'Open it' : 'Saved') : 'I want this too'
  return (
    <Button
      variant={taken ? 'glass' : 'accent'}
      className={cx(compact ? 'h-10 px-4 text-[14px]' : '', className)}
      onClick={(e) => {
        e.stopPropagation()
        if (taken) return onboarded && onOpen?.(story.month)
        haptic(14)
        take(story.id)
        notify(onboarded ? `Added to chapter ${story.month} · ${story.chapter}` : 'Saved for your journey', onboarded ? 'Their words as a draft — make them yours' : `It will wait in chapter ${story.month}`)
      }}
      data-testid={`want-${story.id}`}
    >
      {taken ? <Check size={16} strokeWidth={2.6} /> : <Plus size={17} strokeWidth={2.4} />} {label}
    </Button>
  )
}

const ease = [0.22, 1, 0.36, 1] as const
const SLIDES = ['words', 'thought', 'steps', 'result'] as const
type Slide = (typeof SLIDES)[number]
const MS: Record<Slide, number> = { words: 5200, thought: 5600, steps: 5600, result: 7000 }

const TOP = 'pt-[max(58px,calc(env(safe-area-inset-top)+12px))]'
const BOTTOM = 'pb-[max(28px,env(safe-area-inset-bottom))]'

function Avatar({ story, size = 40, ring }: { story: Story; size?: number; ring?: boolean }) {
  return (
    <span className={cx('relative shrink-0 rounded-full', ring && 'p-[2.5px] bg-gradient-to-tr from-sky to-sage')} style={{ width: size + (ring ? 5 : 0), height: size + (ring ? 5 : 0) }}>
      <span className={cx('block rounded-full overflow-hidden w-full h-full', ring && 'border-[2.5px] border-ink')}>
        <Cover story={story} className="w-full h-full" />
      </span>
    </span>
  )
}

/** Horizontal row of story circles (Journey tab). */
export function StoriesRail() {
  const open = useUI((s) => s.openStories)
  return (
    <section className="mb-6">
      <div className="px-5 flex items-baseline justify-between">
        <h2 className="text-[13px] font-medium tracking-[0.06em] uppercase text-mute">Came true for others</h2>
        <button onClick={() => open({ hub: true, play: null })} className="text-[14px] text-sky font-medium" data-testid="stories-all">
          See all
        </button>
      </div>
      <div className="mt-3 flex gap-4 overflow-x-auto no-scrollbar px-5">
        {STORIES.map((s, i) => (
          <button key={s.id} onClick={() => open({ hub: false, play: i })} className="flex flex-col items-center gap-1.5 w-[66px] shrink-0" data-testid={`rail-${s.id}`}>
            <Avatar story={s} size={58} ring />
            <span className="text-[12px] leading-tight text-soft text-center">
              {s.name}
              <span className="block text-mute tnum">{s.age}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function SlideBody({ story, slide }: { story: Story; slide: Slide }) {
  if (slide === 'words')
    return (
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[12px] font-semibold tracking-[0.12em] uppercase text-sky">Day one · in {story.name}’s words</div>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease }} className="mt-5 text-[30px] font-semibold leading-[1.12] tracking-[-0.035em]">
          “{story.words}”
        </motion.p>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-6 self-start h-7 px-[11px] rounded-full border border-white/[0.16] text-[12px] text-soft inline-flex items-center">
          Chapter · {story.chapter}
        </motion.span>
      </div>
    )
  if (slide === 'thought')
    return (
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[12px] font-semibold tracking-[0.12em] uppercase text-sky">01 · Thoughts</div>
        <p className="mt-5 text-[17px] text-mute">{story.thought.prompt}</p>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease }} className="mt-3 text-[26px] font-semibold leading-[1.18] tracking-[-0.03em]">
          {story.thought.answer}
        </motion.p>
      </div>
    )
  if (slide === 'steps')
    return (
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[12px] font-semibold tracking-[0.12em] uppercase text-sky">02 · Small steps</div>
        <h2 className="mt-4 text-[28px] font-semibold leading-[1.1] tracking-[-0.035em]">One at a time, around a real life.</h2>
        <ul className="mt-6 space-y-2">
          {story.steps.map((st, k) => (
            <motion.li key={st.title} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + k * 0.55, duration: 0.6, ease }} className="flex items-center gap-3 p-3.5 rounded-[18px] bg-white/[0.06]">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 + k * 0.55, type: 'spring', stiffness: 400, damping: 18 }} className="w-[22px] h-[22px] rounded-full bg-sage text-ink flex items-center justify-center shrink-0">
                <Check size={13} strokeWidth={3} />
              </motion.span>
              <span className="min-w-0">
                <span className="block text-[15px] leading-snug">{st.title}</span>
                <span className="block text-[12.5px] text-mute mt-0.5">{st.when}</span>
              </span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-5 flex items-center gap-2 text-[13.5px] text-soft">
          <Clock size={15} className="text-sky" />
          <span className="tnum">
            {story.hours} hours over {story.months} months
          </span>
        </div>
      </div>
    )
  return (
    <div className="flex-1 flex flex-col justify-center min-h-0">
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease }} className="min-h-0">
        <Cover story={story} className="w-full max-h-[44vh] sm:max-h-[360px] aspect-[4/5] rounded-[26px] shadow-[0_40px_80px_rgba(0,0,0,0.55)]" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, ease }}>
        <div className="mt-4 flex items-start justify-between gap-3">
          <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.03em]">{story.title}</h2>
          <span className="mt-0.5 h-7 px-[10px] shrink-0 rounded-full bg-sage/[0.16] text-sage text-[12px] font-semibold inline-flex items-center gap-1">
            <Check size={12} strokeWidth={3} /> Came true
          </span>
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-soft">“{story.memo}”</p>
      </motion.div>
    </div>
  )
}

function Player({ start, onClose, onStart, startLabel, onOpen }: { start: number; onClose: () => void; onStart: () => void; startLabel: string; onOpen: (month: number) => void }) {
  const [si, setSi] = useState(start)
  const [k, setK] = useState(0)
  const story = STORIES[si]!
  const slide = SLIDES[k]!
  const lastOfAll = si === STORIES.length - 1 && k === SLIDES.length - 1

  const step = (d: 1 | -1) => {
    haptic()
    if (d === 1) {
      if (k < SLIDES.length - 1) return setK(k + 1)
      if (si < STORIES.length - 1) return (setSi(si + 1), setK(0))
      return onClose()
    }
    if (k > 0) return setK(k - 1)
    if (si > 0) return (setSi(si - 1), setK(SLIDES.length - 1))
    setK(0)
  }

  useEffect(() => {
    if (lastOfAll) return
    const t = setTimeout(() => step(1), MS[slide])
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [si, k, lastOfAll])

  return (
    <motion.div
      className="absolute inset-0 z-[2] bg-ink flex flex-col overflow-hidden"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.6 }}
      onDragEnd={(_: unknown, info: PanInfo) => {
        if (info.offset.y > 120) onClose()
      }}
      data-testid="story-player"
      data-story={story.id}
      data-slide={slide}
    >
      {/* soft glow in the story's colours */}
      <div className="pointer-events-none absolute -top-24 inset-x-0 h-[420px] opacity-40 blur-[90px]">
        <Cover story={story} className="w-full h-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/80 to-ink" />

      <div className={cx('relative z-10 px-5', TOP)}>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${SLIDES.length}, minmax(0,1fr))` }} aria-hidden>
          {SLIDES.map((s, j) => (
            <span key={s} className="h-[3px] rounded-full bg-white/[0.18] overflow-hidden">
              {j < k && <span className="block h-full w-full bg-fg" />}
              {j === k &&
                (lastOfAll ? (
                  <span className="block h-full w-full bg-fg" />
                ) : (
                  <motion.span key={`${si}-${k}`} className="block h-full bg-fg" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: MS[s] / 1000, ease: 'linear' }} />
                ))}
            </span>
          ))}
        </div>
        <div className="mt-3.5 flex items-center gap-3">
          <Avatar story={story} size={36} />
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-[15px] font-semibold">
              {story.name}, <span className="tnum">{story.age}</span>
            </div>
            <div className="text-[12.5px] text-mute">
              {story.city} · came true in {story.months} months
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 -mr-2 rounded-full flex items-center justify-center text-fg/80" data-testid="story-close">
            <X size={22} />
          </button>
        </div>
      </div>

      {/* tap zones: left = back, right = forward */}
      <button aria-label="Previous" className="absolute left-0 top-32 bottom-28 w-1/3 z-[5]" onClick={() => step(-1)} />
      <button aria-label="Next" className="absolute right-0 top-32 bottom-28 w-2/3 z-[5]" onClick={() => step(1)} data-testid="story-next" />

      <AnimatePresence mode="wait">
        <motion.div key={`${si}-${k}`} className="relative flex-1 min-h-0 flex flex-col px-6 pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
          <SlideBody story={story} slide={slide} />
        </motion.div>
      </AnimatePresence>

      <div className={cx('relative z-10 px-6 pt-4 grid grid-cols-2 gap-2', BOTTOM)}>
        <WantThis story={story} onOpen={onOpen} />
        <Button onClick={onStart} data-testid="story-start">
          {startLabel}
        </Button>
      </div>
    </motion.div>
  )
}

function Hub({ onBack, onPlay, onOpen }: { onBack: () => void; onPlay: (i: number) => void; onOpen: (month: number) => void }) {
  const ages = STORIES.map((s) => s.age)
  return (
    <motion.div className="absolute inset-0 bg-ink overflow-y-auto no-scrollbar" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 40 }} data-testid="stories">
      <div className={cx('px-5', TOP, BOTTOM)}>
        <button onClick={onBack} className="h-9 -ml-2 pr-2 flex items-center text-sky text-[17px]" data-testid="stories-back">
          <ChevronLeft size={26} /> Back
        </button>
        <h1 className="mt-3 text-[34px] font-bold tracking-tightest leading-tight">They did it</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-mute">
          People who started exactly where you are. Ages {Math.min(...ages)} to {Math.max(...ages)}.
        </p>
        <Button variant="glass" className="mt-5 w-full" onClick={() => onPlay(0)} data-testid="stories-play">
          <Play size={16} fill="currentColor" /> Watch all stories
        </Button>

        <div className="mt-7 space-y-7">
          {STORIES.map((s, i) => (
            <motion.div key={s.id} role="button" tabIndex={0} onClick={() => onPlay(i)} onKeyDown={(e) => e.key === 'Enter' && onPlay(i)} className="block w-full text-left cursor-pointer" data-testid={`story-${s.id}`}>
              <div className="relative">
                <Cover story={s} className="w-full aspect-[16/11] rounded-[24px]" />
                <span className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center">
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                </span>
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[18px] font-semibold tracking-tight leading-snug">{s.title}</div>
                  <div className="mt-1 text-[13.5px] text-mute">
                    {s.name}, <span className="tnum">{s.age}</span> · {s.city}
                  </div>
                </div>
                <span className="mt-0.5 h-7 px-[10px] shrink-0 rounded-full bg-sage/[0.16] text-sage text-[12px] font-semibold inline-flex items-center gap-1 tnum">
                  <Check size={12} strokeWidth={3} /> {s.months} mo
                </span>
              </div>
              <p className="mt-2 text-[14.5px] leading-relaxed text-soft line-clamp-2">“{s.words}”</p>
              <WantThis story={s} compact className="mt-3" onOpen={onOpen} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/** Success stories: a list of people who made it, and a stories-style player. */
export default function Stories({ onStart, startLabel = 'Start my dreamscape' }: { onStart: () => void; startLabel?: string }) {
  const { stories, openStories, openChapter, setTab } = useUI()
  const close = () => openStories({ hub: false, play: null })
  const openMonth = (m: number) => {
    close()
    setTab('journey')
    openChapter(m)
  }
  return (
    <div className={cx('absolute inset-0 z-[85]', !stories.hub && stories.play === null && 'pointer-events-none')}>
      <AnimatePresence>{stories.hub && <Hub key="hub" onBack={close} onPlay={(i) => openStories({ hub: true, play: i })} onOpen={openMonth} />}</AnimatePresence>
      <AnimatePresence>
        {stories.play !== null && (
          <Player
            key="player"
            start={stories.play}
            startLabel={startLabel}
            onOpen={openMonth}
            onClose={() => openStories({ ...stories, play: null })}
            onStart={() => {
              close()
              onStart()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
