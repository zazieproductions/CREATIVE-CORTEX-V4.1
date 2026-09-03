# Visual language

The interface reads as scientific instrumentation that has been left running in the dark. This document names the system so it can be extended without breaking character.

## Tokens

All values live in `src/styles/tokens.css` as Tailwind v4 `@theme` tokens. Components never hardcode the palette; they reference `void`, `panel`, `edge`, `ink`, `ink-dim`, `ink-faint`, and the five accents.

| Token | Value | Role |
| --- | --- | --- |
| `void` | `#06060d` | page / stage floor |
| `panel` / `panel2` | `#0c0d18` / translucent | opaque / glass fills |
| `edge` | `#1d2040` | hairline borders |
| `ink` / `ink-dim` / `ink-faint` | `#c8cadb / #6a6f90 / #3a3e58` | three-step text scale |
| `neon` | `#22d3ee` | structure, activity, primary accent |
| `flux` | `#e879f9` | stream, emergence |
| `violet` | `#a78bfa` | analysis |
| `amber` | `#fbbf24` | velocity, warning |
| `acid` | `#4ade80` | health, committed |

## Type

- **Space Grotesk** for display/brand and headings — geometric but slightly off-kilter.
- **JetBrains Mono** for everything instrumental: labels, readouts, ids, the vault. Mono is the voice of the machine; nearly all UI text is mono at 7–12px with wide tracking and uppercase micro-labels.

## Surfaces & material

`.glass` and `.glass-strong` layer a vertical gradient over `backdrop-filter: blur` with a faint indigo hairline. Glow is applied sparingly (`glow-cyan`, `glow-flux`, drop-shadows on nodes) to mark *live* elements, never as decoration for its own sake.

## Motion vocabulary

Defined in tokens: `pulse-glow` (liveness), `blink` (cursor), `shimmer`, `drift`, `float`, `spin-slow`, `scan`. Continuous motion is reserved for things that are *alive* (status dots, cursors, pulses); panels themselves move only on user intent.

## State colour conventions

- cyan = structural / active selection,
- magenta = streaming / emergent,
- amber = caution / velocity,
- acid = success / committed,
- dim/faint ink = inert.

## Responsive behaviour

The OS assumes a desktop canvas. Below `md` the top metrics collapse; the stage still pans/zooms so small screens navigate by camera rather than reflow. This is intentional: it is an instrument, not a document.
