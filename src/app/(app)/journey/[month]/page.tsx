"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect } from "react";
import { ActionPlanner } from "@/components/chapter/action-planner";
import { ColoringSection } from "@/components/chapter/coloring-section";
import { ReflectionForm } from "@/components/chapter/reflection-form";
import { StatusDots } from "@/components/journey/status-dots";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { getMonth } from "@/lib/data/months";
import { chapterStatus } from "@/lib/selectors";
import { useJourney } from "@/lib/store/journey-store";
import { chapterCalendarLabel, currentChapter } from "@/lib/utils";

export default function ChapterPage() {
  const params = useParams<{ month: string }>();
  const month = Number(params.month);
  const chapter = getMonth(month);
  const data = useJourney();

  useEffect(() => {
    if (chapter) track("chapter_opened", { month });
  }, [chapter, month]);

  if (!chapter) notFound();
  const start = data.profile!.journeyStart;
  const now = currentChapter(start);
  const status = chapterStatus(data, month);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/journey">
            <ArrowLeft /> Journey map
          </Link>
        </Button>
        <div className="flex gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Previous chapter" className={month <= 1 ? "pointer-events-none opacity-30" : ""}>
            <Link href={`/journey/${Math.max(1, month - 1)}`}>
              <ChevronLeft />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Next chapter" className={month >= 12 ? "pointer-events-none opacity-30" : ""}>
            <Link href={`/journey/${Math.min(12, month + 1)}`}>
              <ChevronRight />
            </Link>
          </Button>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-3xl p-6 shadow-soft sm:p-10" style={{ background: `linear-gradient(135deg, ${chapter.gradient[0]}, ${chapter.gradient[1]})` }}>
        <span className="pointer-events-none absolute -right-4 -top-8 select-none font-display text-[10rem] font-semibold leading-none text-white/35">{month}</span>
        <div className="relative space-y-2 text-[#3a302b]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
            Chapter {month} · {chapterCalendarLabel(start, month)} {month === now && "· Now"}
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{chapter.title}</h1>
          <p className="text-lg opacity-80">{chapter.subtitle}</p>
          <p className="max-w-xl opacity-80">{chapter.description}</p>
          {month > now && <p className="text-sm font-semibold opacity-80">Peeking ahead? You&apos;re welcome here anytime.</p>}
          <StatusDots status={status} className="pt-2" />
        </div>
      </section>

      <ReflectionForm key={`r-${month}`} month={month} />
      <ActionPlanner key={`a-${month}`} month={month} />
      <ColoringSection key={`c-${month}`} month={month} />
    </div>
  );
}
