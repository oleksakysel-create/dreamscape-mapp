import { cn } from "@/lib/utils";

export function Logo({ className, withWord = true }: { className?: string; withWord?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      {/* Gradient lives in CSS (not an SVG <defs> id) so duplicate/hidden logos never break each other. */}
      <svg viewBox="0 0 32 32" className="size-8 shrink-0 rounded-full bg-gradient-to-br from-[#F2A65A] to-[#D96C8A]" aria-hidden>
        <path d="M5 21c4-5 7-5 11-1s7 4 11-1v5a12 12 0 0 1-22 0z" fill="#fff" opacity=".9" />
        <circle cx="21" cy="11" r="3.2" fill="#fff" opacity=".95" />
      </svg>
      {withWord && <span className="font-display text-xl font-semibold tracking-tight">Dreamscape</span>}
    </span>
  );
}
