import type { PlannedAction } from "@/lib/store/types";

export function actionDate(a: Pick<PlannedAction, "date" | "time">): Date {
  const [y, m, d] = a.date.split("-").map(Number);
  const [hh, mm] = a.time.split(":").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, hh ?? 9, mm ?? 0);
}

/** Actions whose reminder time has arrived (within the last 12h) and haven't been notified. */
export function dueReminders(actions: readonly PlannedAction[], now = new Date()): PlannedAction[] {
  return actions.filter((a) => {
    if (!a.reminder || a.notifiedAt || a.doneAt) return false;
    const at = actionDate(a).getTime() - a.reminderMinutesBefore * 60_000;
    return at <= now.getTime() && now.getTime() - at < 12 * 3600_000;
  });
}

const pad = (n: number) => String(n).padStart(2, "0");
const icsDate = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
const icsEscape = (s: string) => s.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

export function toICS(a: PlannedAction): string {
  const start = actionDate(a);
  const end = new Date(start.getTime() + 30 * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dreamscape//Journey//EN",
    "BEGIN:VEVENT",
    `UID:${a.id}@dreamscape`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsEscape(a.title)}`,
    "DESCRIPTION:A gentle step from your Dreamscape journey.",
  ];
  if (a.reminder) {
    lines.push("BEGIN:VALARM", `TRIGGER:-PT${a.reminderMinutesBefore}M`, "ACTION:DISPLAY", "DESCRIPTION:Dreamscape reminder", "END:VALARM");
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}
