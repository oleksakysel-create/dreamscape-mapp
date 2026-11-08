"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { pullJourney, pushJourney } from "@/app/actions/sync";
import { initAnalytics, setAnalyticsEnabled, track } from "@/lib/analytics";
import { dueReminders } from "@/lib/reminders";
import { selectData, useJourney } from "@/lib/store/journey-store";
import type { JourneyData } from "@/lib/store/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { create } from "zustand";

/** Analytics bootstrap + anonymous page views (route patterns only, no query strings). */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const optIn = useJourney((s) => s.settings.analytics);
  useEffect(() => {
    void initAnalytics(optIn);
    setAnalyticsEnabled(optIn);
  }, [optIn]);
  useEffect(() => {
    if (pathname) track("$pageview", { path: pathname.replace(/\/\d+(?=\/|$)/g, "/[id]") });
  }, [pathname]);
  return null;
}

/** Fires browser notifications for planned actions while the app is open. */
export function ReminderScheduler() {
  const markNotified = useJourney((s) => s.markNotified);
  useEffect(() => {
    const check = () => {
      const { actions, settings } = useJourney.getState();
      if (!settings.reminders) return;
      const due = dueReminders(actions);
      if (!due.length) return;
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        for (const a of due) new Notification("Dreamscape · a gentle nudge", { body: a.title, tag: a.id, icon: "/icon.svg" });
      }
      markNotified(due.map((a) => a.id));
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [markNotified]);
  return null;
}

type SyncStatus = "local" | "syncing" | "synced" | "offline" | "error";
export const useSyncStatus = create<{ status: SyncStatus; set: (s: SyncStatus) => void }>((set) => ({
  status: "local",
  set: (status) => set({ status }),
}));

/**
 * Offline-first cloud sync. The local store is always the source of truth for
 * the UI; when signed in, changes are pushed (debounced) to Supabase through a
 * server action, and the remote journey is pulled once on start.
 */
export function SyncProvider() {
  const mode = useJourney((s) => s.mode);
  const setStatus = useSyncStatus((s) => s.set);
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || mode !== "account") {
      setStatus("local");
      return;
    }
    let cancelled = false;
    (async () => {
      setStatus("syncing");
      const res = await pullJourney().catch(() => ({ ok: false as const, error: "offline" }));
      if (cancelled) return;
      if (res.ok && res.data) useJourney.getState().hydrateFrom(res.data as JourneyData);
      else if (res.ok) await pushJourney(selectData(useJourney.getState()));
      setStatus(res.ok ? "synced" : "offline");
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, setStatus]);

  useEffect(() => {
    if (!ready || mode !== "account") return;
    return useJourney.subscribe((state, prev) => {
      const a = selectData(state);
      const b = selectData(prev);
      if ((Object.keys(a) as (keyof JourneyData)[]).every((k) => a[k] === b[k])) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        setStatus("syncing");
        const res = await pushJourney(selectData(useJourney.getState())).catch(() => ({ ok: false as const, error: "offline" }));
        setStatus(res.ok ? "synced" : navigator.onLine ? "error" : "offline");
      }, 1500);
    });
  }, [ready, mode, setStatus]);

  return null;
}
