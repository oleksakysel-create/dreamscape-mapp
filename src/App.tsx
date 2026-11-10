import { AnimatePresence, MotionConfig, motion, type PanInfo } from 'framer-motion'
import { LayoutGrid, Route, Sun } from 'lucide-react'
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

const TABS: { id: Tab; label: string; icon: typeof Sun }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'journey', label: 'Journey', icon: Route },
  { id: 'board', label: 'Board', icon: LayoutGrid },
]

/** iPhone status bar, drawn only inside the desktop phone frame (a real phone shows its own). */
function StatusBar() {
  return (
    <>
      <div className="absolute top-0 inset-x-0 z-[95] h-[54px] pt-1 pl-[46px] pr-[30px] flex items-center justify-between pointer-events-none" aria-hidden>
        <span className="text-[17px] font-semibold tracking-[-0.02em]">9:41</span>
        <span className="flex items-center gap-1.5">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
            <rect x="0" y="8" width="3" height="4" rx="1" />
            <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
            <rect x="10" y="3" width="3" height="9" rx="1" />
            <rect x="15" y="0" width="3" height="12" rx="1" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
            <path d="M8 2.6c2.4 0 4.6.9 6.2 2.5l1.2-1.3A10.4 10.4 0 0 0 8 .8 10.4 10.4 0 0 0 .6 3.8l1.2 1.3A8.7 8.7 0 0 1 8 2.6z" />
            <path d="M8 6c1.4 0 2.7.5 3.7 1.4l1.2-1.3A7 7 0 0 0 8 4.2a7 7 0 0 0-4.9 1.9l1.2 1.3C5.3 6.5 6.6 6 8 6z" />
            <path d="M8 9.3c.5 0 1 .2 1.4.6L8 11.4 6.6 9.9c.4-.4.9-.6 1.4-.6z" />
          </svg>
          <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
            <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="currentColor" strokeOpacity="0.4" />
            <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
            <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="currentColor" fillOpacity="0.45" />
          </svg>
        </span>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-[11px] w-[126px] h-[37px] rounded-full bg-black z-[96] pointer-events-none" aria-hidden />
    </>
  )
}

function TabBar() {
  const tab = useUI((s) => s.tab)
  const setTab = useUI((s) => s.setTab)
  return (
    <nav className="absolute bottom-0 inset-x-0 z-30 bg-[#101012]/95 backdrop-blur-xl border-t border-white/[0.08] pt-[7px] pb-[max(8px,env(safe-area-inset-bottom))] sm:pb-[30px] grid grid-cols-3 px-6" aria-label="Tab bar">
      {TABS.map((t) => {
        const active = tab === t.id
        const Icon = t.icon
        return (
          <button
            key={t.id}
            onClick={() => {
              haptic()
              setTab(t.id)
            }}
            aria-current={active ? 'page' : undefined}
            className={cx('h-[46px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium', active ? 'text-fg' : 'text-mute')}
          >
            <Icon size={24} strokeWidth={active ? 2 : 1.7} className={active ? 'text-sky' : ''} />
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}

const SCROLL = 'absolute inset-0 overflow-y-auto no-scrollbar pt-[max(10px,env(safe-area-inset-top))] sm:pt-[54px] pb-[110px] sm:pb-[124px]'

/** Screen pushed from the right, with iOS swipe-back. */
function Pushed({ id, onBack, children }: { id: string; onBack: () => void; children: ReactNode }) {
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
      className={cx(SCROLL, 'z-[25] bg-ink shadow-[-20px_0_40px_rgba(0,0,0,0.5)]')}
    >
      {children}
    </motion.div>
  )
}

const TAB_NAME: Record<Tab, string> = { today: 'Today', journey: 'Journey', board: 'Board' }

export default function App() {
  const onboarded = useStore((s) => Boolean(s.profile))
  const ui = useUI()
  const pushed = ui.chapter !== null || ui.profile
  const screens: Record<Tab, ReactNode> = { today: <Today />, journey: <Journey />, board: <Board /> }

  return (
    <MotionConfig reducedMotion="user">
      <div className="h-full w-full flex sm:py-8 sm:overflow-auto">
        <div className="relative w-full h-full sm:m-auto sm:shrink-0 sm:w-[412px] sm:h-[866px] sm:rounded-[58px] sm:p-[11px] sm:bg-[#151517] sm:shadow-[0_0_0_2px_#26262a,0_40px_120px_rgba(0,0,0,0.75),0_0_90px_rgba(156,203,240,0.08)]">
          <div className="relative w-full h-full bg-ink overflow-hidden sm:rounded-[47px] isolate">
            {IS_ELECTRON && <div className="drag-region absolute top-0 inset-x-0 h-[44px] z-[97]" />}
            <div className="hidden sm:block">
              <StatusBar />
              <div className="absolute top-0 inset-x-0 h-[54px] z-[94] bg-ink/85 backdrop-blur-xl pointer-events-none" aria-hidden />
            </div>
            <div className="hidden sm:block absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-fg z-[97] pointer-events-none" />

            {onboarded && (
              <>
                <motion.div className="absolute inset-0" animate={{ x: pushed ? -90 : 0, opacity: pushed ? 0.5 : 1 }} transition={{ type: 'spring', stiffness: 380, damping: 40 }}>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={ui.tab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className={SCROLL}
                    >
                      {screens[ui.tab]}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                <AnimatePresence>
                  {ui.chapter !== null && (
                    <Pushed id={`chapter-${ui.chapter}`} onBack={() => ui.openChapter(null)}>
                      <Chapter key={ui.chapter} month={ui.chapter} back={TAB_NAME[ui.tab]} onBack={() => ui.openChapter(null)} />
                    </Pushed>
                  )}
                  {ui.profile && (
                    <Pushed id="profile" onBack={() => ui.openProfile(false)}>
                      <Profile back={TAB_NAME[ui.tab]} onBack={() => ui.openProfile(false)} />
                    </Pushed>
                  )}
                </AnimatePresence>

                <TabBar />
                <AnimatePresence>{ui.studio !== null && <Studio key={ui.studio} month={ui.studio} onClose={() => ui.openStudio(null)} />}</AnimatePresence>
                <Sheets />
              </>
            )}

            <AnimatePresence>{!onboarded && <Onboarding />}</AnimatePresence>
            {IS_STANDALONE && <div className="absolute top-0 inset-x-0 z-[94] pointer-events-none bg-ink/85" style={{ height: 'env(safe-area-inset-top)' }} />}
            <Toast />
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}
