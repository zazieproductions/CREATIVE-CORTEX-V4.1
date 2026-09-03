# Performance

Where the time and memory go, and the levers that exist.

## Frame budget

The hot path is `NeuralGraph`'s rAF loop plus one SVG re-render per frame:

- Repulsion is O(n²) with n = 45 → ~990 pair evaluations/frame. Negligible.
- Spring pass is O(E) with a `Map` node lookup (E = 76). Negligible.
- The cost that matters is React reconciling ~45 node groups + 76 lines + pulses each frame. On typical hardware this is comfortably 60fps; on low-end integrated GPUs the `backdrop-filter` glass, not the SVG, is the limiter.

## Levers

- `FORCE.jitter` / `damping` trade liveliness for settle time.
- Pulse count (18) scales decorative particles linearly.
- Label rendering is conditional (selected/hover/neighbour) so steady-state SVG text is minimal.

## Memory

- 327 notes × (title + body + tags + links) — a few hundred KB.
- No textures in JS; one 1280×800 PNG decoded by the compositor.
- No unbounded growth except the vision feed, capped at 14 entries, and forge history capped at 6.

## Boot

- Generation of 327 notes + links runs once, synchronously, in a few ms.
- Bundle ≈ 415 kB JS (≈136 kB gzip), dominated by React + framer-motion; code-splitting the modals is possible but not currently warranted.

## Known hot spots / debt

1. **Per-frame React render of the atlas** — the obvious optimisation is moving the atlas to a `<canvas>` or direct DOM mutation; left as SVG for accessibility/inspectability.
2. **`backdrop-filter` overdraw** — many overlapping glass panels blur simultaneously.
3. **No `prefers-reduced-motion`** — the idle animation never stops (tracked in ROADMAP).
