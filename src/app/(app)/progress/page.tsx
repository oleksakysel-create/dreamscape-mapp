"use client";

import { Lock, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { IllustrationThumb } from "@/components/coloring/illustration-thumb";
import { AchievementIcon } from "@/components/icons";
import { SphereRatingList } from "@/components/sphere-rating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { WheelOfLife } from "@/components/wheel-of-life";
import { completedChapters } from "@/lib/achievements";
import { getImageMeta } from "@/lib/coloring/illustrations";
import { ACHIEVEMENTS } from "@/lib/data/achievements";
import { getMonth } from "@/lib/data/months";
import { defaultScores, firstScores, latestScores } from "@/lib/selectors";
import { useJourney } from "@/lib/store/journey-store";
import type { Scores } from "@/lib/store/types";
import { cn, formatDate } from "@/lib/utils";

export default function ProgressPage() {
  const data = useJourney();
  const saveAssessment = useJourney((s) => s.saveAssessment);
  const current = latestScores(data) ?? defaultScores();
  const baseline = data.assessments.length > 1 ? firstScores(data) : null;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Scores>(current);

  const unlocked = ACHIEVEMENTS.filter((a) => data.achievements[a.id]).length;
  const collection = Object.values(data.colorings).sort((a, b) => a.month - b.month);
  const reflections = Object.values(data.reflections).filter((r) => r.completedAt).sort((a, b) => a.month - b.month);
  const stats = [
    { label: "Chapters complete", value: completedChapters(data).length },
    { label: "Reflections", value: reflections.length },
    { label: "Actions done", value: data.actions.filter((a) => a.doneAt).length },
    { label: "Pages colored", value: collection.filter((c) => c.completedAt).length },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader eyebrow="Your growth" title="Personal progress" description="Not a scoreboard — a mirror. Notice what has shifted, and be kind about what hasn't." />

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
            <dt className="text-xs font-semibold text-muted">{s.label}</dt>
            <dd className="font-display text-4xl font-semibold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Wheel of life</CardTitle>
              <CardDescription>
                Last checked {data.assessments.length ? formatDate(data.assessments[data.assessments.length - 1]!.takenAt) : "—"}
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setDraft(current);
                setOpen(true);
              }}
              data-testid="reassess"
            >
              <RefreshCw /> Check in
            </Button>
          </CardHeader>
          <CardContent>
            <WheelOfLife current={current} baseline={baseline} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              {unlocked} of {ACHIEVEMENTS.length} unlocked · celebrated, never required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" data-testid="achievements-grid">
              {ACHIEVEMENTS.map((a) => {
                const at = data.achievements[a.id];
                return (
                  <li
                    key={a.id}
                    data-testid={`achievement-${a.id}`}
                    data-unlocked={Boolean(at)}
                    className={cn("flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center", at ? "border-gold/30 bg-gold-soft/60" : "border-dashed border-line")}
                  >
                    <span className={cn("grid size-10 place-items-center rounded-full", at ? "bg-surface text-gold shadow-soft" : "bg-surface-2 text-muted/60")}>
                      {at ? <AchievementIcon name={a.icon} className="size-5" /> : <Lock className="size-4" />}
                    </span>
                    <p className={cn("text-sm font-semibold leading-tight", !at && "text-muted")}>{a.title}</p>
                    <p className="text-[11px] leading-snug text-muted">{a.description}</p>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your collection</CardTitle>
          <CardDescription>One page per chapter — a visual diary of your year.</CardDescription>
        </CardHeader>
        <CardContent>
          {collection.length === 0 ? (
            <EmptyState icon={<Sparkles className="size-5" />} title="Your gallery is waiting" description="Choose a coloring page in any chapter and it will appear here." />
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" data-testid="collection">
              {collection.map((c) => (
                <li key={c.month}>
                  <Link href={`/studio/${c.month}`} className="group block">
                    <div className="overflow-hidden rounded-2xl border border-line shadow-soft transition group-hover:-translate-y-0.5 group-hover:shadow-lift">
                      <IllustrationThumb imageId={c.imageId} fills={c.fills} />
                    </div>
                    <p className="mt-2 text-sm font-semibold">{getMonth(c.month)!.title}</p>
                    <p className="text-xs text-muted">
                      {getImageMeta(c.imageId)?.title} · {c.completedAt ? "complete" : "in progress"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {reflections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reflection timeline</CardTitle>
            <CardDescription>Gentle summaries, generated privately on your device.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l-2 border-line pl-5">
              {reflections.map((r) => (
                <li key={r.month} className="relative">
                  <span className={cn("absolute -left-[27px] top-1.5 size-3 rounded-full ring-4 ring-surface", r.summary?.mood === "bright" ? "bg-gold" : r.summary?.mood === "tender" ? "bg-lavender" : "bg-sage")} />
                  <p className="text-xs font-semibold text-muted">
                    Chapter {r.month} · {getMonth(r.month)!.title} · {formatDate(r.completedAt!)}
                  </p>
                  <p className="text-[15px]">{r.summary?.headline ?? "Reflection completed."}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Check in with your life spheres</DialogTitle>
          <DialogDescription className="mb-4 mt-1">Where are things today? Your earlier snapshot stays for comparison.</DialogDescription>
          <SphereRatingList scores={draft} onChange={(id, v) => setDraft((d) => ({ ...d, [id]: v }))} />
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              data-testid="save-assessment"
              onClick={() => {
                saveAssessment(draft);
                setOpen(false);
              }}
            >
              Save check-in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
