# Dreamscape Architecture

## Overview
```
┌──────────────────────────── Browser ────────────────────────────┐
│ Next.js App Router (React 19, client components for the app)    │
│                                                                 │
│  UI ─▶ Zustand journey store (persist → localStorage)           │
│         │   every mutation → achievements engine → toasts       │
│         │                  → analytics.track (allow-listed)     │
│         ▼                                                       │
│  SyncProvider (only when signed in)                             │
│    pull once on start · debounced push (1.5s) on change         │
└─────────┬───────────────────────────────────────────────────────┘
          │ Server Actions (zod-validated)
┌─────────▼─────────────── Next.js server ────────────────────────┐
│ app/actions/auth.ts   signUp / signIn / signOut                 │
│ app/actions/sync.ts   pushJourney / pullJourney                 │
│ middleware.ts         refreshes Supabase session cookie         │
└─────────┬───────────────────────────────────────────────────────┘
          │ @supabase/ssr (user JWT → RLS enforced)
┌─────────▼───────────── Supabase ────────────────────────────────┐
│ Auth · Postgres (normalized tables + RLS) · Storage (SVG bucket)│
└─────────────────────────────────────────────────────────────────┘
```

**Offline-first:** the local store is always the UI's source of truth, so the app is fully
functional with **no backend** (guest and demo modes). With Supabase configured and a signed-in
user, the store syncs to normalized tables. A guest journey is uploaded on first sign-in when
the account is empty.

## Source layout
```
src/
  app/
    page.tsx                 Landing
    (auth)/login, register   Auth (RHF + zod; degrade to guest when unconfigured)
    onboarding/              7-step wizard
    (app)/                   Authenticated-or-guest shell (sidebar / bottom nav, gate)
      journey/               12-chapter map
      journey/[month]/       Chapter: reflection · action planner · coloring choice
      studio/[month]/        Coloring Studio
      progress/              Wheel of life · achievements · collection · timeline
      settings/              Profile · priorities · preferences · data
    actions/                 Server actions (auth, sync)
    auth/callback/           Email-confirmation code exchange
  components/                UI kit, coloring engine, chapter & shell components
  lib/
    data/                    Spheres, months + reflection tasks, achievements (single source of truth)
    coloring/                geometry, 24 procedural illustrations, history (undo/redo), palettes
    store/                   Zustand store, types, hydration hook
    ai/summarize.ts          Summarizer interface + on-device implementation
    achievements.ts          Pure rules engine
    analytics.ts             Privacy-first PostHog wrapper
    reminders.ts             Due-reminder logic, ICS export, notification permission
    sync/schema.ts           zod schema for the full journey payload
    supabase/                Config, browser and server clients
supabase/
  migrations/                Schema + RLS SQL
  seed.sql                   Generated from src/lib/data (npm run seed:generate)
scripts/                     Seed generator, illustration tiling verifier
e2e/                         Playwright core-journey tests
```

## Coloring engine
- **Illustrations are code**: 24 deterministic generators (mandala rings, landscape bands,
  waves, polygon tilings, petals, starfields) emit `{ id, d, evenOdd? }` regions.
- **Regions tile the canvas** and never overlap. Shapes inside other shapes are evenodd holes
  in their parent, so a tap fills exactly what the user sees.
  `npm run verify:art` proves this by sampling a grid with `isPointInFill` in Chromium:
  0 overlaps and 0 gaps for all 24.
- **Rendering**: one `<svg>`, with each region a `React.memo` path. A tap re-renders a single
  path. A single delegated `onClick` handles taps, with no per-path listeners.
- **Gestures**: pointer events with a 6px tap/drag threshold. Pointer capture starts only once
  a drag begins, so taps keep their target. Pinch uses two pointers; a non-passive wheel zooms
  at the cursor. View transforms are clamped (1×–6×) so the paper never leaves the frame.
