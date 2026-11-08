"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, PenLine, Quote, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SphereIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Label, Textarea } from "@/components/ui/input";
import { getSummarizer } from "@/lib/ai/summarize";
import { getMonth } from "@/lib/data/months";
import { getSphere } from "@/lib/data/spheres";
import { focusSpheres, personalizedTasks } from "@/lib/selectors";
import { useJourney } from "@/lib/store/journey-store";
import { cn, formatDate } from "@/lib/utils";

export function ReflectionForm({ month }: { month: number }) {
  const data = useJourney();
  const save = useJourney((s) => s.saveReflection);
  const entry = data.reflections[month];
  const tasks = useMemo(() => personalizedTasks(data, month), [data, month]);
  const [answers, setAnswers] = useState<Record<string, string>>(entry?.answers ?? {});
  const [state, setState] = useState<"idle" | "saved" | "summarizing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(!entry?.completedAt);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quietly autosave drafts so nothing typed is ever lost.
  useEffect(() => {
    if (!editing) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    const prev = useJourney.getState().reflections[month]?.answers ?? {};
    if (JSON.stringify(prev) === JSON.stringify(answers)) return;
    draftTimer.current = setTimeout(() => {
      save(month, answers, false);
      setState("saved");
    }, 900);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [answers, editing, month, save]);

  const complete = async () => {
    const filled = tasks.filter((t) => (answers[t.id] ?? "").trim().length > 0);
    if (filled.length === 0) return setError("Answer at least one prompt — even a single sentence is enough.");
    setError(null);
    setState("summarizing");
    const summary = await getSummarizer().summarize({
      month,
      monthTitle: getMonth(month)!.title,
      items: tasks.map((t) => ({ prompt: t.text, answer: answers[t.id] ?? "", kind: t.kind })),
      focusSpheres: focusSpheres(data),
    });
    save(month, answers, true, summary);
    setState("idle");
    setEditing(false);
  };

  const summary = entry?.summary;

  return (
    <Card id="reflection">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PenLine className="size-5 text-primary" /> Reflection
            </CardTitle>
            <CardDescription>Personal prompts for this chapter. Write as much or as little as feels right.</CardDescription>
          </div>
          {entry?.completedAt && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-sage-soft px-2.5 py-1 text-xs font-semibold text-sage">
              <Check className="size-3.5" /> {formatDate(entry.completedAt)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <AnimatePresence>
          {!editing && summary && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 rounded-2xl bg-lavender-soft p-5" data-testid="reflection-summary">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-lavender">
                <Sparkles className="size-3.5" /> Your reflection mirror
              </p>
              <p className="font-display text-lg leading-snug">{summary.headline}</p>
              {summary.keyPhrase && (
                <p className="flex gap-2 text-sm italic text-muted">
                  <Quote className="size-4 shrink-0 opacity-60" /> {summary.keyPhrase}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {summary.themes.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold">
                    <SphereIcon id={t} className="size-3" style={{ color: getSphere(t).color }} /> {getSphere(t).name}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted">Generated privately on your device.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {tasks.map((t, i) => (
          <div key={t.id} className="space-y-2">
            <Label htmlFor={t.id} className="block font-display text-[17px] font-semibold leading-snug">
              <span className="mr-2 text-primary">{i + 1}.</span>
              {t.text}
            </Label>
            <p className="text-xs text-muted">{t.hint}</p>
            {t.kind === "text" ? (
              <Textarea
                id={t.id}
                data-testid={`answer-${t.id}`}
                readOnly={!editing}
                value={answers[t.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [t.id]: e.target.value }))}
                placeholder="Begin anywhere…"
                className={cn(!editing && "bg-surface-2/60")}
              />
            ) : (
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby={t.id}>
                {Array.from({ length: 10 }, (_, k) => String(k + 1)).map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={answers[t.id] === v}
                    disabled={!editing}
                    data-testid={`scale-${t.id}-${v}`}
                    onClick={() => setAnswers((a) => ({ ...a, [t.id]: v }))}
                    className={cn(
                      "size-10 rounded-full border text-sm font-semibold tabular-nums transition",
                      answers[t.id] === v ? "border-primary bg-primary text-primary-ink shadow-soft" : "border-line bg-surface hover:border-primary/50",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <FieldError>{error}</FieldError>
        <div className="flex flex-wrap items-center gap-3">
          {editing ? (
            <Button onClick={complete} disabled={state === "summarizing"} data-testid="complete-reflection">
              {state === "summarizing" ? <Loader2 className="animate-spin" /> : <Check />}
              {entry?.completedAt ? "Save changes" : "Complete reflection"}
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <PenLine /> Revisit answers
            </Button>
          )}
          {editing && state === "saved" && <span className="text-xs text-muted" data-testid="draft-saved">Draft saved</span>}
        </div>
      </CardContent>
    </Card>
  );
}
