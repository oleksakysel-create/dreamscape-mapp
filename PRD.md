# DREAMSCAPE — Product Requirements Document

> *"Your life is a story you can author yourself."*

## 1. Problem
Self-improvement apps tend to motivate with pressure: streaks that break, red badges, and
leaderboards. For many people, especially those who are already stretched, these mechanics
turn reflection into another thing they're failing at, and they quit. Goal-setting tools, on
the other hand, are often dry and give no emotional reward for showing up.

## 2. Vision & principles
A 12-month personal journey that blends **self-reflection**, **intentional priority setting**,
**goal planning**, and **meditative digital coloring** as an intrinsic reward.

| Principle | What it means in the product |
|---|---|
| **Zero guilt** | No streaks, no "you missed a day" or red counters. Every chapter is always open. Achievements only celebrate; none of them punish absence. |
| **Autonomy** | The user chooses their focus (max 3), can change it anytime, can peek ahead, revisit, or skip. Suggestions are always optional. |
| **Privacy** | Reflection text never leaves the device in guest mode. Analytics are allow-listed counts only. Summaries run on-device. |
| **Calm craft** | A warm, tactile, paper-like aesthetic, gentle motion, and generous whitespace. |

## 3. Target users
- **The overwhelmed planner** (25–40) wants direction without another productivity system.
- **The reflective creative** journals sporadically and loves analog rituals like coloring books.
- **The fresh-starter** is at a life transition (new job, move, new year) and wants a structured but kind container.

## 4. Core loop (MVP scope)
1. Landing → **demo** / **guest** / sign up / sign in
2. Onboarding (7 steps): name → identity → age → rate 12 spheres → priorities (focus / maintain / later) → 12-month goals → ready
3. **Journey map**: 12 chapters; the current month is highlighted, and all chapters are open
4. **Chapter**: personalized reflection (tokens for name, rotating focus sphere, and goal) → on-device summary ("reflection mirror")
5. **Planned action**: date, time, reminder (browser notification + `.ics` export)
6. **Choose one** coloring page for the month from a curated gallery (2 themed categories, or browse all 24)
7. **Coloring Studio**: tap-to-fill, palettes, custom color, eraser, undo/redo, zoom/pan/pinch, autosave, completion modal
8. **Achievements** + **Progress** (Wheel of Life vs. baseline, collection, reflection timeline)
9. **Settings**: edit priorities without data loss (goals are keyed by sphere and never deleted), profile, reminders, analytics opt-out, export, and erase

A chapter is **complete** when its reflection and its coloring page are both complete. Actions
are encouraged but optional.

## 5. Success metrics (privacy-safe)
| Metric | Event(s) |
|---|---|
| Activation: onboarding completion rate | `journey_started` → `onboarding_completed` |
| Core loop completion: first chapter done | `reflection_completed` + `coloring_completed` (month = 1) |
| Gentle retention: chapters completed in month N+1 | `reflection_completed` by month |
| Intentionality: actions planned and done | `action_planned`, `action_completed` |
| Re-assessment: wheel check-ins | `assessment_saved` (count > 1) |

## 6. Non-goals (MVP)
Social feeds, public sharing, push via service worker / native apps, paid content, and
LLM-generated prompts (the summarization layer is AI-ready, but local by default).

## 7. Acceptance criteria
All 12 steps of the core journey pass the Playwright E2E test, with zero console errors, on
desktop and mobile (Pixel 7) viewports, in local demo mode with no backend.
