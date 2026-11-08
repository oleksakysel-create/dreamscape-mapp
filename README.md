# 🌅 Dreamscape

> *Your life is a story you can author yourself.*

A 12-month personal journey web app that blends self-reflection, intentional priorities, goal
planning, and meditative SVG coloring. It's designed for **zero guilt**: no streak penalties,
no shame, and full autonomy.

**Docs:** [PRD](PRD.md) · [Research](RESEARCH.md) · [Design system](DESIGN_SYSTEM.md) · [Architecture](ARCHITECTURE.md)

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript (strict, `noUncheckedIndexedAccess`) ·
Tailwind CSS v4 · shadcn-style UI on Radix · Framer Motion · Lucide · Zustand ·
React Hook Form + Zod · Supabase (Auth, Postgres, RLS, Storage) · PostHog · Vitest + RTL ·
Playwright

---

## 1. Run locally
```bash
npm install
```
```bash
npm run dev
```
Open http://localhost:3000. **No environment variables are needed**: the app runs fully local
in guest and demo modes.

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Develop / production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit + component tests |
| `npm run test:e2e` | Playwright core journey (builds and starts the app on :3100) |
| `npm run seed:generate` | Regenerate `supabase/seed.sql` + `public/coloring/*.svg` from TS data |
| `npm run verify:art` | Prove all 24 illustrations tile with no overlaps or gaps (Chromium) |

## 2. Environment variables
Copy `.env.example` to `.env.local`. Every variable is optional.
```bash
NEXT_PUBLIC_SUPABASE_URL=          # enables accounts + cloud sync
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_POSTHOG_KEY=           # enables privacy-first analytics
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # auth email redirect base
```

## 3. Supabase setup
1. Create a project at supabase.com and copy its **URL** and **anon key** into `.env.local`.
2. Apply the schema, RLS, and seed data, either **with the CLI**:
   ```bash
   npx supabase link --project-ref <your-ref>
   ```
   ```bash
   npx supabase db push
   ```
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
   ```
   or **in the SQL editor**, by running these files in order:
   `supabase/migrations/20261101000000_init_schema.sql` →
   `supabase/migrations/20261101000100_rls_policies.sql` → `supabase/seed.sql`.
3. **Auth → URL configuration:** add `http://localhost:3000/auth/callback` (and your production
   URL) as a redirect URL. Email/password auth is used.
4. *(Optional)* Upload `public/coloring/*.svg` to the `coloring` storage bucket, which the
   migration creates as public read-only. The app renders illustrations from code, so this is
   only for external consumers.

What you get: 14 tables, an auto-profile trigger on signup, owner-only RLS on all user tables,
and read-only reference data. When a user signs in, their local guest journey is uploaded if
their account is empty, and every later change syncs automatically through zod-validated
server actions.

## 4. Demo mode (for reviewers)
- **Instant tour:** on the landing page, click **Explore the demo**. This loads "Alex", who is
  mid-journey: chapters 1–2 are complete, chapter 3 is in progress, and the demo includes
  actions, a reassessed wheel, and 9 achievements. Every screen is populated.
- **Your own run:** click **Begin your journey** to go through onboarding as a guest.
- **Reset:** go to Settings and choose **Leave demo** / **Erase journey**.
- Everything is stored in `localStorage` (`dreamscape-journey`). No network calls are made
  without env vars.

## 5. Test results
**Unit + component (Vitest):** 3 files, **22 tests passed**.

**E2E (Playwright, production build, Chromium):** **4 tests passed**:
```
✓ [mobile]  Mobile › bottom navigation and touch coloring work on a phone (Pixel 7)
✓ [desktop] Core user journey › landing → onboarding → chapter → coloring → progress → settings
✓ [desktop] Core user journey › demo mode loads a populated journey instantly
✓ [desktop] Core user journey › unknown chapter shows a friendly not-found page
4 passed (33.0s)
```
The core-journey test covers all 12 MVP steps. It uses real keyboard input on sliders, checks
the 3-focus limit and zod validation errors, and uses **real pointer taps** on SVG regions. It
checks undo/redo through both buttons and ⌘Z/⇧⌘Z, verifies **autosave across a page reload**,
tests zoom and reset, and fills every region to completion. It asserts that the 8 expected
achievements unlock, runs a wheel re-assessment, and changes priorities with a store-level
assertion that **no goals, reflections, colorings, or actions were lost**. Finally, it asserts
**zero console errors**.

Other checks:
- Supabase migrations and seed were applied on Postgres 16 with auth/storage stubs. RLS
  isolation was verified: cross-user reads return 0 rows and cross-user writes are rejected.
- `verify:art` reports 0 overlaps and 0 gaps across all 24 illustrations.

> First-time Playwright users: `npx playwright install chromium`.

## 6. Feature checklist
- [x] Landing page with guest start, demo, sign in, and register (degrades gracefully without Supabase)
- [x] 7-step onboarding: name and pronouns → identity → age → 12 sphere sliders → priorities (focus ≤ 3 / maintain / later, optional "suggest from my ratings") → goals (RHF + zod) → ready
- [x] Journey map: 12 chapters with calendar labels, a "Now" highlight, status dots, colored thumbnails, and every chapter open
- [x] Chapter: personalized reflection (name, rotating focus sphere, goal tokens; text + 1–10 scale), draft autosave, and an on-device **AI-ready summary**
- [x] Action planner: date, time, life sphere, reminder offset, browser notifications, `.ics` calendar export, done toggle
- [x] Curated gallery (2 themed categories per month, plus all 24), **one page per month**, with confirmation before switching
- [x] Coloring Studio: tap-to-fill, 4 palettes + custom color + recent colors, eraser, undo/redo, zoom/pan/pinch/wheel, "show unfilled" hint, progress, autosave indicator, SVG download, completion modal
- [x] 13 achievements, evaluated by a pure rules engine, with an animated toast queue
- [x] Progress: stats, Wheel of Life (now vs. where you began, hover tooltips, table view), achievements grid, collection gallery, reflection timeline
- [x] Settings: profile, priorities editing that never loses data (new focus areas prompt for a goal), reminders, analytics opt-out, export JSON, erase / leave demo, sign out
- [x] Supabase: auth server actions, session middleware, normalized schema, RLS, storage bucket, generated seed, offline-first sync with status badge
- [x] PostHog: allow-listed props, DNT respected, opt-out, no autocapture or recording
- [x] Responsive: sidebar on desktop, bottom nav on mobile, skeleton/empty/error/404 states, Framer Motion transitions, reduced-motion support, dark-mode tokens

## 7. Architecture at a glance
Offline-first Zustand store (persisted) → achievements engine + analytics on every mutation →
optional Supabase sync through zod-validated server actions under RLS. The coloring
illustrations are procedurally generated, tiling SVG regions rendered as memoized paths, with
event delegation, pointer-gesture zoom/pan, and a pure undo/redo history. See
[ARCHITECTURE.md](ARCHITECTURE.md) for the schema, RLS, and module map.

### Known limitations / next steps
- Reminders fire while the app is open (plus `.ics` export). The `notifications` table is ready
  for a Supabase cron or edge function to send emails or web push.
- Sync is last-write-wins per row. Multi-device conflict resolution is out of MVP scope.
- The summarizer is local and heuristic. A model-backed `Summarizer` can be plugged in without
  UI changes.
