"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { AchievementIcon } from "@/components/icons";
import { ACHIEVEMENTS } from "@/lib/data/achievements";
import { useJourney } from "@/lib/store/journey-store";

/** Gentle, auto-dismissing toast for newly unlocked achievements. */
export function CelebrationHost() {
  const queue = useJourney((s) => s.celebrate);
  const dismiss = useJourney((s) => s.dismissCelebration);
  const current = ACHIEVEMENTS.find((a) => a.id === queue[0]);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, 4200);
    return () => clearTimeout(t);
  }, [current, dismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4" aria-live="polite">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            data-testid="achievement-toast"
            initial={{ y: -30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface/95 p-3 pr-2 shadow-lift backdrop-blur"
          >
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold">
              <AchievementIcon name={current.icon} className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gold">Achievement unlocked</p>
              <p className="font-display font-semibold">{current.title}</p>
              <p className="truncate text-xs text-muted">{current.description}</p>
            </div>
            <button onClick={dismiss} aria-label="Dismiss" className="ml-1 rounded-full p-1.5 text-muted hover:bg-surface-2">
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
