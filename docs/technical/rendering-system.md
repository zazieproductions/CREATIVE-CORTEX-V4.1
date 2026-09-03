# Rendering system

How pixels get on screen, and why.

## The camera

`Workspace` owns a camera `{ pan: {x,y}, scale }`. The stage (logical `STAGE.width × STAGE.height`) is a single absolutely-positioned div transformed with `translate(pan) scale(scale)` and `transform-origin: top-left`. Everything on the stage inherits that transform, so panning/zooming is one GPU-friendly property change.

- **Pan** is a pointer-capture drag on the backdrop; the delta is added to `pan` and clamped by `clampPan` so the stage can never be flung fully off-screen.
- **Zoom** is `Ctrl+wheel` (zoom-at-cursor) or the `+ / − / fit` controls. `zoomAt` keeps the world point under the cursor fixed by converting screen→world before and after the scale change.
- **Fit** derives `scale = clamp(min(vw/W, vh/H) * 0.96)` and centers.

Clamps live in `CAMERA` (`src/lib/config.ts`).

## Panels

Each `Panel` is absolutely positioned at its layout `x/y/w/h`. Drag uses pointer capture on the header with 8px snapping; resize on a corner grip with minimums (`280×200`). `framer-motion` supplies only mount transitions (fade/scale), not continuous layout animation — continuous layout is plain CSS so it stays cheap.

Z-order: raised panel gets `z=60`, others `z=20`, chrome above, modals above that.

## The atlas (force simulation)

`NeuralGraph` runs a rAF loop:

1. damping (`FORCE.damping`),
2. pairwise repulsion (`FORCE.repulsion / d²`),
3. spring attraction toward `FORCE.restLength` weighted by edge weight,
4. weak centering (`FORCE.centering`) and stochastic jitter (`FORCE.jitter`) so the field never fully settles,
5. integration with bounds clamping.

Node positions/velocities live in refs; a tick counter (`setTick`) re-renders the SVG once per frame. Node lookup for the edge pass is a `Map` rebuilt only when the array is replaced (`recenter`), making the spring pass O(E) instead of O(E·N).

Pulses are decorative particles that travel along random edges; their `t` advances per frame and wraps.

SVG coordinate mapping for dragging uses `svg.createSVGPoint()` + `getScreenCTM().inverse()` so drags are correct under any camera zoom and viewBox scaling.

## Why refs + tick

React state at 60fps for 45 nodes would allocate and reconcile constantly. Holding the simulation in refs and forcing a single render per frame is the standard canvas/RAF pattern adapted to SVG. The trade-off is that the newest `react-hooks` compiler rules flag ref reads during render; we document that relaxation in `eslint.config.js` rather than distort the simulation.

## Glass

`.glass` / `.glass-strong` (src/styles/base.css) use layered gradients + `backdrop-filter: blur()`. This is the signature material and the main GPU cost; it is confined to panel/modal surfaces, not the whole stage.
