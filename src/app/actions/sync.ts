"use server";

import { SPHERE_IDS, type SphereId } from "@/lib/data/spheres";
import { getServerSupabase } from "@/lib/supabase/server";
import { journeySchema, type JourneyPayload } from "@/lib/sync/schema";

export type SyncResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

async function requireUser() {
  const supabase = await getServerSupabase();
  if (!supabase) return { error: "Supabase is not configured" as const };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { error: "Not signed in" as const };
  return { supabase, user: data.user };
}

/** Upsert the full journey into normalized tables. RLS guarantees row ownership. */
export async function pushJourney(raw: unknown): Promise<SyncResult> {
  const parsed = journeySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid journey payload" };
  const ctx = await requireUser();
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const { supabase, user } = ctx;
  const d = parsed.data;
  const uid = user.id;

  type Op = PromiseLike<{ error: { message: string } | null }>;
  const ops: Op[] = [];
  const add = (cond: unknown, op: () => Op) => {
    if (cond) ops.push(op());
  };
  add(true, () =>
    supabase.from("users").upsert({
      id: uid,
      display_name: d.profile?.name ?? null,
      identity: d.profile?.identity ?? null,
      pronouns: d.profile?.pronouns ?? null,
      age_range: d.profile?.ageRange ?? null,
      journey_start: d.profile?.journeyStart ?? null,
      onboarded_at: d.onboardedAt,
      priorities_updated_count: d.prioritiesUpdatedCount,
      settings: d.settings,
    }),
  );
  add(d.assessments.length, () =>
      supabase.from("life_assessments").upsert(
        d.assessments.flatMap((a) =>
          SPHERE_IDS.map((sphere) => ({ user_id: uid, assessment_key: a.id, sphere_id: sphere, score: a.scores[sphere], taken_at: a.takenAt })),
        ),
        { onConflict: "user_id,assessment_key,sphere_id" },
      ),
  );
  add(Object.keys(d.priorities).length, () =>
      supabase.from("user_priorities").upsert(
        Object.entries(d.priorities).map(([sphere_id, tier]) => ({ user_id: uid, sphere_id, tier })),
        { onConflict: "user_id,sphere_id" },
      ),
  );
  add(Object.keys(d.goals).length, () =>
      supabase.from("user_goals").upsert(
        Object.values(d.goals).map((g) => ({ user_id: uid, sphere_id: g!.sphereId, title: g!.title, why: g!.why, first_step: g!.firstStep, updated_at: g!.updatedAt })),
        { onConflict: "user_id,sphere_id" },
      ),
  );
  add(Object.keys(d.reflections).length, () =>
      supabase.from("user_reflections").upsert(
        Object.values(d.reflections).map((r) => ({ user_id: uid, month_id: r.month, answers: r.answers, summary: r.summary ?? null, completed_at: r.completedAt ?? null, updated_at: r.updatedAt })),
        { onConflict: "user_id,month_id" },
      ),
  );
  add(Object.keys(d.colorings).length, () =>
      supabase.from("monthly_colorings").upsert(
        Object.values(d.colorings).map((c) => ({ user_id: uid, month_id: c.month, image_id: c.imageId, fills: c.fills, started_at: c.startedAt, updated_at: c.updatedAt, completed_at: c.completedAt ?? null })),
        { onConflict: "user_id,month_id" },
      ),
  );
  add(Object.keys(d.achievements).length, () =>
      supabase.from("user_achievements").upsert(
        Object.entries(d.achievements).map(([achievement_id, unlocked_at]) => ({ user_id: uid, achievement_id, unlocked_at })),
        { onConflict: "user_id,achievement_id" },
      ),
  );

  // Actions: upsert current set, delete removed ones, and queue reminder notifications.
  const actionIds = d.actions.map((a) => a.id);
  if (d.actions.length) {
    ops.push(
      supabase.from("planned_actions").upsert(
        d.actions.map((a) => ({
          id: a.id, user_id: uid, month_id: a.month, title: a.title, sphere_id: a.sphereId ?? null,
          due_date: a.date, due_time: a.time, reminder: a.reminder, reminder_minutes_before: a.reminderMinutesBefore,
          notified_at: a.notifiedAt ?? null, done_at: a.doneAt ?? null, created_at: a.createdAt,
        })),
        { onConflict: "user_id,id" },
      ),
    );
  }
  const del = supabase.from("planned_actions").delete().eq("user_id", uid);
  ops.push((actionIds.length ? del.not("id", "in", `(${actionIds.map((id) => `"${id}"`).join(",")})`) : del) as unknown as Op);

  const results = await Promise.all(ops);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };

  const reminders = d.actions.filter((a) => a.reminder && !a.doneAt);
  if (reminders.length) {
    const { error } = await supabase.from("notifications").upsert(
      reminders.map((a) => ({
        user_id: uid,
        action_id: a.id,
        kind: "action_reminder",
        title: a.title,
        scheduled_for: new Date(new Date(`${a.date}T${a.time}:00`).getTime() - a.reminderMinutesBefore * 60_000).toISOString(),
        sent_at: a.notifiedAt ?? null,
      })),
      { onConflict: "user_id,action_id,kind" },
    );
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Rebuild the client journey from normalized rows. Returns null data if the user has none yet. */
export async function pullJourney(): Promise<SyncResult<JourneyPayload | null>> {
  const ctx = await requireUser();
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const { supabase, user } = ctx;
  const q = <T,>(table: string) => supabase.from(table).select("*").eq(table === "users" ? "id" : "user_id", user.id) as unknown as Promise<{ data: T[] | null; error: { message: string } | null }>;

  type Row = Record<string, unknown>;
  const [profile, assessments, priorities, goals, reflections, actions, colorings, achievements] = await Promise.all([
    q<Row>("users"), q<Row>("life_assessments"), q<Row>("user_priorities"), q<Row>("user_goals"),
    q<Row>("user_reflections"), q<Row>("planned_actions"), q<Row>("monthly_colorings"), q<Row>("user_achievements"),
  ]);
  const err = [profile, assessments, priorities, goals, reflections, actions, colorings, achievements].find((r) => r.error);
  if (err?.error) return { ok: false, error: err.error.message };

  const p = profile.data?.[0];
  if (!p || !p.onboarded_at) return { ok: true, data: null };

  const s = (v: unknown) => (v == null ? undefined : String(v));
  const grouped = new Map<string, { takenAt: string; scores: Record<string, number> }>();
  for (const r of assessments.data ?? []) {
    const key = String(r.assessment_key);
    const entry = grouped.get(key) ?? { takenAt: String(r.taken_at), scores: {} };
    entry.scores[String(r.sphere_id)] = Number(r.score);
    grouped.set(key, entry);
  }

  const payload = {
    version: 1 as const,
    mode: "account" as const,
    profile: p.display_name
      ? { name: String(p.display_name), identity: p.identity, pronouns: s(p.pronouns) ?? "", ageRange: p.age_range, journeyStart: String(p.journey_start) }
      : null,
    onboardedAt: s(p.onboarded_at) ?? null,
    assessments: [...grouped.entries()]
      .map(([id, a]) => ({ id, takenAt: a.takenAt, scores: a.scores }))
      .sort((a, b) => a.takenAt.localeCompare(b.takenAt)),
    priorities: Object.fromEntries((priorities.data ?? []).map((r) => [r.sphere_id, r.tier])),
    prioritiesUpdatedCount: Number(p.priorities_updated_count ?? 0),
    goals: Object.fromEntries(
      (goals.data ?? []).map((g) => [g.sphere_id, { sphereId: g.sphere_id as SphereId, title: String(g.title), why: String(g.why ?? ""), firstStep: String(g.first_step ?? ""), updatedAt: String(g.updated_at) }]),
    ),
    reflections: Object.fromEntries(
      (reflections.data ?? []).map((r) => [r.month_id, { month: Number(r.month_id), answers: r.answers, updatedAt: String(r.updated_at), completedAt: s(r.completed_at), summary: r.summary ?? undefined }]),
    ),
    actions: (actions.data ?? []).map((a) => ({
      id: String(a.id), month: Number(a.month_id), title: String(a.title), sphereId: s(a.sphere_id),
      date: String(a.due_date), time: String(a.due_time).slice(0, 5), reminder: Boolean(a.reminder),
      reminderMinutesBefore: Number(a.reminder_minutes_before ?? 0), notifiedAt: s(a.notified_at), doneAt: s(a.done_at), createdAt: String(a.created_at),
    })),
    colorings: Object.fromEntries(
      (colorings.data ?? []).map((c) => [c.month_id, { month: Number(c.month_id), imageId: String(c.image_id), fills: c.fills, startedAt: String(c.started_at), updatedAt: String(c.updated_at), completedAt: s(c.completed_at) }]),
    ),
    achievements: Object.fromEntries((achievements.data ?? []).map((a) => [a.achievement_id, String(a.unlocked_at)])),
    settings: (p.settings as { analytics: boolean; reminders: boolean }) ?? { analytics: true, reminders: true },
  };
  const parsed = journeySchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "Stored journey failed validation" };
  return { ok: true, data: parsed.data };
}
