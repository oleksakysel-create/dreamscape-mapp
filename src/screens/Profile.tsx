import { Check, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Button, cx, Eyebrow, NavBar } from '../components/ui'
import { chapterMonthLong, minutesLabel } from '../lib/dates'
import { clearPhotos } from '../lib/photos'
import { WINDOWS } from '../lib/planner'
import { useStore } from '../lib/store'
import { haptic } from '../lib/ui'

const HOURS = [60, 120, 180, 240, 300, 480]

export default function Profile({ back, onBack }: { back: string; onBack: () => void }) {
  const data = useStore()
  const profile = data.profile!
  const [name, setName] = useState(profile.name)
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="pb-6">
      <NavBar back={back} onBack={onBack} title="Profile" />
      <div className="px-5 pt-4 space-y-8">
        <div className="space-y-1">
          <label htmlFor="name" className="text-[13px] text-mute">
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim() && data.updateProfile({ name: name.trim() })}
            className="w-full h-12 border-0 border-b border-white/[0.16] bg-transparent text-[18px] outline-none focus:border-sky"
          />
          <div className="text-[13px] text-mute pt-2">Your journey began in {chapterMonthLong(profile.start, 1)}</div>
        </div>

        <div>
          <Eyebrow>Time for yourself each week</Eyebrow>
          <div className="mt-3 grid grid-cols-6 gap-1.5">
            {HOURS.map((m) => (
              <button
                key={m}
                onClick={() => {
                  haptic()
                  data.updateProfile({ weeklyMinutes: m })
                }}
                aria-pressed={profile.weeklyMinutes === m}
                className={cx('h-11 rounded-[12px] text-[14px] font-semibold tnum', profile.weeklyMinutes === m ? 'bg-paper text-[#141414]' : 'bg-white/[0.06] text-soft')}
              >
                {m / 60}h
              </button>
            ))}
          </div>
          <div className="text-[13px] text-mute mt-3">Now {minutesLabel(profile.weeklyMinutes)} a week. New steps never go past it.</div>
        </div>

        <div>
          <Eyebrow>Windows that work for you</Eyebrow>
          <div className="mt-1 divide-y divide-white/[0.08]">
            {WINDOWS.map((w) => {
              const on = profile.windows.includes(w.id)
              return (
                <button
                  key={w.id}
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => {
                    const next = on ? profile.windows.filter((x) => x !== w.id) : [...profile.windows, w.id]
                    if (next.length) data.updateProfile({ windows: next })
                  }}
                  className="w-full h-12 flex items-center justify-between"
                >
                  <span className="text-[15px]">{w.label}</span>
                  <span className={cx('w-6 h-6 rounded-full flex items-center justify-center', on ? 'bg-sky text-[#0B1622]' : 'border border-white/20')}>{on && <Check size={14} strokeWidth={3} />}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3 text-[13.5px] text-mute leading-relaxed">
          <Smartphone size={20} className="text-sky shrink-0 mt-0.5" />
          <div>
            <span className="text-fg font-medium">On iPhone:</span> open the app in Safari → Share → Add to Home Screen. Everything stays on your device.
          </div>
        </div>

        {confirm ? (
          <div className="space-y-3">
            <div className="text-[15px]">{data.demo ? 'Leave the example and start your own journey?' : 'Erase your whole journey from this device?'}</div>
            <div className="flex gap-2">
              <Button variant="glass" className="flex-1" onClick={() => setConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  void clearPhotos()
                  data.reset()
                }}
                data-testid="confirm-reset"
              >
                {data.demo ? 'Start my own' : 'Erase'}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" className="w-full" onClick={() => setConfirm(true)} data-testid="reset">
            {data.demo ? 'Leave the example' : 'Start over'}
          </Button>
        )}
        <p className="text-center text-[12px] text-mute/70">Dreamscape · Your age is no reason to forget your dreams</p>
      </div>
    </div>
  )
}
