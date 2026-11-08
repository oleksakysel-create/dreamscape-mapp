import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { haptic, useUI } from '../lib/ui'

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
export { cx }

type Variant = 'gold' | 'glass' | 'ghost' | 'danger'
export function Button({ variant = 'gold', className, children, onClick, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={(e) => {
        haptic()
        onClick?.(e)
      }}
      className={cx(
        'h-[52px] px-5 rounded-2xl text-[16px] font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-35',
        variant === 'gold' && 'bg-gold text-[#17130C]',
        variant === 'glass' && 'bg-white/[0.07] text-fg hairline',
        variant === 'ghost' && 'text-mute',
        variant === 'danger' && 'bg-rose/15 text-rose',
        className,
      )}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  )
}

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  const Comp = onClick ? motion.button : motion.div
  return (
    <Comp
      whileTap={onClick ? { scale: 0.985 } : undefined}
      onClick={onClick}
      className={cx('block w-full text-left rounded-[26px] bg-card hairline', className)}
    >
      {children}
    </Comp>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('text-[11px] font-semibold tracking-[0.16em] uppercase text-mute', className)}>{children}</div>
}

export function Ring({ value, size = 64, stroke = 5, color = '#D9B57A', children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

/** iOS-style bottom sheet with drag-to-dismiss. */
export function Sheet({ open, onClose, children, title, label }: { open: boolean; onClose: () => void; children: ReactNode; title?: string; label?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="sheet-layer"
          className="absolute inset-0 z-[60]"
          initial="closed"
          animate="open"
          exit="closed"
          variants={{ open: { opacity: 1 }, closed: { opacity: 1 } }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60"
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-label={label ?? title}
            className="absolute inset-x-0 bottom-0 max-h-[88%] flex flex-col rounded-t-[30px] bg-[#141416] border-t border-white/10 pb-[max(20px,env(safe-area-inset-bottom))]"
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
              <div className="w-10 h-[5px] rounded-full bg-white/20" />
            </div>
            {title && <div className="px-6 pt-2 pb-1 serif text-[28px] leading-tight shrink-0">{title}</div>}
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
    <div className="absolute top-[max(54px,calc(env(safe-area-inset-top)+8px))] inset-x-0 z-[90] flex justify-center pointer-events-none px-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.title}
            role="status"
            initial={{ y: -24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="glass rounded-2xl px-4 py-3 text-center"
          >
            <div className="text-[14px] font-semibold">{toast.title}</div>
            {toast.sub && <div className="text-[12px] text-mute mt-0.5">{toast.sub}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex p-1 rounded-2xl bg-white/[0.06]" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => {
            haptic()
            onChange(o.id)
          }}
          className={cx('relative flex-1 h-10 rounded-xl text-[14px] font-semibold', value === o.id ? 'text-fg' : 'text-mute')}
        >
          {value === o.id && <motion.span layoutId={`seg-${options.map((x) => x.id).join('')}`} className="absolute inset-0 rounded-xl bg-white/[0.12]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  )
}
