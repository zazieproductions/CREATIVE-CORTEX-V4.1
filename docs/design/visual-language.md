# Visual language

The design system is an **institutional instrument**: near-black void, hairline
borders, monospace telemetry, and colour used only to carry status. This
document is the token reference and the rationale.

---

## Typography

| Role | Face | Notes |
| --- | --- | --- |
| Display / headings | **Space Grotesk** (300–700) | geometric grotesque; used for brand, note titles, palette names |
| Data / labels / code | **JetBrains Mono** (400/500/700) | the "machine" voice; every metric, id, tag, and hint |

Both faces are **self-hosted** via `@fontsource` (imported in `main.tsx`); there
is no font CDN request at runtime. The pairing is the core of the aesthetic:
humanist display for identity, engineering mono for evidence.

The `font-display`/`font-mono`/`font-sans` tokens are defined in `src/index.css`
under `@theme`.

---

## Colour tokens

```css
--color-void:  #06060d;   /* page background */
--color-panel: #0c0d18;   /* raised surface base */
--color-edge:  #1d2040;   /* hairline borders */
--color-ink:   #c8cadb;   /* primary text */
--color-ink-dim:#6a6f90;  /* secondary text */
--color-ink-faint:#3a3e58;/* tertiary text */
--color-neon:  #22d3ee;   /* cyan — primary accent, "neural" */
--color-flux:  #e879f9;   /* magenta — "vision stream" */
--color-violet:#a78bfa;   /* violet — analytics */
--color-amber: #fbbf24;   /* amber — synthesis / entropy */
--color-acid:  #4ade80;   /* green — "online" / vault */
```

Colour is **reserved for meaning**:

- Every module has an **accent** (`#22d3ee` neural, `#e879f9` vision,
  `#a78bfa` analytics, `#34d399` vault, `#fbbf24` synthesis, `#f472b6` hex,
  `#2dd4bf` code, `#fb7185` schemes).
- Every knowledge domain has a **domain colour** (`DOMAIN_COLORS`), which
  colours graph nodes, note chips, and chart points consistently.
- Three metric colours recur everywhere — coherence `#22d3ee`, resonance
  `#e879f9`, novelty `#fbbf24` — so a note's three bars mean the same thing in
  the vault list, the detail modal, and the analytics panel.

The accent→module and domain→colour mappings are the app's chromatic legend;
the sidebar is where they are learned.

---

## Borders, spacing, and surfaces

- **Borders** are 1 px at low white/violet alpha (`rgba(120,130,255,.06–.2)`),
  sometimes tinted by an accent (`#22d3ee33` etc.). Hairlines, never solid
  frames.
- **Surfaces** are two-step glass:
  - `.glass` — `rgba(20,22,44,.72) → rgba(10,11,24,.78)`, `backdrop-blur(14px)`;
  - `.glass-strong` — denser (`rgba(16,18,38,.92) → rgba(8,9,22,.94)`,
    `blur(20px)`), for modals, the palette, and the OS bar.
- **Radii** — `rounded-lg`/`rounded-xl` for chips and windows, `rounded-2xl` for
  modals.
- **Micro-labels** — 7–9 px uppercase mono with `tracking-[0.2em–0.34em]`; the
  primary way the interface whispers "instrument" rather than "web page".

## Motion

Defined as Tailwind keyframes in `index.css`:

| Token | Effect | Use |
| --- | --- | --- |
| `pulse-glow` | opacity 0.55→1 | "online" pill, live dots, brand mark |
| `blink` | stepped on/off | vision stream caret |
| `scan` / `drift` / `float` | slow translation | ambient atmosphere (sparing) |
| `spin-slow` | 14 s rotation | synthesis forge atom |
| `shimmer` | background sweep | reserved |

The still/still-moving hierarchy is deliberate: **chrome is still, instruments
move.** The graph breathes continuously; the vision stream types forever; the
caret blinks. Motion is the app's heartbeat and its claim to liveness.

## State colours

| State | Convention |
| --- | --- |
| Selected / focused | accent fill + glow (`drop-shadow` / `box-shadow` in accent) |
| Hover | subtle accent tint or border brightening |
| Disabled | 40–60% opacity |
| Danger / warning | amber (`#fbbf24`) — scheme risk, entropy |

## Iconography

`lucide-react`, always at 1.5 px stroke, always tinted by the enclosing
module's accent. Icons are semantic (network for the graph, radio for the
stream, terminal for code) and never decorative past their label.

---

## What the language refuses to be

No pastels, no SaaS gradients, no drop shadows that lift cards off a light
canvas, no emoji. The void background and the monospace telemetry are the
aesthetic; the moment the UI would read as "friendly product," the joke —
*this is the cockpit of a mind* — would stop working.
