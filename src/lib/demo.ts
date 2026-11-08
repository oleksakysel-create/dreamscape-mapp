import { newlyEarned } from "@/lib/achievements";
import { getIllustration } from "@/lib/coloring/illustrations";
import { PALETTES } from "@/lib/coloring/palettes";
import type { Fills } from "@/lib/coloring/types";
import { MONTHS } from "@/lib/data/months";
import { initialData } from "@/lib/store/initial";
import type { JourneyData, Scores } from "@/lib/store/types";

function paletteFill(imageId: string, paletteIndex: number, ratio = 1): Fills {
  const ill = getIllustration(imageId);
  if (!ill) return {};
  const colors = PALETTES[paletteIndex % PALETTES.length]!.colors;
  const count = Math.round(ill.regions.length * ratio);
  return Object.fromEntries(ill.regions.slice(0, count).map((r, i) => [r.id, colors[(i * 3) % colors.length]!]));
}

const iso = (d: Date) => d.toISOString();
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** A realistic, mid-journey persona so reviewers can explore every screen instantly. */
export function buildDemoJourney(today = new Date()): JourneyData {
  const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const day = (m: number, d: number) => new Date(start.getFullYear(), start.getMonth() + m - 1, d, 10, 0);

  const first: Scores = { health: 4, mind: 5, relationships: 6, family: 7, love: 6, career: 5, finances: 4, growth: 6, fun: 3, home: 6, community: 4, purpose: 5 };
  const latest: Scores = { ...first, health: 6, mind: 6, fun: 5, finances: 5, growth: 7 };

  const data: JourneyData = {
    ...initialData(),
    mode: "demo",
    profile: { name: "Alex", identity: "Explorer", pronouns: "they/them", ageRange: "25–34", journeyStart: ymd(start) },
    onboardedAt: iso(day(1, 1)),
    assessments: [
      { id: "as_demo_1", takenAt: iso(day(1, 1)), scores: first },
      { id: "as_demo_2", takenAt: iso(day(3, 1)), scores: latest },
    ],
    priorities: {
      health: "focus", fun: "focus", growth: "focus",
      mind: "maintain", family: "maintain", relationships: "maintain", career: "maintain", finances: "maintain",
      love: "backlog", home: "backlog", community: "backlog", purpose: "backlog",
    },
    goals: {
      health: { sphereId: "health", title: "Move my body 3 times a week", why: "I want to feel strong and rested.", firstStep: "Morning walk on Mondays", updatedAt: iso(day(1, 1)) },
      fun: { sphereId: "fun", title: "Pick up watercolor painting again", why: "Creating makes me feel like me.", firstStep: "Buy a small travel set", updatedAt: iso(day(1, 1)) },
      growth: { sphereId: "growth", title: "Read 12 books this year", why: "Curiosity keeps me alive.", firstStep: "Library card renewal", updatedAt: iso(day(1, 1)) },
    },
    reflections: {
      1: {
        month: 1,
        answers: {
          "m1-q1": "I need more rest and less scrolling at night. I feel tired but hopeful.",
          "m1-q2": "I would walk to work twice a week and sleep before midnight.",
          "m1-q3": "7",
        },
        updatedAt: iso(day(1, 5)),
        completedAt: iso(day(1, 5)),
        summary: { headline: "There's a warm, hopeful light in your words, circling around health & energy.", themes: ["health"], mood: "bright", keyPhrase: "I would walk to work twice a week and sleep before midnight.", wordCount: 28, generatedBy: "local-heuristic-v1", createdAt: iso(day(1, 5)) },
      },
      2: {
        month: 2,
        answers: {
          "m2-q1": "Making tea and reading a few pages of a book before bed.",
          "m2-q2": "My sister, who always calls on Sundays. I would thank her for her patience.",
          "m2-q3": "6",
        },
        updatedAt: iso(day(2, 8)),
        completedAt: iso(day(2, 8)),
        summary: { headline: "Your words feel grounded and honest, circling around family and learning & growth.", themes: ["family", "growth"], mood: "steady", keyPhrase: "My sister, who always calls on Sundays.", wordCount: 26, generatedBy: "local-heuristic-v1", createdAt: iso(day(2, 8)) },
      },
      3: { month: 3, answers: { "m3-q1": "Pottery, maybe." }, updatedAt: iso(day(3, 2)) },
    },
    actions: [
      { id: "act_demo_1", month: 1, title: "Morning walk around the park", sphereId: "health", date: ymd(day(1, 8)), time: "07:30", reminder: true, reminderMinutesBefore: 15, notifiedAt: iso(day(1, 8)), doneAt: iso(day(1, 8)), createdAt: iso(day(1, 5)) },
      { id: "act_demo_2", month: 2, title: "Library visit & pick two books", sphereId: "growth", date: ymd(day(2, 12)), time: "17:00", reminder: true, reminderMinutesBefore: 30, notifiedAt: iso(day(2, 12)), doneAt: iso(day(2, 12)), createdAt: iso(day(2, 8)) },
      { id: "act_demo_3", month: 3, title: "Try a beginner watercolor class", sphereId: "fun", date: ymd(new Date(today.getTime() + 5 * 86400_000)), time: "18:30", reminder: true, reminderMinutesBefore: 60, createdAt: iso(day(3, 2)) },
    ],
    colorings: {
      1: { month: 1, imageId: "nature-dawn", fills: paletteFill("nature-dawn", 0), startedAt: iso(day(1, 6)), updatedAt: iso(day(1, 9)), completedAt: iso(day(1, 9)) },
      2: { month: 2, imageId: "bot-lotus", fills: paletteFill("bot-lotus", 1), startedAt: iso(day(2, 9)), updatedAt: iso(day(2, 14)), completedAt: iso(day(2, 14)) },
      3: { month: 3, imageId: "mandala-sunrise", fills: paletteFill("mandala-sunrise", 3, 0.4), startedAt: iso(day(3, 2)), updatedAt: iso(day(3, 2)) },
    },
  };
  const at = iso(day(2, 14));
  for (const id of newlyEarned(data)) data.achievements[id] = at;
  return data;
}

export const DEMO_CHAPTER_COUNT = MONTHS.length;
