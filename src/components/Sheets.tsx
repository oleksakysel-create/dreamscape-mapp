import { CalendarArrowUp, Camera, Check, CircleDashed, Download, ImagePlus, Leaf, Send, Share, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getTheme } from '../data/themes'
import { addDays, dayLabel, dayShort, minutesLabel, parseYmd, startOfWeek, ymd } from '../lib/dates'
import { deletePhoto, photoBlob, savePhoto } from '../lib/photos'
import { findSlot, weekSlots, windowOf, type Horizon, type StepStatus, type WindowId } from '../lib/planner'
import { FORMATS, renderShare, shareImage, type ShareFormat } from '../lib/share'
import { chapterMonthName } from '../lib/dates'
import { chapterOf, dreamOf, phraseOf, useStore } from '../lib/store'
import { haptic, useUI } from '../lib/ui'
import { Pair } from './Together'
import { Button, cx, Eyebrow, Segmented, Sheet } from './ui'

const DURATIONS = [15, 30, 45, 60, 90, 120]

function AddStepSheet({ month, initialTitle, onClose }: { month: number; initialTitle?: string; onClose: () => void }) {
  const profile = useStore((s) => s.profile!)
  const steps = useStore((s) => s.steps)
  const addStep = useStore((s) => s.addStep)
  const notify = useUI((s) => s.notify)
  const [title, setTitle] = useState(initialTitle ?? '')
  const [minutes, setMinutes] = useState(30)
  const [horizon, setHorizon] = useState<Horizon>('week')
  const partner = useStore((s) => chapterOf(s, month).partner)
  const [who, setWho] = useState<'me' | 'partner'>('me')
  const auto = useMemo(() => findSlot(profile, steps, minutes), [profile, steps, minutes])
  const [pick, setPick] = useState<{ date: string; window: WindowId } | null>(null)
  useEffect(() => setPick(null), [minutes])
  const chosen = pick ?? auto

  const options = useMemo(() => {
    const today = ymd(new Date())
    const w0 = startOfWeek(new Date())
    return [...weekSlots(profile, steps, w0), ...weekSlots(profile, steps, addDays(w0, 7))]
      .filter((s) => s.date >= today && s.capacity - s.used >= Math.min(minutes, s.capacity))
      .slice(0, 8)
  }, [profile, steps, minutes])

  const save = () => {
    const t = title.trim()
    if (!t) return
    haptic(12)
    if (who === 'partner' && partner) {
      addStep({ month, title: t, minutes, horizon: 'month', owner: 'partner' })
      notify(`Handed to ${partner}`, 'It won’t use your weekly time')
      return onClose()
    }
    const s = addStep({ month, title: t, minutes, horizon, ...(horizon === 'week' && chosen ? { date: chosen.date, window: chosen.window } : {}) })
    if (s.date) {
      const d = parseYmd(s.date)
      const nextWeek = d >= addDays(startOfWeek(new Date()), 7)
      notify(nextWeek ? 'This week is full — set for next week' : 'Added to your week', `${dayLabel(d)} · ${windowOf(s.window!).label.toLowerCase()}`)
    } else notify('Step saved', horizon === 'month' ? 'Whenever there’s room this month' : 'No date, no rush')
    onClose()
  }

  return (
    <div className="space-y-5 pb-2">
      <input
        autoFocus={!initialTitle}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What will you do?"
        aria-label="Step"
        data-testid="step-title"
        className="w-full h-14 border-0 border-b border-white/[0.16] bg-transparent text-[17px] outline-none focus:border-sky"
      />
      {partner && (
        <div>
          <Eyebrow>Who takes it</Eyebrow>
          <div className="mt-2">
            <Segmented
              value={who}
              onChange={setWho}
              options={[
                { id: 'me', label: 'Me' },
                { id: 'partner', label: partner },
              ]}
            />
          </div>
        </div>
      )}
      <div>
        <Eyebrow>How long</Eyebrow>
        <div className="mt-2 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Duration">
          {DURATIONS.map((m) => (
            <button
              key={m}
              role="radio"
              aria-checked={minutes === m}
              onClick={() => setMinutes(m)}
              className={cx('h-11 rounded-[12px] text-[13px] font-semibold tnum', minutes === m ? 'bg-paper text-[#141414]' : 'bg-white/[0.06] text-soft')}
            >
              {m < 60 ? `${m}m` : `${m / 60}h`}
            </button>
          ))}
        </div>
      </div>
      {who === 'me' && (
      <div>
        <Eyebrow>When</Eyebrow>
        <div className="mt-2">
          <Segmented
            value={horizon}
            onChange={setHorizon}
            options={[
              { id: 'week', label: 'Fit into week' },
              { id: 'month', label: 'This month' },
              { id: 'someday', label: 'No date' },
            ]}
          />
        </div>
        {horizon === 'week' &&
          (chosen ? (
            <div className="mt-3">
              <div className="text-[14px] text-mute">A free window we found for you:</div>
              <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
                {(options.some((o) => o.date === chosen.date && o.window === chosen.window) ? options : [{ ...chosen, capacity: 0, used: 0 }, ...options]).map((o) => {
                  const on = o.date === chosen.date && o.window === chosen.window
                  const d = parseYmd(o.date)
                  return (
                    <button
                      key={o.date + o.window}
                      onClick={() => setPick({ date: o.date, window: o.window })}
                      aria-pressed={on}
                      className={cx('shrink-0 px-3.5 py-2.5 rounded-2xl text-left border', on ? 'bg-skysoft border-sky/50' : 'bg-white/[0.04] border-white/[0.08]')}
                    >
                      <div className="text-[14px] font-semibold">
                        {dayShort(d)}, {d.getDate()}
                      </div>
                      <div className="text-[12px] text-mute">{windowOf(o.window).short}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-[14px] text-mute">The next few weeks are full. We’ll keep the step without a date until a window opens up.</p>
          ))}
      </div>
      )}
      <Button className="w-full" onClick={save} disabled={!title.trim()} data-testid="save-step">
        Save step
      </Button>
    </div>
  )
}

function StepSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const step = useStore((s) => s.steps.find((x) => x.id === id))
  const log = useStore((s) => s.logResult)
  const reschedule = useStore((s) => s.reschedule)
  const remove = useStore((s) => s.removeStep)
  const notify = useUI((s) => s.notify)
  const partner = useStore((s) => (step ? chapterOf(s, step.month).partner : undefined))
  const [note, setNote] = useState(step?.result ?? '')
  if (!step) return null
  const when = step.date ? `${dayLabel(parseYmd(step.date))} · ${step.window ? windowOf(step.window).short : ''}` : step.horizon === 'month' ? 'This month' : 'No date'

  const mark = (status: StepStatus, title: string) => {
    haptic(12)
    log(step.id, status, note.trim() || undefined)
    notify(title)
    onClose()
  }

  return (
    <div className="space-y-5 pb-2">
      <div>
        <div className="text-[19px] font-semibold leading-snug">{step.title}</div>
        <div className="text-[14px] text-mute mt-1">
          {when} · {minutesLabel(step.minutes)} · {getTheme(step.month)!.title}
        </div>
        {step.owner === 'partner' && partner && <div className="mt-2 text-[13px] text-sage">{partner}’s step — you can log it for them</div>}
      </div>
      <div>
        <label htmlFor="result" className="text-[13px] text-mute">
          How did it go?
        </label>
        <textarea
          id="result"
          data-testid="step-result"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="A few words for yourself — optional"
          className="mt-1 w-full border-0 border-b border-white/[0.16] bg-transparent py-2 text-[16px] leading-relaxed outline-none resize-none focus:border-sky"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => mark('done', 'Done — nicely done')} data-testid="mark-done">
          <Check size={18} /> Done
        </Button>
        <Button variant="glass" onClick={() => mark('partly', 'Partly — still progress')} data-testid="mark-partly">
          <CircleDashed size={18} /> Partly
        </Button>
        <Button
          variant="glass"
          onClick={() => {
            const n = reschedule(step.id)
            notify('Moved', n?.date ? `${dayLabel(parseYmd(n.date))} · ${windowOf(n.window!).short}` : 'No date — when a window opens up')
            onClose()
          }}
          data-testid="mark-move"
        >
          <CalendarArrowUp size={18} /> Move
        </Button>
        <Button variant="glass" onClick={() => mark('released', 'Let go. That’s a decision too')}>
          <Leaf size={18} /> Let go
        </Button>
      </div>
      <button
        onClick={() => {
          remove(step.id)
          onClose()
        }}
        className="w-full h-11 text-[14px] text-mute flex items-center justify-center gap-2"
      >
        <Trash2 size={15} /> Delete step
      </button>
    </div>
  )
}

function AttachSheet({ month, onClose }: { month: number; onClose: () => void }) {
  const dream = useStore((s) => dreamOf(s, month))
  const chapter = useStore((s) => chapterOf(s, month))
  const fulfill = useStore((s) => s.fulfill)
  const notify = useUI((s) => s.notify)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>()
  const [date, setDate] = useState(chapter.fulfilledAt ? ymd(new Date(chapter.fulfilledAt)) : ymd(new Date()))
  const [memo, setMemo] = useState(chapter.memo ?? '')
  const [busy, setBusy] = useState(false)
  const library = useRef<HTMLInputElement>(null)
  const camera = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!file) return setPreview(undefined)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
    e.target.value = ''
  }

  const save = async () => {
    setBusy(true)
    try {
      let photo = chapter.photo
      if (file) {
        if (chapter.photo) await deletePhoto(chapter.photo)
        photo = await savePhoto(`chapter-${month}-${Date.now()}`, file)
      }
      fulfill(month, { date: parseYmd(date).toISOString(), photo, memo: memo.trim() || undefined })
      haptic(30)
      notify('It came true', `${dream} is now on your board`)
      onClose()
    } catch {
      notify('Couldn’t save the photo', 'Try another image')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5 pb-2">
      <p className="text-[14px] leading-relaxed text-mute -mt-1">Add a real photo — it becomes the cover of “{dream}” on your board.</p>
      <input ref={library} type="file" accept="image/*" className="hidden" onChange={onPick} data-testid="photo-input" />
      <input ref={camera} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
      {preview ? (
        <div className="relative rounded-[24px] overflow-hidden aspect-[4/5] bg-raised">
          <img src={preview} alt="Selected photo" className="w-full h-full object-cover" />
          <button onClick={() => library.current?.click()} className="absolute right-3 top-3 h-9 px-3.5 rounded-full glass text-[13px] font-semibold">
            Change
          </button>
        </div>
      ) : (
        <div className="h-[200px] rounded-[24px] border-[1.5px] border-dashed border-white/[0.22] flex flex-col items-center justify-center gap-4">
          <ImagePlus size={32} strokeWidth={1.4} className="text-soft" />
          <div className="flex gap-2">
            <Button className="h-11 px-4 text-[14px]" onClick={() => library.current?.click()}>
              Choose from library
            </Button>
            <Button variant="dashed" className="h-11 px-4 text-[14px] border-solid border-white/20" onClick={() => camera.current?.click()}>
              <Camera size={16} /> Camera
            </Button>
          </div>
        </div>
      )}
      <div>
        <label htmlFor="when" className="text-[13px] text-mute">
          When it happened
        </label>
        <input
          id="when"
          type="date"
          value={date}
          max={ymd(new Date())}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full h-12 border-0 border-b border-white/[0.16] bg-transparent text-[16px] outline-none focus:border-sky [color-scheme:dark]"
        />
      </div>
      <div>
        <label htmlFor="memo" className="text-[13px] text-mute">
          A few words to remember
        </label>
        <textarea
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          placeholder="How did it feel?"
          className="mt-1 w-full border-0 border-b border-white/[0.16] bg-transparent py-2 text-[16px] leading-relaxed outline-none resize-none focus:border-sky"
        />
      </div>
      <Button className="w-full" onClick={() => void save()} disabled={busy || (!file && !chapter.photo)} data-testid="mark-fulfilled">
        {chapter.fulfilledAt ? 'Save' : 'Mark as fulfilled'}
      </Button>
    </div>
  )
}

function ShareSheet({ month }: { month: number }) {
  const data = useStore()
  const theme = getTheme(month)!
  const chapter = chapterOf(data, month)
  const phrase = phraseOf(data, month)
  const notify = useUI((s) => s.notify)
  const [format, setFormat] = useState<ShareFormat>('story')
  const [blob, setBlob] = useState<Blob | null>(null)
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    let alive = true
    ;(async () => {
      const photo = chapter.fulfilledAt && chapter.photo ? await photoBlob(chapter.photo).catch(() => null) : null
      const b = await renderShare({
        format,
        dream: dreamOf(data, month),
        phrase,
        meta: `My dream · ${chapterMonthName(data.profile!.start, month)}`,
        photo,
      })
      if (alive) setBlob(b)
    })()
    return () => {
      alive = false
    }
  }, [format, chapter.fulfilledAt, chapter.photo, phrase, data, month])

  useEffect(() => {
    if (!blob) return
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])

  const f = FORMATS[format]
  const go = async () => {
    if (!blob) return
    const r = await shareImage(blob, `dreamscape-${theme.art}-${format}.png`, dreamOf(data, month))
    if (r === 'downloaded') notify('Image saved', 'Find it in your downloads')
  }

  return (
    <div className="flex flex-col items-center gap-5 pb-2">
      <div className="rounded-[20px] overflow-hidden bg-raised shadow-[0_24px_50px_rgba(0,0,0,0.5)] border border-white/[0.08]" style={{ width: format === 'square' ? 240 : 190, aspectRatio: `${f.w} / ${f.h}` }}>
        {url && <img src={url} alt="Share preview" className="w-full h-full object-cover" data-testid="share-preview" />}
      </div>
      <div className="w-full">
        <Segmented value={format} onChange={setFormat} options={(Object.keys(FORMATS) as ShareFormat[]).map((k) => ({ id: k, label: FORMATS[k].label }))} />
      </div>
      <div className="w-full grid grid-cols-[1fr_auto] gap-2">
        <Button onClick={() => void go()} disabled={!blob} data-testid="share-now">
          <Share size={18} /> Share
        </Button>
        <Button
          variant="glass"
          className="w-[50px] px-0"
          aria-label="Save image"
          disabled={!blob}
          onClick={() => {
            if (!blob) return
            const a = document.createElement('a')
            a.href = url!
            a.download = `dreamscape-${theme.art}-${format}.png`
            a.click()
            notify('Image saved')
          }}
        >
          <Download size={18} />
        </Button>
      </div>
    </div>
  )
}

