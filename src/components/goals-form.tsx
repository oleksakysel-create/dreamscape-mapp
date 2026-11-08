"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SphereIcon } from "@/components/icons";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { getSphere, type SphereId } from "@/lib/data/spheres";
import type { Goal } from "@/lib/store/types";

export const goalsSchema = z.object({
  goals: z.array(
    z.object({
      sphereId: z.string(),
      title: z.string().trim().min(3, "Give your goal a few words.").max(200),
      why: z.string().trim().max(1000),
      firstStep: z.string().trim().max(300),
    }),
  ),
});
export type GoalsValues = z.infer<typeof goalsSchema>;

const EXAMPLES: Partial<Record<SphereId, string>> = {
  health: "Move my body three times a week",
  mind: "Feel calmer through a 10-minute daily pause",
  career: "Ship a project I'm proud of",
  finances: "Build a 3-month safety cushion",
  fun: "Make space for one hobby every weekend",
  growth: "Read one book a month",
};

export function GoalsForm({ spheres, existing, formId, onSubmit }: { spheres: SphereId[]; existing: Partial<Record<SphereId, Goal>>; formId: string; onSubmit: (v: GoalsValues) => void }) {
  const { register, handleSubmit, formState } = useForm<GoalsValues>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      goals: spheres.map((id) => ({ sphereId: id, title: existing[id]?.title ?? "", why: existing[id]?.why ?? "", firstStep: existing[id]?.firstStep ?? "" })),
    },
  });
  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {spheres.map((id, i) => {
        const s = getSphere(id);
        const err = formState.errors.goals?.[i];
        return (
          <fieldset key={id} className="space-y-3 rounded-3xl border border-line bg-surface p-5">
            <legend className="sr-only">{s.name} goal</legend>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg" style={{ background: `${s.color}22`, color: s.color }}>
                <SphereIcon id={id} className="size-4" />
              </span>
              <p className="font-display text-lg font-semibold">{s.name}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`goal-${id}`}>In 12 months, I would love to…</Label>
              <Input id={`goal-${id}`} data-testid={`goal-title-${id}`} placeholder={EXAMPLES[id] ?? "Describe it in your own words"} aria-invalid={Boolean(err?.title)} {...register(`goals.${i}.title`)} />
              <FieldError>{err?.title?.message}</FieldError>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`why-${id}`} className="font-medium text-muted">Why it matters (optional)</Label>
                <Textarea id={`why-${id}`} className="min-h-20" {...register(`goals.${i}.why`)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`step-${id}`} className="font-medium text-muted">A tiny first step (optional)</Label>
                <Textarea id={`step-${id}`} className="min-h-20" {...register(`goals.${i}.firstStep`)} />
              </div>
            </div>
          </fieldset>
        );
      })}
    </form>
  );
}
