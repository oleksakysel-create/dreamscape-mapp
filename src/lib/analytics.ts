/**
 * Privacy-first analytics.
 *
 * - No-op unless NEXT_PUBLIC_POSTHOG_KEY is set AND the user has not opted out.
 * - Respects Do-Not-Track.
 * - Only an allow-listed set of primitive, non-identifying properties is sent.
 *   Reflection answers, goal text, names and action titles can never be logged:
 *   they are not part of the type and are stripped at runtime.
 */
import type { PostHog } from "posthog-js";

export type AnalyticsEvent =
  | "$pageview"
  | "journey_started"
  | "demo_loaded"
  | "onboarding_step_completed"
  | "onboarding_completed"
  | "assessment_saved"
  | "priorities_updated"
  | "goal_saved"
  | "chapter_opened"
  | "reflection_saved"
  | "reflection_completed"
  | "action_planned"
  | "action_completed"
  | "coloring_selected"
  | "coloring_completed"
  | "coloring_undo"
  | "achievement_unlocked"
  | "data_reset";

const ALLOWED_PROPS = [
  "path",
  "month",
  "step",
  "mode",
  "count",
  "focus_count",
  "image_id",
  "category",
  "achievement_id",
  "has_reminder",
  "region_count",
] as const;
type AllowedProp = (typeof ALLOWED_PROPS)[number];
export type AnalyticsProps = Partial<Record<AllowedProp, string | number | boolean>>;

let client: PostHog | null = null;
let enabled = false;

export function sanitize(props: Record<string, unknown> = {}): AnalyticsProps {
  const out: AnalyticsProps = {};
  for (const key of ALLOWED_PROPS) {
    const v = props[key];
    if (typeof v === "number" || typeof v === "boolean") out[key] = v;
    else if (typeof v === "string" && v.length <= 64) out[key] = v;
  }
  return out;
}

function dnt() {
  if (typeof navigator === "undefined") return false;
  return navigator.doNotTrack === "1" || (window as unknown as { doNotTrack?: string }).doNotTrack === "1";
}

export async function initAnalytics(optIn: boolean) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  enabled = Boolean(key) && optIn && !dnt();
  if (!enabled || client || typeof window === "undefined") {
    if (client && !enabled) client.opt_out_capturing();
    return;
  }
  const { default: posthog } = await import("posthog-js");
  posthog.init(key!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    persistence: "localStorage",
    ip: false,
    property_denylist: ["$current_url", "$referrer", "$initial_referrer"],
  });
  client = posthog;
}

export function setAnalyticsEnabled(optIn: boolean) {
  enabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY) && optIn && !dnt();
  if (!client) {
    if (enabled) void initAnalytics(true);
    return;
  }
  if (enabled) client.opt_in_capturing();
  else client.opt_out_capturing();
}

export function track(event: AnalyticsEvent, props?: AnalyticsProps) {
  const clean = sanitize(props as Record<string, unknown>);
  if (process.env.NODE_ENV === "development") console.debug("[analytics]", event, clean);
  if (!enabled || !client) return;
  client.capture(event, clean);
}
