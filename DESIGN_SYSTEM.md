# Dreamscape Design System

**Mood:** warm paper, golden-hour light, a calm studio. **Voice:** kind, unhurried, second
person, never imperative-shaming.

## Tokens (`src/app/globals.css`)
Defined as CSS variables (`--ds-*`), exposed to Tailwind v4 via `@theme`, with a
hand-tuned **dark mode** under `prefers-color-scheme`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#FBF7F2` | `#1D1917` | Page background (with subtle dot "paper grain") |
| `surface` / `surface-2` | `#FFFDFA` / `#F5EEE6` | `#262120` / `#2F2927` | Cards / wells |
| `ink` / `muted` | `#3A302B` / `#7A6E66` | `#F3EBE4` / `#B3A79E` | Text |
| `line` | `#ECE2D7` | `#3D3532` | Borders, grid |
| `primary` (terracotta) | `#D9704F` | `#EC8F6F` | Primary actions, focus |
| `sage` | `#5F8A6A` | `#9CC3A5` | Completion, "done", progress |
| `lavender` | `#7A6FA8` | `#B9AEE0` | Reflection and coloring accents |
| `gold` | `#C99A2E` | `#E9C46A` | Achievements only |
| `danger` | `#B4483A` | `#F0907F` | Destructive actions (rare) |

Each has a `*-soft` tint for backgrounds. **Status colors are reserved:** sage means done and
gold means achievement, and they are never used decoratively.

## Typography
- **Display:** *Fraunces* (soft optical axis), used for headings and numbers, with tight tracking.
- **Body:** *Nunito Sans* at 15–16px, `leading-relaxed` for reflection text.
- **Eyebrows:** 12px, bold, `tracking-[0.18em]`, uppercase, primary color.

## Shape, depth, motion
- Radii are generous: `rounded-2xl` for inputs, `rounded-3xl` for cards, `rounded-full` for buttons.
- Shadows: `shadow-soft` (resting), `shadow-lift` (hover / modals). They're warm-tinted and
  never gray-black.
- Motion uses Framer Motion springs (`stiffness ≈ 260, damping ≈ 22`), staggered card entrances
  (35ms), and a shared-layout nav pill. All motion respects `prefers-reduced-motion`.

## Components (`src/components/ui`)
shadcn-style, built on Radix primitives with `cva` variants:
`Button` (primary / secondary / soft / ghost / link / danger · sm / md / lg / icon), `Card`,
`Input`, `Textarea`, `Label`, `FieldError`, `Slider` (Radix, per-sphere color), `Dialog`
(Radix), `Badge`, `Progress`, `Skeleton`, `PageHeader`, `EmptyState`.

## Patterns
- **Layout:** mobile-first; a **bottom nav** below `lg`, a **sticky sidebar** at `lg+`, max
  content width 4xl–6xl, and a 16px mobile gutter.
- **States:** every list has an empty state, the app shell shows skeletons while storage
  hydrates, there's a friendly 404 and error boundary, and save/sync status is always visible.
- **Life sphere colors** (12) are identity accents for icons and dots only. Charts encode
  magnitude with a single hue, and a table view is always available (see `WheelOfLife`).
- **Coloring canvas** is always a white "paper" sheet, even in dark mode, with
  `#4A3F3A` non-scaling outlines.
- **Accessibility:** visible focus rings, radio/switch ARIA roles on custom controls,
  keyboard-operable sliders, `aria-live` for save state and toasts, 44px touch targets, and
  undo/redo/zoom keyboard shortcuts.