function PartnerSheet({ month, onClose }: { month: number; onClose: () => void }) {
  const current = useStore((s) => chapterOf(s, month).partner)
  const me = useStore((s) => s.profile?.name ?? '')
  const dream = useStore((s) => phraseOf(s, month) || dreamOf(s, month))
  const setPartner = useStore((s) => s.setPartner)
  const notify = useUI((s) => s.notify)
  const [name, setName] = useState(current ?? '')

  const invite = async () => {
    const n = name.trim()
    if (!n) return
    setPartner(month, n)
    const text = `${me} wants to make a dream come true with you on Dreamscape: “${dream}”`
    try {
      if (navigator.share) await navigator.share({ title: 'Dreamscape', text })
      else await navigator.clipboard?.writeText(text)
    } catch {
      /* closed the share sheet — the dream is shared anyway */
    }
    notify(current ? 'Invite sent again' : `Shared with ${n}`, 'Hand steps to them when you add a step')
    onClose()
  }

  return (
    <div className="space-y-5 pb-2">
      <p className="text-[15px] leading-relaxed text-soft">One dream, two people. Split the steps — theirs don’t use your weekly time, and you both see the progress.</p>
      {current && (
        <div className="flex items-center gap-3">
          <Pair me={me || 'You'} partner={current} size={36} />
          <span className="text-[15px]">
            You and <span className="font-semibold">{current}</span>
          </span>
        </div>
      )}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Their name"
        aria-label="Partner's name"
        data-testid="partner-name"
        className="w-full h-14 border-0 border-b border-white/[0.16] bg-transparent text-[17px] outline-none focus:border-sky"
      />
      <Button className="w-full" onClick={() => void invite()} disabled={!name.trim()} data-testid="partner-invite">
        <Send size={17} /> {current ? 'Send the invite again' : 'Send an invite'}
      </Button>
      {current && (
        <button
          onClick={() => {
            setPartner(month, undefined)
            notify('This dream is yours alone again')
            onClose()
          }}
          className="w-full h-11 text-[14px] text-mute"
        >
          Stop sharing
        </button>
      )}
    </div>
  )
}

