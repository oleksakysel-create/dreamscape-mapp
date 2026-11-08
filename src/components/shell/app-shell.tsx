"use client";

import { motion } from "framer-motion";
import { Cloud, CloudOff, Compass, HardDrive, Map, Settings, Sparkles, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/brand";
import { Skeleton } from "@/components/ui/misc";
import { currentChapter } from "@/lib/utils";
import { useJourney } from "@/lib/store/journey-store";
import { useHydrated } from "@/lib/store/use-hydrated";
import { cn } from "@/lib/utils";
import { CelebrationHost } from "./celebration";
import { ReminderScheduler, SyncProvider, useSyncStatus } from "./providers";

const NAV: { href: string; label: string; icon: LucideIcon; match: RegExp }[] = [
  { href: "/journey", label: "Journey", icon: Map, match: /^\/journey$/ },
  { href: "/journey/current", label: "This month", icon: Compass, match: /^\/(journey\/\d+|studio)/ },
  { href: "/progress", label: "Progress", icon: Sparkles, match: /^\/progress/ },
  { href: "/settings", label: "Settings", icon: Settings, match: /^\/settings/ },
];

function useNavHref(href: string) {
  const start = useJourney((s) => s.profile?.journeyStart);
  if (href === "/journey/current") return `/journey/${start ? currentChapter(start) : 1}`;
  return href;
}

function NavLink({ item, compact }: { item: (typeof NAV)[number]; compact?: boolean }) {
  const pathname = usePathname();
  const href = useNavHref(item.href);
  const active = item.match.test(pathname);
  const Icon = item.icon;
  if (compact) {
    return (
      <Link href={href} aria-current={active ? "page" : undefined} className={cn("relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold", active ? "text-primary" : "text-muted")}>
        {active && <motion.span layoutId="nav-pill-m" className="absolute top-1 h-8 w-14 rounded-full bg-primary-soft" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
        <Icon className="relative size-5" />
        <span className="relative">{item.label}</span>
      </Link>
    );
  }
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn("relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-semibold transition", active ? "text-ink" : "text-muted hover:text-ink")}>
      {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-2xl bg-primary-soft" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
      <Icon className="relative size-5" />
      <span className="relative">{item.label}</span>
    </Link>
  );
}

function SyncBadge() {
  const mode = useJourney((s) => s.mode);
  const status = useSyncStatus((s) => s.status);
  const label =
    mode === "demo" ? "Demo journey · stored on this device" : mode !== "account" ? "Guest · stored on this device" : status === "synced" ? "Synced to your account" : status === "syncing" ? "Syncing…" : "Offline — changes saved locally";
  const Icon = mode !== "account" ? HardDrive : status === "offline" || status === "error" ? CloudOff : Cloud;
  return (
    <p className="flex items-center gap-2 px-3 text-xs text-muted">
      <Icon className="size-3.5 shrink-0" /> {label}
    </p>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const onboarded = useJourney((s) => Boolean(s.onboardedAt && s.profile));
  const name = useJourney((s) => s.profile?.name);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !onboarded) router.replace("/onboarding");
  }, [hydrated, onboarded, router]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-line bg-surface/60 p-5 backdrop-blur lg:flex">
        <Link href="/journey" className="px-2">
          <Logo />
        </Link>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          {name && (
            <div className="rounded-2xl bg-surface-2 p-4">
              <p className="text-xs text-muted">Your story</p>
              <p className="font-display text-lg font-semibold">{name}&apos;s year</p>
            </div>
          )}
          <SyncBadge />
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/journey">
            <Logo className="[&_span]:text-lg" />
          </Link>
        </header>
        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          {hydrated && onboarded ? (
            children
          ) : (
            <div className="mx-auto max-w-5xl space-y-4" aria-busy="true" aria-label="Loading your journey">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96 max-w-full" />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="aspect-[4/5]" />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/95 backdrop-blur lg:hidden" aria-label="Main">
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} compact />
        ))}
      </nav>

      <CelebrationHost />
      <ReminderScheduler />
      <SyncProvider />
    </div>
  );
}
