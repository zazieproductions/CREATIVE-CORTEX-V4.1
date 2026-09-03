# Rendering system

How pixels get on screen: the SVG path (graph and charts), the DOM path
(window chrome), and the one continuously re-rendering subsystem (the Neural
Atlas).

---

## Two rendering paths

| Path | Media | Subsystems | Re-render cadence |
| --- | --- | --- | --- |
| SVG | vector | Neural Graph, AreaChart, Radar, Sparkline, Gauge | graph: every frame; charts: once |
| DOM | HTML + Tailwind | OsBar, Sidebar, Panel, Minimap, Modal, CommandPalette, lists | on state change |

Both paths share the same design tokens defined in `src/index.css` under
Tailwind's `@theme` block (`--color-void`, `--color-ink`, `--color-neon`,
`--font-mono`, etc.). Charts hard-code a few hex values for gradient stops; the
panel chrome reads tokens via Tailwind utilities.

---

## The Neural Atlas: 60 fps without a render read of a ref

`NeuralGraph` is the only component whose output changes every animation frame.
The physics mutates object positions in place; the render layer needs those
positions as *state* (not as ref reads, which the React hooks rules forbid).

The solution is a **ref working-set + per-frame snapshot**:

```
requestAnimationFrame loop:
  1. mutate nodesRef (positions, velocities) and pulsesRef (progress)
  2. setNodes(nodesRef.map(clone))      // shallow-clone into state
  3. setPulses(pulsesRef.map(clone))
  → React re-renders the <svg> from state
```

- `nodesRef` and `pulsesRef` are initialised from the same factories
  (`createInitialNodes()`, `seedPulses()`) as the state, so the first paint
  matches the first physics frame.
- Dragging a node writes `nodesRef` directly and zeroes the node's velocity; the
  next frame's snapshot carries the new position into the render. The drag
  excludes the node from the force update so it stays under the pointer.
- Selection is stored as `selectedId` (a stable string), never as a reference to
  a per-frame node object, so the inspector never points at a stale snapshot.

### Edge and pulse rendering

- **Edges** are `<line>` elements. Bridge edges (cross-domain) are dashed and
  dimmer; the active node's incident edges brighten and thicken; unrelated
  edges drop to 12% opacity.
- **Pulses** are small `<circle>`s interpolated along an edge by a 0–1 progress
  value (`p.t`), with an opacity envelope of `sin(p.t * π)` and an SMIL
  `<animate>` on radius. Pulse progress advances in the physics loop and re-rolls
  onto a random edge when it completes.

### SVG coordinate mapping

`getScreenCTM().inverse()` converts client-pointer coordinates into the SVG's
`viewBox` space (1080×720). This is what keeps a dragged node glued to the
cursor regardless of the panel's own scaling inside the zoomed stage.

---

## The charts

All charts are pure functions of a data array and a colour:

- **AreaChart** (cortical activity): maps 64 samples to a 420×150 viewBox,
  draws a filled gradient path plus a stroked line, and pulses the last data
  point.
- **Radar** (domain coherence): computes polygon vertices around a centre for
  `n` domains; draws reference rings at 33/66/100%.
- **Bars** (idea velocity): a flex-row of divs whose heights are the value
  ratio — deliberately DOM, not SVG, to show the two rendering idioms side by
  side.
- **Sparkline** (OS bar): a compact 64×22 SVG of the trailing 24 activity
  samples.
- **Gauge**: an SVG arc (a 270° stroke with `stroke-dasharray`) plus a numeric
  readout; the value arcs animate via CSS `transition` on `stroke-dasharray`.

---

## Window chrome

`Panel` is a `framer-motion` div positioned absolutely on the stage with
`left/top/width/height` in stage coordinates. The stage div applies
`transform: translate(pan) scale(scale)` and `transform-origin: top-left`, so
panel coordinates stay constant while the whole stage moves — panels only
re-layout when their own geometry changes, not when the view pans or zooms.

The minimap renders a scaled-down rectangle per visible panel plus a viewport
indicator, all derived from the same `PanelState[]` and `view` values.

---

## Enter/exit animation

`Modal` uses `framer-motion`'s `AnimatePresence` for a 0.18–0.26 s fade/scale
enter and exit. Panels animate in once on mount (`initial` → `animate`). The
graph and stream intentionally animate *forever* — the rest of the interface
settles, which is what makes the live instruments read as live.
