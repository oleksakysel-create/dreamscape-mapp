import { AnimatePresence, MotionConfig, motion, type PanInfo } from 'framer-motion'
import { BatteryFull, LayoutGrid, Route, Signal, Sunrise, Wifi } from 'lucide-react'
import type { ReactNode } from 'react'
import { Sheets } from './components/Sheets'
import { cx, Toast } from './components/ui'
import { useStore } from './lib/store'
import { haptic, useUI, type Tab } from './lib/ui'
import Board from './screens/Board'
import Chapter from './screens/Chapter'
import Journey from './screens/Journey'
import Onboarding from './screens/Onboarding'
import Profile from './screens/Profile'
import Studio from './screens/Studio'
import Today from './screens/Today'

const IS_STANDALONE =
  typeof window !== 'undefined' && ((navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia?.('(display-mode: standalone)').matches)
const IS_ELECTRON = typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent)

const TABS: { id: Tab; label: string; icon: typeof Sunrise }[] = [
  { id: 'today', label: 'Сегодня', icon: Sunrise },
  { id: 'journey', label: 'Путь', icon: Route },
  { id: 'board', label: 'Доска', icon: LayoutGrid },
]

function StatusBar() {
  return (
    <div className="absolute top-0 inset-x-0 z-[95] h-[47px] flex items-center justify-between px-[30px] pt-[3px] text-[16px] font-semibold pointer-events-none">
      <span className="tnum w-[54px] text-center">9:41</span>
      <div className="flex items-center gap-[6px] w-[78px] justify-end">
        <Signal size={16} strokeWidth={2.8} />
        <Wifi size={16} strokeWidth={2.8} />
        <BatteryFull size={24} strokeWidth={1.8} />
      </div>
    </div>
  )
}

function TabBar() {
  const tab = useUI((s) => s.tab)
  const setTab = useUI((s) => s.setTab)
  return (
    <div className="absolute bottom-0 inset-x-0 z-30 px-5 pb-[max(14px,env(safe-area-inset-bottom))] sm:pb-[28px] pointer-events-none">
      <nav className="glass pointer-events-auto rounded-[30px] h-[64px] flex px-1.5" aria-label="Навигация">
        {TABS.map((t) => {
          const active = tab === t.id
          const Icon = t.icon
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                haptic()
                setTab(t.id)
              }}
              aria-current={active ? 'page' : undefined}
              className="flex-1 my-1.5 flex flex-col items-center justify-center gap-0.5 relative rounded-[24px]"
            >
              {active && <motion.div layoutId="tab-pill" className="absolute inset-0 rounded-[24px] bg-white/[0.08]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} className={cx('relative', active ? 'text-gold' : 'text-fg/55')} />
              <span className={cx('relative text-[11px] font-semibold', active ? 'text-gold' : 'text-fg/55')}>{t.label}</span>
            </motion.button>
          )
        })}
      </nav>
    </div>
  )
}

/** Page pushed from the right with iOS swipe-back. */
function Pushed({ id, onBack, children, padTop = true }: { id: string; onBack: () => void; children: ReactNode; padTop?: boolean }) {
  return (
    <motion.div
      key={id}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 40 }}
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 1 }}
      onDragEnd={(_: unknown, info: PanInfo) => {
        if (info.offset.x > 110 || info.velocity.x > 600) onBack()
      }}
      className={cx(
        'absolute inset-0 z-[25] bg-ink overflow-y-auto no-scrollbar pb-[120px] shadow-[-20px_0_40px_rgba(0,0,0,0.5)]',
        padTop && 'pt-[max(50px,calc(env(safe-area-inset-top)+4px))]',
      )}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const onboarded = useStore((s) => Boolean(s.profile))
  const ui = useUI()
  const pushed = ui.chapter !== null || ui.profile

  const screens: Record<Tab, ReactNode> = { today: <Today />, journey: <Journey />, board: <Board /> }

  return (
    <MotionConfig reducedMotion="user">
      <div className="h-full w-full flex sm:py-8 sm:overflow-auto">
        <div className="relative w-full h-full sm:m-auto sm:shrink-0 sm:w-[412px] sm:h-[866px] sm:rounded-[58px] sm:p-[11px] sm:bg-[#151517] sm:shadow-[0_0_0_2px_#26262a,0_40px_120px_rgba(0,0,0,0.75),0_0_90px_rgba(217,181,122,0.10)]">
          <div className="relative w-full h-full bg-ink overflow-hidden sm:rounded-[47px] isolate">
            {IS_ELECTRON && <div className="drag-region absolute top-0 inset-x-0 h-[44px] z-[96]" />}
            <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-[162px] h-[32px] rounded-b-[20px] bg-black z-[97]" />
            <div className="hidden sm:block absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-white/80 z-[97] pointer-events-none" />
            <div className="hidden sm:block">
              <StatusBar />
            </div>
            <div className="pointer-events-none absolute -top-48 -right-24 w-[420px] h-[420px] rounded-full bg-gold/[0.07] blur-[100px]" />

            {onboarded && (
              <>
                <motion.div className="absolute inset-0" animate={{ x: pushed ? -90 : 0, opacity: pushed ? 0.5 : 1 }} transition={{ type: 'spring', stiffness: 380, damping: 40 }}>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={ui.tab}
                      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="absolute inset-0 overflow-y-auto no-scrollbar pt-[max(54px,calc(env(safe-area-inset-top)+8px))] pb-[120px]"
                    >
                      {screens[ui.tab]}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                <AnimatePresence>
                  {ui.chapter !== null && (
                    <Pushed id={`chapter-${ui.chapter}`} onBack={() => ui.openChapter(null)} padTop={false}>
                      <Chapter key={ui.chapter} month={ui.chapter} onBack={() => ui.openChapter(null)} />
                    </Pushed>
                  )}
                  {ui.profile && (
                    <Pushed id="profile" onBack={() => ui.openProfile(false)}>
                      <Profile onBack={() => ui.openProfile(false)} />
                    </Pushed>
                  )}
                </AnimatePresence>

                <TabBar />
                <AnimatePresence>{ui.studio !== null && <Studio key={ui.studio} month={ui.studio} onClose={() => ui.openStudio(null)} />}</AnimatePresence>
                <Sheets />
              </>
            )}

            <AnimatePresence>{!onboarded && <Onboarding />}</AnimatePresence>
            {IS_STANDALONE && <div className="absolute top-0 inset-x-0 z-[94] pointer-events-none bg-ink/80" style={{ height: 'env(safe-area-inset-top)' }} />}
            <Toast />
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}
