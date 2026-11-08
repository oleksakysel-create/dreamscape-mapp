import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${rand}`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Months elapsed since an ISO date, 1-based and capped to the 12-chapter journey. */
export function currentChapter(journeyStartISO: string, now = new Date()): number {
  const start = new Date(journeyStartISO);
  if (Number.isNaN(start.getTime())) return 1;
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return clamp(months + 1, 1, 12);
}

/** Calendar label for chapter N relative to the journey start. */
export function chapterCalendarLabel(journeyStartISO: string, chapter: number, locale = "en-US") {
  const start = new Date(journeyStartISO);
  const d = new Date(start.getFullYear(), start.getMonth() + chapter - 1, 1);
  return d.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

export function formatDate(iso: string, locale = "en-US") {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}
