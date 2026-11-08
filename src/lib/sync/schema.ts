import { z } from "zod";
import { SPHERE_IDS } from "@/lib/data/spheres";
import { AGE_RANGES, IDENTITIES } from "@/lib/store/types";

const sphere = z.enum(SPHERE_IDS);
const tier = z.enum(["focus", "maintain", "backlog"]);
const month = z.coerce.number().int().min(1).max(12);
const isoish = z.string().max(40);
const score = z.number().int().min(1).max(10);

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(60),
  identity: z.enum(IDENTITIES),
  pronouns: z.string().max(40),
  ageRange: z.enum(AGE_RANGES),
  journeyStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const summarySchema = z.object({
  headline: z.string().max(400),
  themes: z.array(sphere).max(12),
  mood: z.enum(["tender", "steady", "bright"]),
  keyPhrase: z.string().max(400).optional(),
  wordCount: z.number().int().min(0),
  generatedBy: z.string().max(60),
  createdAt: isoish,
});

export const journeySchema = z.object({
  version: z.literal(1),
  mode: z.enum(["guest", "demo", "account"]).nullable(),
  profile: profileSchema.nullable(),
  onboardedAt: isoish.nullable(),
  assessments: z
    .array(z.object({ id: z.string().max(80), takenAt: isoish, scores: z.record(sphere, score) }))
    .max(200),
  priorities: z.partialRecord(sphere, tier),
  prioritiesUpdatedCount: z.number().int().min(0),
  goals: z.partialRecord(
    sphere,
    z.object({ sphereId: sphere, title: z.string().max(200), why: z.string().max(1000), firstStep: z.string().max(300), updatedAt: isoish }),
  ),
  reflections: z.record(
    z.string(),
    z.object({
      month,
      answers: z.record(z.string().max(20), z.string().max(5000)),
      updatedAt: isoish,
      completedAt: isoish.optional(),
      summary: summarySchema.optional(),
    }),
  ),
  actions: z
    .array(
      z.object({
        id: z.string().max(80),
        month,
        title: z.string().trim().min(1).max(200),
        sphereId: sphere.optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        reminder: z.boolean(),
        reminderMinutesBefore: z.number().int().min(0).max(10080),
        notifiedAt: isoish.optional(),
        doneAt: isoish.optional(),
        createdAt: isoish,
      }),
    )
    .max(1000),
  colorings: z.record(
    z.string(),
    z.object({
      month,
      imageId: z.string().max(80),
      fills: z.record(z.string().max(12), z.string().regex(/^#[0-9a-fA-F]{6}$/)),
      startedAt: isoish,
      updatedAt: isoish,
      completedAt: isoish.optional(),
    }),
  ),
  achievements: z.record(z.string().max(40), isoish),
  settings: z.object({ analytics: z.boolean(), reminders: z.boolean() }),
});

export type JourneyPayload = z.infer<typeof journeySchema>;
