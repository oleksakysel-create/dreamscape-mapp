"use client";

import { motion } from "framer-motion";
import { ArrowRight, Compass, Feather, HeartHandshake, Lock, Map, Palette, PenLine, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Logo } from "@/components/brand";
import { IllustrationThumb } from "@/components/coloring/illustration-thumb";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { getIllustration } from "@/lib/coloring/illustrations";
import { PALETTES } from "@/lib/coloring/palettes";
import { buildDemoJourney } from "@/lib/demo";
import { useJourney } from "@/lib/store/journey-store";
import { useHydrated } from "@/lib/store/use-hydrated";

function paletteFills(id: string, palette: number, ratio = 1) {
  const ill = getIllustration(id)!;
  const colors = PALETTES[palette]!.colors;
  const n = Math.round(ill.regions.length * ratio);
  return Object.fromEntries(ill.regions.slice(0, n).map((r, i) => [r.id, colors[(i * 7) % colors.length]!]));
}

const STEPS = [
  { icon: Compass, title: "Notice", text: "Rate twelve spheres of your life — a snapshot, never a score." },
  { icon: Map, title: "Choose", text: "Pick what matters most this year, and let the rest rest." },
  { icon: PenLine, title: "Reflect", text: "Each month opens a chapter with gentle, personal prompts." },
  { icon: Palette, title: "Color", text: "Unwind with a meditative coloring page — your keepsake for the month." },
];

const PRINCIPLES = [
  { icon: HeartHandshake, title: "Zero guilt", text: "No streaks to break, no red badges, no shame. Return whenever you like." },
  { icon: Feather, title: "Your pace", text: "Every chapter stays open. Peek ahead, revisit, or skip — it's your story." },
  { icon: Lock, title: "Private by design", text: "Reflections stay yours. Analytics never see a single word you write." },
];

export function LandingPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useJourney((s) => Boolean(s.onboardedAt));
  const startJourney = useJourney((s) => s.startJourney);
  const hydrateFrom = useJourney((s) => s.hydrateFrom);

  const hero = useMemo(
    () => [
      { id: "mandala-lotus", fills: paletteFills("mandala-lotus", 0), r: -6, x: "0%", y: "8%" },
      { id: "nature-dawn", fills: paletteFills("nature-dawn", 2), r: 4, x: "52%", y: "0%" },
      { id: "bot-lotus", fills: paletteFills("bot-lotus", 3, 0.6), r: 3, x: "26%", y: "48%" },
    ],
    [],
  );

  const begin = () => {
    if (!onboarded) startJourney("guest");
    router.push(onboarded ? "/journey" : "/onboarding");
  };

  const demo = () => {
    hydrateFrom(buildDemoJourney());
    track("demo_loaded", { mode: "demo" });
    router.push("/journey");
  };

  return (
    <div className="paper-grain min-h-dvh overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-6 md:grid-cols-[1.1fr_1fr] md:pt-14">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            A 12-month journey
          </p>
          <h1 className="font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Your life is a story <span className="italic text-primary">you can author</span> yourself.
          </h1>
          <p className="max-w-lg text-lg text-muted">
            Dreamscape blends self-reflection, intentional priorities, and meditative coloring into one calm, guilt-free year — one chapter at a time.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={begin} disabled={!hydrated} data-testid="cta-begin">
              {onboarded ? "Continue your journey" : "Begin your journey"} <ArrowRight />
            </Button>
            <Button size="lg" variant="secondary" onClick={demo} disabled={!hydrated} data-testid="cta-demo">
              <Play /> Explore the demo
            </Button>
          </div>
          <p className="text-sm text-muted">
            No account needed — start as a guest and{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              save to the cloud
            </Link>{" "}
            whenever you want.
          </p>
        </motion.div>

        <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden>
          <div className="absolute inset-[12%] rounded-full bg-gradient-to-br from-primary-soft via-gold-soft to-lavender-soft blur-2xl" />
          {hero.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, scale: 0.9, rotate: h.r * 2 }}
              animate={{ opacity: 1, scale: 1, rotate: h.r }}
              transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 120, damping: 16 }}
              className="absolute w-[48%] overflow-hidden rounded-3xl border-4 border-white shadow-lift"
              style={{ left: h.x, top: h.y }}
            >
              <div className="animate-float" style={{ animationDelay: `${i * 1.2}s` }}>
                <IllustrationThumb imageId={h.id} fills={h.fills} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-display text-3xl font-semibold tracking-tight">How a chapter unfolds</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl border border-line bg-surface p-6 shadow-soft"
            >
              <div className="mb-4 grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <s.icon className="size-5" />
              </div>
              <p className="text-xs font-bold text-muted">0{i + 1}</p>
              <h3 className="font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-6 rounded-[2rem] bg-ink p-8 text-canvas sm:p-12 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="space-y-2">
              <p.icon className="size-6 text-gold" />
              <h3 className="font-display text-xl font-semibold">{p.title}</h3>
              <p className="text-sm opacity-75">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-10 text-sm text-muted">
        <p>© {new Date().getFullYear()} Dreamscape · Made with care, for slow and intentional living.</p>
      </footer>
    </div>
  );
}
