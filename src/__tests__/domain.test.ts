import { completedChapters, newlyEarned } from "@/lib/achievements";
import { localSummarizer } from "@/lib/ai/summarize";
import { sanitize } from "@/lib/analytics";
import { MONTHS, personalizePrompt } from "@/lib/data/months";
import { buildDemoJourney } from "@/lib/demo";
import { dueReminders, toICS } from "@/lib/reminders";
import { chapterStatus, personalization } from "@/lib/selectors";
import { initialData } from "@/lib/store/initial";
import { journeySchema } from "@/lib/sync/schema";
import type { PlannedAction } from "@/lib/store/types";
import { currentChapter } from "@/lib/utils";

describe("months & personalization", () => {
  it("has 12 chapters with prompts", () => {
    expect(MONTHS).toHaveLength(12);
    MONTHS.forEach((m) => expect(m.tasks.length).toBeGreaterThanOrEqual(2));
  });
  it("fills tokens with graceful fallbacks", () => {
    expect(personalizePrompt("{name} / {focus} / {goal}", { name: "Ana", focus: "Health", goal: "Run" })).toBe("Ana / Health / Run");
    expect(personalizePrompt("{name}", { name: "", focus: "", goal: "" })).toBe("friend");
  });
  it("rotates focus spheres month by month", () => {
    const d = buildDemoJourney();
    const foci = [1, 2, 3].map((m) => personalization(d, m).sphereId);
    expect(new Set(foci).size).toBe(3);
  });
  it("computes the current chapter from the journey start", () => {
    expect(currentChapter("2026-01-01", new Date(2026, 2, 15))).toBe(3);
    expect(currentChapter("2026-01-01", new Date(2030, 0, 1))).toBe(12);
    expect(currentChapter("not-a-date")).toBe(1);
  });
});

describe("achievements", () => {
  it("awards nothing to an empty journey", () => {
    expect(newlyEarned(initialData())).toEqual([]);
  });
  it("never re-awards and counts complete chapters", () => {
    const d = buildDemoJourney();
    expect(newlyEarned(d)).toEqual([]);
    expect(completedChapters(d)).toEqual([1, 2]);
    expect(chapterStatus(d, 3).coloring).toBe("started");
  });
});

describe("summarizer", () => {
  it("detects themes and mood locally", async () => {
    const s = await localSummarizer.summarize({
      month: 1,
      monthTitle: "Awakening",
      focusSpheres: ["fun"],
      items: [
        { prompt: "q", answer: "I feel happy and proud. I want to sleep more and walk every day.", kind: "text" },
        { prompt: "q", answer: "9", kind: "scale" },
      ],
    });
    expect(s.themes[0]).toBe("health");
    expect(s.mood).toBe("bright");
    expect(s.wordCount).toBeGreaterThan(5);
  });
});

describe("analytics privacy", () => {
  it("strips non-allow-listed and long props", () => {
    const out = sanitize({ month: 3, answer: "secret reflection", title: "my goal", path: "x".repeat(100) });
    expect(out).toEqual({ month: 3 });
  });
});

describe("reminders", () => {
  const base: PlannedAction = { id: "a", month: 1, title: "Walk, then tea", date: "2026-05-10", time: "09:00", reminder: true, reminderMinutesBefore: 15, createdAt: "" };
  it("finds due reminders once", () => {
    expect(dueReminders([base], new Date(2026, 4, 10, 8, 50))).toHaveLength(1);
    expect(dueReminders([base], new Date(2026, 4, 10, 8, 40))).toHaveLength(0);
    expect(dueReminders([{ ...base, notifiedAt: "x" }], new Date(2026, 4, 10, 8, 50))).toHaveLength(0);
  });
  it("produces a valid ICS with an alarm", () => {
    const ics = toICS(base);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:Walk\\, then tea");
    expect(ics).toContain("TRIGGER:-PT15M");
  });
});

describe("sync schema", () => {
  it("accepts the demo journey and rejects bad fills", () => {
    const d = buildDemoJourney();
    expect(journeySchema.safeParse(d).success).toBe(true);
    const bad = { ...d, colorings: { 1: { ...d.colorings[1]!, fills: { r1: "javascript:alert(1)" } } } };
    expect(journeySchema.safeParse(bad).success).toBe(false);
  });
});
