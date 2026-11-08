import { cn } from "@/lib/utils";

export function Logo({ className, withWord = true }: { className?: string; withWord?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <defs>
          <linearGradient id="ds-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F2A65A" />
            <stop offset="1" stopColor="#D96C8A" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="15" fill="url(#ds-logo)" />
        <path d="M5 21c4-5 7-5 11-1s7 4 11-1v5a12 12 0 0 1-22 0z" fill="#fff" opacity=".9" />
        <circle cx="21" cy="11" r="3.2" fill="#fff" opacity=".95" />
      </svg>
      {withWord && <span className="font-display text-xl font-semibold tracking-tight">Dreamscape</span>}
    </span>
  );
}