- **History**: pure `paint/undo/redo` over `{regionId, prev, next}` ops, capped at 300.
- **Autosave**: 450ms debounce into the persisted store, plus a flush on `pagehide`,
  `visibilitychange`, and unmount.

## Database schema
Migration: `supabase/migrations/20261101000000_init_schema.sql`

| Table | Kind | Key | Notes |
|---|---|---|---|
| `life_spheres` | reference | `id text` | 12 rows, color + icon |
| `months` | reference | `id 1..12` | title, copy, `gallery_categories text[]` |
| `reflection_tasks` | reference | `id text` | FK month, `kind text\|scale`, prompt tokens |
| `coloring_images` | reference | `id text` | category, difficulty, `region_count`, `storage_path` |
| `achievements` | reference | `id text` | |
| `users` | user | `id → auth.users` | profile, journey_start, settings jsonb; auto-created by trigger |
| `life_assessments` | user | uuid; unique (user, assessment_key, sphere) | one row per sphere per check-in, score 1–10 |
| `user_priorities` | user | (user, sphere) | tier `focus\|maintain\|backlog` |
| `user_goals` | user | unique (user, sphere) | goals keyed by sphere, so they survive priority changes |
| `user_reflections` | user | unique (user, month) | `answers jsonb {taskId: text}`, `summary jsonb` |
| `planned_actions` | user | (user, client id) | date, time, reminder offset, done |
| `monthly_colorings` | user | (user, month) | **one image per month**, `fills jsonb {regionId: #hex}` |
| `user_achievements` | user | (user, achievement) | unlocked_at |
| `notifications` | user | unique (user, action, kind) | reminder queue (`scheduled_for`, `sent_at`) for a future cron/edge sender |

## Row Level Security
Migration: `supabase/migrations/20261101000100_rls_policies.sql`
- Reference tables: `select` for `anon, authenticated`. Clients have no write policies.
- `users`: `auth.uid() = id` for all operations.
- Every per-user table: `auth.uid() = user_id` in both `using` and `with check`
  (`(select auth.uid())` form for planner caching).
- Storage bucket `coloring`: public read-only.

Verified locally on Postgres 16 with Supabase stubs: user B sees 0 of user A's rows, a
cross-user insert is rejected, anon cannot write reference data, and the signup trigger creates
the profile row.

## Validation & security
- All server-action input is parsed with **zod** (`journeySchema`): bounded lengths, enum
  spheres and tiers, fills restricted to `#RRGGBB` (so injected SVG attributes are rejected),
  and capped array sizes.
- The server derives `user_id` from the verified session (`auth.getUser()`) and never from the
  client.
- Inline SVG export only contains generator-produced path data plus validated hex colors.

## Analytics
`track(event, props)` is a no-op unless `NEXT_PUBLIC_POSTHOG_KEY` is set, the user hasn't opted
out (Settings), and Do-Not-Track is off. Props pass through an allow-list (`month`, `step`,
`image_id`, `achievement_id`, …). Strings over 64 characters are dropped. PostHog is
initialized with autocapture, session recording, IP, and URL capture disabled. Page views send
the route pattern only (`/journey/[id]`).

## AI-ready summarization
`Summarizer { id; summarize(input): Promise<ReflectionSummary> }`. The default
`localSummarizer` runs on-device (lexicon themes, mood from language and scale answers, and a
representative sentence). To plug in a model, implement the interface (e.g. via a server
action) and return it from `getSummarizer()`. The stored `summary.generatedBy` records which
implementation produced it.

## Testing
- **Unit / component (Vitest + RTL)**: illustration catalog integrity, geometry clipping,
  undo/redo, progress, achievements, personalization, summarizer, analytics sanitizer,
  reminders and ICS, sync schema, ColoringCanvas taps, PrioritySorter limit, WheelOfLife
  table view.
- **E2E (Playwright)**: the full 12-step journey on a production build, with real pointer taps
  on SVG regions, autosave verified across a reload, and a zero-console-errors assertion. Plus
  demo mode, 404, and a mobile (Pixel 7) touch and overflow test.
