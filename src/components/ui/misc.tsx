import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink", className)}
      {...props}
    />
  );
}

export function Progress({ value, className, color, label }: { value: number; className?: string; color?: string; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${pct}%`, background: color ?? "var(--ds-primary)" }} />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-surface-2", className)} />;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-[15px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line px-6 py-10 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</div>
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {action}
    </div>
  );
}
