# Market Research — Finch, Happy Color, Fabulous

*Desk research based on the products' public positioning and the team's hands-on experience
with them. Figures such as download counts change often and are intentionally omitted.
Validate with fresh store data before external use.*

## Landscape
| | **Finch** | **Happy Color** | **Fabulous** | **Dreamscape** |
|---|---|---|---|---|
| Category | Self-care pet | Color-by-number | Habit coach | Reflective year journey |
| Core reward | Pet grows and goes on adventures | Satisfying fill and reveal | Streaks, "journeys", coaching | One keepsake coloring page per chapter |
| Motivation style | Nurturing, low pressure | Pure relaxation, no goals | Structured, coach-like, streak-forward | Autonomy-first, zero guilt |
| Time horizon | Daily | Session | Multi-week programs | 12 months, monthly chapters |
| Reflection depth | Light prompts | None | Light | Deep, personalized prompts + on-device summary |
| Monetization | Freemium sub | Ads + IAP content | Premium sub (aggressive paywall) | (Out of MVP) |

## What each teaches us
### Finch: emotional safety beats pressure
- **Works:** A caring companion reframes self-care as nurturing rather than performance. Missed
  days don't punish the user.
- **Risk:** Gamification can feel childish to some adults, and the user's progress gets
  outsourced to the pet.
- **We adopt:** No-penalty design, celebratory micro-moments, and gentle copy.
  **We avoid:** Mascot dependency, so the user stays the protagonist.

### Happy Color: the tactile joy of filling
- **Works:** Instant, deterministic feedback. Tap and the area fills, with a strong sense of
  completion and a growing collection.
- **Risk:** It's purely passive. Number-guided coloring removes creative choice, and ads break
  the calm.
- **We adopt:** Tap-to-fill on exact regions, progress meters, a collection gallery, and zoom
  and pan.
  **We avoid:** Paint-by-number constraints, so color choice stays free, and ad
  interruptions.

### Fabulous: structured journeys feel meaningful
- **Works:** A narrative "journey" framing, science-backed rituals, and polished onboarding.
- **Risk:** Streak anxiety, frequent nudges, and an early hard paywall erode trust. Users who
  fall behind often feel shame and churn.
- **We adopt:** Chaptered narrative structure and a beautiful onboarding.
  **We avoid:** Streaks, shame-based notifications, and paywalls before value.

## Positioning
> **Dreamscape is the only reflective planner where the reward is a moment of calm you create
> yourself, and where falling behind is impossible by design.**

## Behavioral design notes
- **Self-Determination Theory:** autonomy (choose focus, all chapters open), competence (small
  actions, visible wheel growth), relatedness (prompts about connection, chapter 5).
- **Implementation intentions:** Actions require a date and time ("when-then" planning), which
  measurably improves follow-through in the literature.
- **Peak-end rule:** Each chapter ends on a positive peak, the completed artwork plus the
  completion modal.
- **Fresh-start effect:** Monthly chapters create natural restart points without "resetting"
  anything.
- **Ethical guardrails:** No variable-ratio rewards, loss aversion mechanics, or dark-pattern
  notifications. Reminders are only for actions the user explicitly planned.
