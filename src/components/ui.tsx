import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { haptic, useUI } from '../lib/ui'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

type Variant = 'primary' | 'accent' | 'glass' | 'ghost' | 'dashed' | 'danger'
export function Button({ variant = 'primary', className, children, onClick, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={(e) => {
        haptic()
        onClick?.(e)
      }}
      className={cx(
        'h-[50px] px-5 rounded-full text-[15px] font-semibold flex items-center justify-center gap-2 disabled:opacity-35',
        variant === 'primary' && 'bg-paper text-[#141414]',
        variant === 'accent' && 'bg-sky text-[#0B1622]',
        variant === 'glass' && 'bg-white/[0.09] text-fg',
        variant === 'ghost' && 'text-mute',
        variant === 'dashed' && 'border border-dashed border-white/30 text-fg',
        variant === 'danger' && 'bg-rose/15 text-rose',
        className,
      )}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  )
}

export function IconButton({ label, children, className, onClick, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      title={label}
      onClick={(e) => {
        haptic()
        onClick?.(e)
      }}
      className={cx('w-[50px] h-[50px] shrink-0 rounded-full flex items-center justify-center bg-white/[0.09] text-fg disabled:opacity-35', className)}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('text-[12px] font-medium tracking-[0.06em] uppercase text-mute', className)}>{children}</div>
}

export function Chip({ children, tone = 'outline', className }: { children: ReactNode; tone?: 'outline' | 'sky' | 'sage' | 'fill'; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 h-7 px-[11px] rounded-full text-[12px] font-medium whitespace-nowrap',
        tone === 'outline' && 'border border-white/[0.16] text-[#D8D6D1]',
        tone === 'sky' && 'bg-skysoft text-sky',
        tone === 'sage' && 'bg-sage/[0.16] text-sage font-semibold',
        tone === 'fill' && 'bg-white/[0.12] text-fg',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** iOS large title header */
export function LargeTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <header className="flex items-end justify-between px-5 pt-3 pb-4">
      <div>
        {sub && <div className="text-[13px] font-medium text-mute">{sub}</div>}
        <h1 className="text-[34px] font-bold tracking-tightest leading-tight">{title}</h1>
      </div>
      {right}
    </header>
  )
}

/** iOS navigation bar for pushed screens */
export function NavBar({ back, onBack, title, right }: { back: string; onBack: () => void; title?: string; right?: ReactNode }) {
  return (
    <div className="relative h-11 flex items-center justify-between px-2">
      <button onClick={onBack} className="h-11 pl-1 pr-3 flex items-center gap-0.5 text-sky text-[17px] font-medium" data-testid="nav-back">
        <ChevronLeft size={26} strokeWidth={2.2} /> {back}
      </button>
      {title && <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold max-w-[50%] truncate pointer-events-none">{title}</span>}
      <div className="flex items-center pr-1">{right}</div>
    </div>
  )
}

export function StageBar({ done }: { done: boolean[] }) {
  const labels = ['Thoughts', 'Plan', 'Create', 'Result']
  return (
    <div className="grid grid-cols-4 gap-1.5" aria-label="Chapter stages">
      {labels.map((l, i) => (
        <div key={l} className="flex flex-col gap-1.5">
          <span className={cx('h-[3px] rounded-full', done[i] ? 'bg-fg' : 'bg-white/[0.14]')} />
          <span className={cx('text-[11px]', done[i] ? 'text-soft' : 'text-mute')}>{l}</span>
        </div>
      ))}
    </div>
  )
}

/** iOS-style bottom sheet with drag-to-dismiss. One layer, so the backdrop can never get stuck. */
export function Sheet({ open, onClose, children, title, label }: { open: boolean; onClose: () => void; children: ReactNode; title?: string; label?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="sheet-layer" className="absolute inset-0 z-[60]" initial="closed" animate="open" exit="closed" variants={{ open: { opacity: 1 }, closed: { opacity: 1 } }}>
          <motion.div className="absolute inset-0 bg-black/60" variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }} transition={{ duration: 0.25 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label={label ?? title}
            className="absolute inset-x-0 bottom-0 max-h-[90%] flex flex-col rounded-t-[34px] bg-[#161617] border-t border-white/[0.08] pb-[max(24px,env(safe-area-inset-bottom))]"
            variants={{ open: { y: 0 }, closed: { y: '100%' } }}
            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_: unknown, info: PanInfo) => {
              if (info.offset.y > 120 || info.velocity.y > 700) onClose()
            }}
          >
            <div className="pt-2.5 pb-1 flex justify-center shrink-0">
              <div className="w-[38px] h-[5px] rounded-full bg-white/20" />
            </div>
            {title && <div className="px-6 pt-2 pb-1 text-[22px] font-semibold tracking-tight shrink-0">{title}</div>}
            <div className="overflow-y-auto no-scrollbar px-6 pt-2" onPointerDownCapture={(e) => e.stopPropagation()}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Toast() {
  const toast = useUI((s) => s.toast)
  return (
    <div className="absolute top-[max(58px,calc(env(safe-area-inset-top)+8px))] inset-x-0 z-[90] flex justify-center pointer-events-none px-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.title}
            role="status"
            initial={{ y: -24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="glass rounded-2xl px-4 py-3 text-center pointer-events-none"
          >
            <div className="text-[14px] font-semibold">{toast.title}</div>
            {toast.sub && <div className="text-[12px] text-mute mt-0.5">{toast.sub}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Pill segmented control */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 p-1 rounded-[14px] bg-white/[0.07]" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => {
            haptic()
            onChange(o.id)
          }}
          className={cx('flex-1 h-9 px-3 rounded-[10px] text-[13px]', value === o.id ? 'bg-paper text-[#141414] font-semibold' : 'text-soft font-medium')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Underlined text tabs (chapter stages) */
export function UnderlineTabs<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string; done?: boolean }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-6 border-b border-white/[0.08]" role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={value === o.id}
          onClick={() => {
            haptic()
            onChange(o.id)
          }}
          className={cx('relative h-11 text-[14px] flex items-center gap-1.5', value === o.id ? 'text-fg font-semibold' : 'text-mute font-medium')}
        >
          {o.label}
          {o.done && <span className="w-1.5 h-1.5 rounded-full bg-sky" aria-label="done" />}
          {value === o.id && <motion.span layoutId={`ut-${options.map((x) => x.id).join('')}`} className="absolute -bottom-px inset-x-0 h-[2px] bg-fg rounded-full" />}
        </button>
      ))}
    </div>
  )
}
