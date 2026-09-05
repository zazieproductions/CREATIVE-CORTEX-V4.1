# State model

There is no store, no context, and no reducer in NEXUS//OS. State is lifted to
`App` and passed down as props; the few genuinely local states live in the
components that own their behaviour. This document is the map of who owns what
and how it changes.

---

## Ownership map

```
App.tsx
├── notes: Note[]                 (lazy init: generateNotes())
├── panels: PanelState[]          (lazy init: DEFAULT_PANELS)
├── raisedId: string | null       ('neural' initially)
├── focusTarget: string | null
├── focusNonce: number
├── expanded: string | null       (modal: expanded panel id)
├── selectedNote: Note | null     (modal)
├── selectedProto: CodeProto|null (modal)
├── paletteOpen: boolean
└── visionIndex: number           (67 initially)

Workspace.tsx
├── vp: { w, h }                  (ResizeObserver)
├── view: { pan, scale }          (pan/zoom)
├── panning: boolean              (cursor state)
├── handledNonce: number          (focus centring dedup)
└── panRef: {…}                   (pointer gesture working set)

Panel.tsx
├── mode: 'none' | 'drag' | 'resize'
├── drag: {…} / rsize: {…}        (refs)

NeuralGraph.tsx
├── nodesRef / pulsesRef / dragRef (physics working set)
├── nodes / pulses                 (per-frame snapshot)
├── selectedId: string | null
└── hover: string | null

VisionStream.tsx
├── gen: VisionGenerator          (state — survives re-renders)
├── feed: VisionEntry[]           (last 14)
├── typed: string                 (partial text being typed)
└── targetRef: VisionEntry | null (current entry)

CommandPalette.tsx
├── q: string
└── active: number
```

---

## How App's panel callbacks work

All layout mutations funnel through four pure setters in `App`:

| Callback | Effect |
| --- | --- |
| `movePanel(id, x, y)` | map-replace that panel's `x/y` |
| `resizePanel(id, w, h)` | map-replace `w/h` |
| `hidePanel(id)` | set `visible: false` |
| `togglePanel(id)` | flip `visible` |
| `focusPanel(id)` | show + raise + set `focusTarget` + bump `focusNonce` |
| `resetLayout()` | restore `DEFAULT_PANELS`, raise `neural` |

`movePanel`/`resizePanel` are called during drag at pointer granularity; `Panel`
snaps positions to an 8 px grid by rounding before it calls back up.

---

## The focus/zoom handshake

Focusing a module has two observable consequences: the panel becomes visible
and raised, **and** the stage centres on it. The centring is handled in
`Workspace` using the "adjust state during render" pattern:

1. `App.focusPanel` sets `focusTarget` and increments `focusNonce`.
2. `Workspace` renders; it sees `focusNonce !== handledNonce`.
3. It computes the centred `pan` from the target panel's centre, the current
   scale, and the viewport size, calls `setView`, and records
   `setHandledNonce(focusNonce)`.

Because it runs during render (not in an effect), re-focusing the *same* module
re-centres it every time, and there is no cascade of effects. A `ResizeObserver`
re-clamps `pan` inside the resize callback so a window resize can never leave the
stage unreachable.

---

## Local state and why it stays local

- **Panel drag/resize mode** is local because it is transient gesture state.
- **NeuralGraph selection/hover** is local because no other module consumes it.
- **VisionStream feed** is local because nothing else reads the fragments.
- **Palette query/active index** is local because the palette is the only
  consumer of its own search.

The one piece of instrument state that *does* escape upward is the vision
counter: `VisionStream` calls `onNew()` (App's `bumpVision`) each time an entry
completes, which nudges `visionIndex` — a deliberately fake telemetry value that
the OS bar and Analytics both display, closing the loop between a module and the
"system" that appears to observe it.

---

## Purity rules in practice

`eslint-plugin-react-hooks` v7 enforces compiler-oriented rules. The codebase
complies with these conventions:

- No reading `ref.current` during render (the graph uses the snapshot pattern).
- No synchronous `setState` in an effect body (viewport clamping lives in the
  ResizeObserver callback; focus centring runs during render).
- `Date.now()` is sampled into state on a timer (Analytics' entropy gauge),
  never called during render.

These rules are load-bearing: they keep the animation loop and the React render
cycle from fighting each other.
