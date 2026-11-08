import { Check, ChevronLeft, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, cx, Eyebrow } from '../components/ui'
import { chapterMonthName, minutesLabel } from '../lib/dates'
import { WINDOWS } from '../lib/planner'
import { useStore } from '../lib/store'
import { haptic } from '../lib/ui'

const HOURS = [60, 120, 180, 240, 300, 480]

export default function Profile({ onBack }: { onBack: () => void }) {
  const data = useStore()
  const profile = data.profile!
  const [name, setName] = useState(profile.name)
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="px-5 pb-6">
      <div className="flex items-center gap-2 pt-1 pb-4">
        <button onClick={onBack} aria-label="Назад" className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center">
          <ChevronLeft size={24} />
        </button>
        <h1 className="serif text-[32px]">Профиль</h1>
      </div>

      <Card className="p-5 space-y-3">
        <Eyebrow>Имя</Eyebrow>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && data.updateProfile({ name: name.trim() })}
          aria-label="Имя"
          className="w-full h-12 rounded-xl bg-white/[0.06] hairline px-4 text-[17px] outline-none focus:border-gold/50"
        />
        <div className="text-[13px] text-mute">Путь начался: {chapterMonthName(profile.start, 1)}</div>
      </Card>

      <Card className="p-5 mt-3">
        <Eyebrow>Время для себя в неделю</Eyebrow>
        <div className="mt-3 grid grid-cols-6 gap-1.5">
          {HOURS.map((m) => (
            <button
              key={m}
              onClick={() => {
                haptic()
                data.updateProfile({ weeklyMinutes: m })
              }}
              aria-pressed={profile.weeklyMinutes === m}
              className={cx('h-11 rounded-xl text-[14px] font-semibold tnum', profile.weeklyMinutes === m ? 'bg-gold text-[#17130C]' : 'bg-white/[0.05]')}
            >
              {m / 60}ч
            </button>
          ))}
        </div>
        <div className="text-[13px] text-mute mt-3">Сейчас: {minutesLabel(profile.weeklyMinutes)} в неделю. Новые шаги не выйдут за этот предел.</div>
      </Card>

      <Card className="p-5 mt-3">
        <Eyebrow>Удобные окна</Eyebrow>
        <div className="mt-2 divide-y divide-white/[0.06]">
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
                <span className={cx('w-6 h-6 rounded-full flex items-center justify-center', on ? 'bg-gold text-[#17130C]' : 'border border-white/20')}>{on && <Check size={14} strokeWidth={3} />}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-5 mt-3 flex gap-3">
        <Smartphone size={20} className="text-gold shrink-0 mt-0.5" />
        <div className="text-[13.5px] text-mute leading-relaxed">
          <span className="text-fg font-medium">На iPhone:</span> откройте приложение в Safari → «Поделиться» → «На экран Домой». Данные хранятся только на устройстве.
        </div>
      </Card>

      <div className="mt-6">
        {confirm ? (
          <Card className="p-5 space-y-3">
            <div className="text-[15px]">{data.demo ? 'Выйти из примера и начать свой путь?' : 'Удалить весь путь с этого устройства?'}</div>
            <div className="flex gap-2">
              <Button variant="glass" className="flex-1 h-12" onClick={() => setConfirm(false)}>
                Отмена
              </Button>
              <Button variant="danger" className="flex-1 h-12" onClick={() => data.reset()} data-testid="confirm-reset">
                {data.demo ? 'Начать свой' : 'Удалить'}
              </Button>
            </div>
          </Card>
        ) : (
          <Button variant="ghost" className="w-full" onClick={() => setConfirm(true)} data-testid="reset">
            {data.demo ? 'Выйти из примера' : 'Начать заново'}
          </Button>
        )}
      </div>
      <p className="text-center text-[12px] text-mute/60 mt-6">Dreamscape · Ваш возраст — не причина забыть о мечтах</p>
    </div>
  )
}
