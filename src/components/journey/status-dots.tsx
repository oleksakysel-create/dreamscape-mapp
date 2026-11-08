import { CalendarCheck, Palette, PenLine } from "lucide-react";
import type { ChapterStatus } from "@/lib/selectors";
import { cn } from "@/lib/utils";

export function StatusDots({ status, className }: { status: ChapterStatus; className?: string }) {
  const items = [
    { icon: PenLine, label: "Reflection", state: status.reflection === "done" ? 2 : status.reflection === "started" ? 1 : 0 },
    { icon: CalendarCheck, label: "Action", state: status.actions > 0 ? 2 : 0 },
    { icon: Palette, label: "Coloring", state: status.coloring === "done" ? 2 : status.coloring === "none" ? 0 : 1 },
  ];
  return (
    <ul className={cn("flex gap-1.5", className)}>
      {items.map(({ icon: Icon, label, state }) => (
        <li
          key={label}
          title={`${label}: ${state === 2 ? "done" : state === 1 ? "in progress" : "not started"}`}
          className={cn(
            "grid size-7 place-items-center rounded-full border",
            state === 2 ? "border-transparent bg-sage text-white" : state === 1 ? "border-sage/50 bg-sage-soft text-sage" : "border-ink/10 bg-white/50 text-ink/35",
          )}
        >
          <Icon className="size-3.5" aria-hidden />
          <span className="sr-only">
            {label} {state === 2 ? "done" : state === 1 ? "in progress" : "not started"}
          </span>
        </li>
      ))}
    </ul>
  );
}
