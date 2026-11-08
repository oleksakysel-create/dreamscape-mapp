"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, BellOff, CalendarCheck, CalendarPlus, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Input, Label } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import { getMonth } from "@/lib/data/months";
import { getSphere, LIFE_SPHERES, type SphereId } from "@/lib/data/spheres";
import { actionDate, requestNotificationPermission, toICS } from "@/lib/reminders";
import { focusSpheres } from "@/lib/selectors";
import { useJourney } from "@/lib/store/journey-store";
import type { PlannedAction } from "@/lib/store/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().trim().min(2, "Name your action in a few words.").max(200),
  sphereId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time."),
  reminder: z.boolean(),
  reminderMinutesBefore: z.coerce.number().int().min(0).max(10080),
});
type Values = z.input<typeof schema>;

const tomorrow = () => {
  const d = new Date(Date.now() + 86400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function downloadICS(a: PlannedAction) {
  const blob = new Blob([toICS(a)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${a.title.slice(0, 40).replace(/[^\w-]+/g, "-")}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ActionPlanner({ month }: { month: number }) {
  const chapter = getMonth(month)!;
  const all = useJourney((s) => s.actions);
  const priorities = useJourney((s) => s.priorities);
  const addAction = useJourney((s) => s.addAction);
  const toggleDone = useJourney((s) => s.toggleActionDone);
  const remove = useJourney((s) => s.removeAction);
  const actions = all.filter((a) => a.month === month).sort((a, b) => actionDate(a).getTime() - actionDate(b).getTime());
  const focus = focusSpheres({ priorities });
  const [permission, setPermission] = useState<string | null>(null);

  const { register, handleSubmit, formState, reset, watch } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", sphereId: focus[0] ?? "", date: tomorrow(), time: "09:00", reminder: true, reminderMinutesBefore: 15 },
  });
  const reminderOn = watch("reminder");

  const onSubmit = handleSubmit(async (v) => {
    const parsed = schema.parse(v);
    if (parsed.reminder) setPermission(await requestNotificationPermission());
    addAction({
      month,
      title: parsed.title,
      sphereId: (parsed.sphereId || undefined) as SphereId | undefined,
      date: parsed.date,
      time: parsed.time,
      reminder: parsed.reminder,
      reminderMinutesBefore: parsed.reminderMinutesBefore,
    });
    reset({ ...v, title: "" });
  });

  return (
    <Card id="actions">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="size-5 text-sage" /> Planned actions
        </CardTitle>
        <CardDescription>{chapter.actionPrompt}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-surface-2/70 p-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="action-title">What will you do?</Label>
            <Input id="action-title" data-testid="action-title" placeholder="e.g. A slow walk without my phone" aria-invalid={Boolean(formState.errors.title)} {...register("title")} />
            <FieldError>{formState.errors.title?.message}</FieldError>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="action-date">Date</Label>
              <Input id="action-date" data-testid="action-date" type="date" {...register("date")} />
              <FieldError>{formState.errors.date?.message}</FieldError>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="action-time">Time</Label>
              <Input id="action-time" data-testid="action-time" type="time" {...register("time")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="action-sphere">Life sphere</Label>
              <select id="action-sphere" className="h-12 w-full rounded-2xl border border-line bg-surface px-3 text-[15px]" {...register("sphereId")}>
                <option value="">None</option>
                {LIFE_SPHERES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {focus.includes(s.id) ? "★ " : ""}
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input type="checkbox" className="size-4 accent-[var(--ds-primary)]" data-testid="action-reminder" {...register("reminder")} />
              Remind me
            </label>
            <select
              aria-label="Reminder timing"
              disabled={!reminderOn}
              className="h-9 rounded-full border border-line bg-surface px-3 text-sm disabled:opacity-50"
              {...register("reminderMinutesBefore")}
            >
              <option value={0}>at the time</option>
              <option value={15}>15 min before</option>
              <option value={60}>1 hour before</option>
              <option value={1440}>1 day before</option>
            </select>
            <Button type="submit" size="sm" className="ml-auto" data-testid="add-action">
              <CalendarPlus /> Plan it
            </Button>
          </div>
          {permission === "denied" && (
            <p className="text-xs text-muted">Browser notifications are blocked — you can still add the action to your calendar below.</p>
          )}
        </form>

        {actions.length === 0 ? (
          <EmptyState icon={<CalendarPlus className="size-5" />} title="Nothing planned yet" description="One small, intentional step is plenty. There's no wrong size." />
        ) : (
          <ul className="space-y-2" data-testid="action-list">
            {actions.map((a) => (
              <li key={a.id} className={cn("flex items-center gap-3 rounded-2xl border border-line bg-surface p-3", a.doneAt && "opacity-70")}>
                <button
                  onClick={() => toggleDone(a.id)}
                  aria-label={a.doneAt ? "Mark as not done" : "Mark as done"}
                  aria-pressed={Boolean(a.doneAt)}
                  className={cn("grid size-7 shrink-0 place-items-center rounded-full border-2 transition", a.doneAt ? "border-sage bg-sage text-white" : "border-line hover:border-sage")}
                >
                  {a.doneAt && <Check className="size-4" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate font-semibold", a.doneAt && "line-through")}>{a.title}</p>
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    {actionDate(a).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    {a.reminder ? <Bell className="size-3" aria-label="Reminder on" /> : <BellOff className="size-3" aria-label="No reminder" />}
                    {a.sphereId && (
                      <span className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full" style={{ background: getSphere(a.sphereId).color }} />
                        {getSphere(a.sphereId).name}
                      </span>
                    )}
                  </p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Add to calendar" title="Add to calendar (.ics)" onClick={() => downloadICS(a)}>
                  <CalendarPlus />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Remove action" onClick={() => remove(a.id)}>
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
