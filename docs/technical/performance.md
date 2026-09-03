# Performance model

What costs time, why it is acceptable, and what to do when it stops being
acceptable.

---

## The frame budget

Only one component animates continuously: **NeuralGraph**. Everything else is
static after mount (Analytics, Vault, Schemes, Code), updates on a slow ticker
(VisionStream at 30 ms, OsBar clock at 1 s), or updates only on interaction
(panels, palette, modals).

Per 60 fps frame, NeuralGraph does:

| Work | Complexity | At 45 nodes |
| --- | --- | --- |
| velocity damping | O(n) | 45 |
| pair repulsion | O(n²) | ~2,000 distance/force pairs |
| edge springs | O(e) | ~92 |
| centre gravity + jitter + bounds | O(n) | 45 |
| pulse advance | O(pulses) | 18 |
| state snapshot (clone) | O(n + e + pulses) | ~150 objects |
| SVG re-render | O(n + e + pulses) | ~155 elements |

~2,000 pairwise computations per frame is trivial for a modern CPU; the clone
and the SVG diff are the real cost and are still small at this scale. The
primary risk is **not** the physics — it is the compositor.

---

## Where time actually goes

1. **Backdrop-filter surfaces.** `.glass` and `.glass-strong` apply
   `backdrop-filter: blur()`. Every panel, the sidebar, the OS bar, the palette,
   and the modal layer a blur over whatever is behind them. On GPU compositors
   this is cheap; under software rendering (headless capture, some VMs) it is
   the dominant cost. This is why the screenshot script captures at 1440×900
   rather than 2×.

2. **SVG `drop-shadow` filters.** Each node carries a CSS
   `filter: drop-shadow(...)`; each selected/hovered node adds an extra animated
   ring. Fine at 45 nodes; at hundreds it would be the first thing to remove.

3. **The per-frame state snapshot.** Cloning ~150 small objects per frame
   allocates briefly but stays well within GC comfort. The alternative (mutating
   state in place) would violate React's model and buy almost nothing at this
   scale.

---

## Measured profile

From a production build (`vite build`):

| Artifact | Size | gzip |
| --- | --- | --- |
| JS bundle | ~414 kB | ~134 kB |
| CSS | ~73 kB | ~28 kB |
| Fonts (self-hosted, woff2 + woff) | ~0.5 MB total | n/a (pre-compressed) |

First load is one HTML document, one JS bundle, one CSS file, and font files —
no render-blocking third-party requests.

---

## Optimisations already in place

- **Deterministic, one-time generation.** 327 notes are built once inside a
  `useState` lazy initialiser; there is no per-render generation.
- **Memoised derived data.** `activity` in App and the chart series in
  Analytics are `useMemo`-wrapped.
- **Event-driven viewport handling.** Pan clamping happens inside the
  ResizeObserver callback, not in an effect that fires on every viewport change.
- **Ref working-set for physics.** The hot loop never allocates React state
  transitions beyond the one snapshot per frame.
- **Stable keys and small subtrees.** The vision ticker updates only its own
  list; the clock updates only the OS-bar time text.

---

## Scaling paths (if node counts grow)

1. **Spatial hashing / Barnes–Hut** for repulsion, replacing O(n²) with ~O(n
   log n). The current code is deliberately naive because n = 45.
2. **Canvas or WebGL port** of the graph when SVG element count (or
   `drop-shadow` cost) dominates — a natural pairing with the
   [`resonance shader`](https://github.com/zazieproductions/CREATIVE-CORTEX-V4.1)
   direction in the roadmap.
3. **Static backdrop.** Replace per-panel `backdrop-filter` with a single
   full-stage backdrop layer if the panel count grows.
4. **Web Workers** for generation if the corpora grow large enough to matter
   (they do not at 327 notes).

---

## Verifying performance

- Profile with the browser's Performance tab; the RAF loop should show a
  `Scripting` cost well under 4 ms/frame at 45 nodes.
- `npm run build` reports bundle and gzip sizes; keep the JS bundle under
  ~500 kB raw as a soft target.
- Capture a timeline in headless Chromium with
  `CHROMIUM_EXECUTABLE=… scripts/capture-screenshots.mjs`-style instrumentation
  to confirm the compositor is the bottleneck under software rendering.
