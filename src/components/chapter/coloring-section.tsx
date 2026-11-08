"use client";

import { ArrowRight, Check, Palette, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { IllustrationThumb } from "@/components/coloring/illustration-thumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/misc";
import { getIllustration, getImageMeta, COLORING_IMAGES } from "@/lib/coloring/illustrations";
import { progressOf } from "@/lib/coloring/history";
import { CATEGORY_LABELS } from "@/lib/coloring/types";
import { getMonth } from "@/lib/data/months";
import { useJourney } from "@/lib/store/journey-store";
import { cn } from "@/lib/utils";

export function ColoringSection({ month }: { month: number }) {
  const chapter = getMonth(month)!;
  const coloring = useJourney((s) => s.colorings[month]);
  const choose = useJourney((s) => s.chooseColoring);
  const [browsing, setBrowsing] = useState(!coloring);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string | null>(coloring?.imageId ?? null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const curated = COLORING_IMAGES.filter((c) => chapter.galleryCategories.includes(c.category));
  const list = showAll ? COLORING_IMAGES : curated;
  const hasProgress = Boolean(coloring && Object.keys(coloring.fills).length);

  const commit = (id: string) => {
    choose(month, id);
    setBrowsing(false);
    setConfirm(null);
  };

  const onChoose = () => {
    if (!selected) return;
    if (hasProgress && selected !== coloring?.imageId) setConfirm(selected);
    else commit(selected);
  };

  if (coloring && !browsing) {
    const ill = getIllustration(coloring.imageId)!;
    const meta = getImageMeta(coloring.imageId)!;
    const progress = progressOf(coloring.fills, ill.regions.map((r) => r.id));
    return (
      <Card id="coloring">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-5 text-lavender" /> This month&apos;s coloring
          </CardTitle>
          <CardDescription>A quiet reward for showing up. Color at your own pace — it saves as you go.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Link href={`/studio/${month}`} className="block w-full max-w-[220px] overflow-hidden rounded-2xl border border-line shadow-soft transition hover:shadow-lift">
              <IllustrationThumb imageId={coloring.imageId} fills={coloring.fills} />
            </Link>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{CATEGORY_LABELS[meta.category]}</p>
                <p className="font-display text-2xl font-semibold" data-testid="chosen-illustration">{meta.title}</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{coloring.completedAt ? "Completed" : progress > 0 ? "In progress" : "Ready when you are"}</span>
                  <span className="tabular-nums text-muted">{Math.round(progress * 100)}%</span>
                </div>
                <Progress value={progress} color="var(--ds-lavender)" label="Coloring progress" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild data-testid="open-studio">
                  <Link href={`/studio/${month}`}>
                    {coloring.completedAt ? <Check /> : <Palette />}
                    {coloring.completedAt ? "View in studio" : progress > 0 ? "Continue coloring" : "Open Coloring Studio"}
                    <ArrowRight />
                  </Link>
                </Button>
                {!coloring.completedAt && (
                  <Button variant="ghost" onClick={() => setBrowsing(true)}>
                    <RefreshCw /> Change page
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="coloring">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="size-5 text-lavender" /> Choose your coloring page
        </CardTitle>
        <CardDescription>
          Pick <b>one</b> illustration for {chapter.title}. Curated for this chapter: {chapter.galleryCategories.map((c) => CATEGORY_LABELS[c]).join(" & ")}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2" role="tablist">
          <button role="tab" aria-selected={!showAll} onClick={() => setShowAll(false)} className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", !showAll ? "bg-ink text-canvas" : "text-muted hover:text-ink")}>
            Curated · {curated.length}
          </button>
          <button role="tab" aria-selected={showAll} onClick={() => setShowAll(true)} className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", showAll ? "bg-ink text-canvas" : "text-muted hover:text-ink")}>
            Full gallery · {COLORING_IMAGES.length}
          </button>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="radiogroup" aria-label="Coloring illustrations">
          {list.map((img) => {
            const active = selected === img.id;
            return (
              <li key={img.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-testid={`gallery-${img.id}`}
                  onClick={() => setSelected(img.id)}
                  className={cn("group w-full overflow-hidden rounded-2xl border bg-surface text-left transition hover:-translate-y-0.5 hover:shadow-soft", active ? "border-primary ring-2 ring-primary/40" : "border-line")}
                >
                  <div className="relative aspect-square">
                    <IllustrationThumb imageId={img.id} />
                    {active && (
                      <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-primary text-primary-ink shadow-soft">
                        <Check className="size-4" />
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-sm font-semibold">{img.title}</p>
                    <p className="text-[11px] capitalize text-muted">
                      {CATEGORY_LABELS[img.category]} · {img.difficulty}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onChoose} disabled={!selected} data-testid="choose-illustration">
            <Check /> Choose this page
          </Button>
          {coloring && (
            <Button variant="ghost" onClick={() => setBrowsing(false)}>
              Keep current page
            </Button>
          )}
        </div>
      </CardContent>

      <Dialog open={Boolean(confirm)} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogTitle>Start a new page?</DialogTitle>
          <DialogDescription className="mt-2">Each chapter holds one coloring page. Switching will set aside the colors you&apos;ve added so far.</DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Keep coloring
            </Button>
            <Button onClick={() => confirm && commit(confirm)}>Switch page</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