export function Sheets() {
  const sheet = useUI((s) => s.sheet)
  const openSheet = useUI((s) => s.openSheet)
  const close = () => openSheet(null)
  const fulfilled = useStore((s) => (sheet?.type === 'attach' ? Boolean(chapterOf(s, sheet.month).fulfilledAt) : false))
  return (
    <>
      <Sheet open={sheet?.type === 'addStep'} onClose={close} title="New step">
        {sheet?.type === 'addStep' && <AddStepSheet key={sheet.title ?? ''} month={sheet.month} initialTitle={sheet.title} onClose={close} />}
      </Sheet>
      <Sheet open={sheet?.type === 'step'} onClose={close} label="Step">
        {sheet?.type === 'step' && <StepSheet key={sheet.id} id={sheet.id} onClose={close} />}
      </Sheet>
      <Sheet open={sheet?.type === 'attach'} onClose={close} title={fulfilled ? 'Your photo' : 'Did your dream come true?'}>
        {sheet?.type === 'attach' && <AttachSheet month={sheet.month} onClose={close} />}
      </Sheet>
      <Sheet open={sheet?.type === 'partner'} onClose={close} title="Do it together">
        {sheet?.type === 'partner' && <PartnerSheet month={sheet.month} onClose={close} />}
      </Sheet>
      <Sheet open={sheet?.type === 'share'} onClose={close} title="Share your dream">
        {sheet?.type === 'share' && <ShareSheet month={sheet.month} />}
      </Sheet>
    </>
  )
}
