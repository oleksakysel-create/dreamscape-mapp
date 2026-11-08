"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { IllustrationThumb } from "@/components/coloring/illustration-thumb";
import { StatusDots } from "@/components/journey/status-dots";
import { Button } from "@/components/ui/button";
import { PageHeader, Progress } from "@/components/ui/misc";
import { completedChapters } from "@/lib/achievements";
import { MONTHS } from "@/lib/data/months";
import { chapterStatus, focusSpheres } from "@/lib/selectors";
import { useJourney } from "@/lib/store/journey-store";
import { chapterCalendarLabel, cn, currentChapter } from "@/lib/utils";
import { getSphere } from "@/lib/data/spheres";

export default function JourneyPage() {
  const data = useJourney();
  const start = data.profile!.journeyStart;
  const now = currentChapter(start);
  const done = completedChapters(data);
  const focus = focusSpheres(data);
  const nowStatus = chapterStatus(data, now);
  const nowChapter = MONTHS[now - 1]!;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow={`${data.profile!.name}'s year`}
        title="Your journey map"
        description="Twelve chapters, one story. Every chapter is always open — wander forward, look back, take your time."
      />

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl p-6 shadow-soft sm:p-8" style={{ background: `linear-gradient(135deg, ${nowChapter.gradient[0]}, ${nowChapter.gradient[1]})` }}>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3a302b]/70">Now · Chapter {now}</p>
          <h2 className="mt-1 font-display text-3xl font-semibold text-[#3a302b]">{nowChapter.title}</h2>
          <p className="mt-1 max-w-md text-[#3a302b]/80">{nowChapter.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button asChild data-testid="open-current-chapter">
              <Link href={`/journey/${now}`}>
                {nowStatus.progress > 0 ? "Continue chapter" : "Open chapter"} <ArrowRight />
              </Link>
            </Button>
            <StatusDots status={nowStatus} />
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <div>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="font-semibold">Chapters completed</span>
              <span className="tabular-nums text-muted">{done.length}/12</span>
            </div>
            <Progress value={done.length / 12} color="var(--ds-sage)" label="Chapters completed" />
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted">Your focus</p>
            <ul className="space-y-2">
              {focus.map((id) => (
                <li key={id} className="flex items-center gap-2 text-sm">
                  <span className="size-2.5 rounded-full" style={{ background: getSphere(id).color }} />
                  <span className="font-semibold">{getSphere(id).name}</span>
                  <span className="truncate text-muted">· {data.goals[id]?.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>

      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Chapters">
        {MONTHS.map((m, i) => {
          const status = chapterStatus(data, m.id);
          const coloring = data.colorings[m.id];
          const isNow = m.id === now;
          const complete = done.includes(m.id);
          return (
            <motion.li key={m.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.035 }}>
              <Link
                href={`/journey/${m.id}`}
                data-testid={`chapter-card-${m.id}`}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-surface shadow-soft transition hover:-translate-y-1 hover:shadow-lift",
                  isNow ? "border-primary ring-2 ring-primary/25" : "border-line",
                )}
              >
                <div className="relative flex h-32 items-end justify-between p-4" style={{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }}>
                  <span className="font-display text-5xl font-semibold leading-none text-white/80 drop-shadow-sm">{String(m.id).padStart(2, "0")}</span>
                  {coloring && (
                    <div className="size-20 overflow-hidden rounded-2xl border-[3px] border-white shadow-soft transition group-hover:rotate-2">
                      <IllustrationThumb imageId={coloring.imageId} fills={coloring.fills} />
                    </div>
                  )}
                  <div className="absolute left-4 top-3 flex gap-1.5">
                    {isNow && <span className="rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">Now</span>}
                    {complete && (
                      <span className="flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-bold text-sage">
                        <Sparkles className="size-3" /> Complete
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <p className="text-xs text-muted">{chapterCalendarLabel(start, m.id)}</p>
                    <h3 className="font-display text-xl font-semibold">{m.title}</h3>
                    <p className="text-sm text-muted">{m.subtitle}</p>
                  </div>
                  <StatusDots status={status} className="mt-auto" />
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
