"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, CloudCheck, Download, Lightbulb, Loader2, Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/misc";
import { track } from "@/lib/analytics";
import { emptyHistory, paint, progressOf, redo, undo, type History } from "@/lib/coloring/history";
import { getIllustration, getImageMeta, illustrationToSvg } from "@/lib/coloring/illustrations";
import { DEFAULT_COLOR, PALETTES } from "@/lib/coloring/palettes";
import type { Fills } from "@/lib/coloring/types";
import { getMonth } from "@/lib/data/months";
import { useJourney } from "@/lib/store/journey-store";
import type { MonthlyColoring } from "@/lib/store/types";
import { ColoringCanvas, type ColoringCanvasHandle } from "./coloring-canvas";
import { PalettePicker } from "./palette-picker";

const AUTOSAVE_MS = 450;

export function ColoringStudio({ month, coloring }: { month: number; coloring: MonthlyColoring }) {
  const setFillsInStore = useJourney((s) => s.setFills);
  const completeColoring = useJourney((s) => s.completeColoring);
  const illustration = getIllustration(coloring.imageId)!;
  const meta = getImageMeta(coloring.imageId)!;
  const chapter = getMonth(month)!;
  const regionIds = useMemo(() => illustration.regions.map((r) => r.id), [illustration]);

  const [fills, setFills] = useState<Fills>(coloring.fills);
  const [history, setHistory] = useState<History>(emptyHistory);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [eraser, setEraser] = useState(false);
  const [paletteId, setPaletteId] = useState(PALETTES[0]!.id);
  const [recent, setRecent] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const [hint, setHint] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const canvasRef = useRef<ColoringCanvasHandle>(null);
  const pending = useRef<Fills | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = progressOf(fills, regionIds);
  const filledCount = Math.round(progress * regionIds.length);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (pending.current) {
      setFillsInStore(month, pending.current);
      pending.current = null;
    }
    setSaveState("saved");
  }, [month, setFillsInStore]);

  /** Debounced autosave — every change lands in persistent storage within ~0.5s. */
  const commit = useCallback(
    (next: Fills, nextHistory: History) => {
      setFills(next);
      setHistory(nextHistory);
      pending.current = next;
      setSaveState("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, AUTOSAVE_MS);
    },
    [flush],
  );

  // Save immediately when leaving the page or hiding the tab.
  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, [flush]);

  // Completion: the first time every region is filled.
  useEffect(() => {
    if (progress === 1 && !coloring.completedAt) {
      flush();
      completeColoring(month);
      setCelebrate(true);
    }
  }, [progress, coloring.completedAt, completeColoring, flush, month]);

  const onRegionTap = useCallback(
    (regionId: string) => {
      const res = paint(fills, history, regionId, eraser ? undefined : color);
      if (!res) return;
      commit(res.fills, res.history);
      if (!eraser) setRecent((r) => [color, ...r.filter((c) => c !== color)].slice(0, 6));
    },
    [fills, history, eraser, color, commit],
  );

  const doUndo = useCallback(() => {
    const res = undo(fills, history);
    if (res) {
      commit(res.fills, res.history);
      track("coloring_undo", { month });
    }
  }, [fills, history, commit, month]);

  const doRedo = useCallback(() => {
    const res = redo(fills, history);
    if (res) commit(res.fills, res.history);
  }, [fills, history, commit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) doRedo();
        else doUndo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        doRedo();
      } else if (!mod && (e.key === "+" || e.key === "=")) canvasRef.current?.zoomBy(1.3);
      else if (!mod && e.key === "-") canvasRef.current?.zoomBy(1 / 1.3);
      else if (!mod && e.key === "0") canvasRef.current?.reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doUndo, doRedo]);

  const showHint = () => {
    setHint(true);
    setTimeout(() => setHint(false), 1800);
  };

  const download = () => {
    const blob = new Blob([illustrationToSvg(illustration, fills)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dreamscape-${chapter.title.toLowerCase().replace(/\s+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={`/journey/${month}`}>
            <ArrowLeft /> {chapter.title}
          </Link>
        </Button>
        <span className="flex items-center gap-1.5 text-xs text-muted" data-testid="save-state" data-state={saveState} aria-live="polite">
          {saveState === "saving" ? <Loader2 className="size-3.5 animate-spin" /> : <CloudCheck className="size-3.5 text-sage" />}
          {saveState === "saving" ? "Saving…" : "All changes saved"}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ToolButton label="Undo" onClick={doUndo} disabled={!history.past.length}>
              <Undo2 />
            </ToolButton>
            <ToolButton label="Redo" onClick={doRedo} disabled={!history.future.length}>
              <Redo2 />
            </ToolButton>
            <span className="mx-0.5 hidden h-6 w-px bg-line sm:block" />
            <ToolButton label="Zoom in" onClick={() => canvasRef.current?.zoomBy(1.4)}>
              <ZoomIn />
            </ToolButton>
            <ToolButton label="Zoom out" onClick={() => canvasRef.current?.zoomBy(1 / 1.4)}>
              <ZoomOut />
            </ToolButton>
            <ToolButton label="Reset view" onClick={() => canvasRef.current?.reset()}>
              <Maximize2 />
            </ToolButton>
            <span className="ml-auto" />
            <ToolButton label="Show unfilled shapes" onClick={showHint} disabled={progress === 1}>
              <Lightbulb />
            </ToolButton>
            <ToolButton label="Download SVG" onClick={download}>
              <Download />
            </ToolButton>
          </div>
          <ColoringCanvas ref={canvasRef} illustration={illustration} fills={fills} onRegionTap={onRegionTap} highlightUnfilled={hint} />
          <p className="text-center text-xs text-muted">Tap to fill · drag to pan when zoomed · pinch or scroll to zoom · ⌘Z to undo</p>
        </div>

        <aside className="flex min-w-0 flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-soft lg:sticky lg:top-6 lg:self-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Chapter {month} · {chapter.title}</p>
            <h1 className="font-display text-2xl font-semibold">{meta.title}</h1>
            <p className="text-sm text-muted">{meta.description}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Progress</span>
              <span className="tabular-nums text-muted" data-testid="coloring-progress">
                {filledCount}/{regionIds.length} · {Math.round(progress * 100)}%
              </span>
            </div>
            <Progress value={progress} label="Coloring progress" color="var(--ds-sage)" />
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
            <span className="size-9 rounded-full ring-2 ring-surface shadow-soft" style={{ background: eraser ? "#fff" : color }} data-testid="current-color" />
            <span className="text-sm">{eraser ? "Eraser — tap to clear a shape" : "Current color"}</span>
          </div>
          <div className="max-lg:-order-1">
          <PalettePicker
            color={color}
            eraser={eraser}
            paletteId={paletteId}
            recent={recent}
            onColor={(c) => {
              setColor(c);
              setEraser(false);
            }}
            onEraser={() => setEraser((e) => !e)}
            onPalette={setPaletteId}
          />
          </div>
          {coloring.completedAt && (
            <p className="flex items-center gap-2 rounded-2xl bg-sage-soft p-3 text-sm">
              <Check className="size-4 text-sage" /> Completed — you can keep refining anytime.
            </p>
          )}
        </aside>
      </div>

      <Dialog open={celebrate} onOpenChange={setCelebrate}>
        <DialogContent className="text-center" aria-describedby="complete-desc">
          <AnimatePresence>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16 }} className="mx-auto mb-4 w-48 overflow-hidden rounded-2xl shadow-lift">
              <ColoringPreview svg={illustrationToSvg(illustration, fills)} />
            </motion.div>
          </AnimatePresence>
          <DialogTitle>Your {chapter.title} page is complete</DialogTitle>
          <DialogDescription id="complete-desc" className="mt-2">
            A quiet moment, fully colored. It now lives in your collection as a keepsake of this chapter.
          </DialogDescription>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/progress">View my collection</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/journey">Back to journey</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ColoringPreview({ svg }: { svg: string }) {
  return <div className="aspect-square [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function ToolButton({ label, children, ...props }: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="grid size-9 shrink-0 place-items-center rounded-full sm:size-10 border border-line bg-surface text-ink shadow-soft transition hover:bg-surface-2 disabled:opacity-40 [&_svg]:size-[18px]"
      {...props}
    >
      {children}
    </button>
  );
}
