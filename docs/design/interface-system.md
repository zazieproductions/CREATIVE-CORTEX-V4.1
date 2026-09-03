# Interface system

NEXUS//OS is not a page; it is a **stage**. The core interface decision is that
the application presents itself as a desktop operating system with a pannable,
zoomable workspace, and the user operates it the way one operates a machine.

---

## The stage

- Fixed logical size: **2360 × 1180** (`STAGE_W` / `STAGE_H` in
  `lib/layout.ts`).
- The visible area (`Workspace`) is a viewport onto the stage; the view is a
  `{pan, scale}` transform applied to a single stage div.
- Zoom is clamped to **45%–150%**; pan is clamped so the view never leaves the
  stage.

The stage exists because an *operating system* must feel larger than the screen.
The user's first act is often to pan or zoom — which immediately frames the
piece as something to be navigated, not scrolled.

## Panels (windows)

Eight modules are windows on the stage, each defined by a `PANEL_META` entry
(id, title, subtitle, accent colour, icon) and a default `PanelState` (position,
size, visibility). Windows support:

- **Move** by header drag (8 px grid snap).
- **Resize** by corner drag (min 280×200).
- **Raise** on pointer-down; z-index 60 for the raised window vs 20 for the rest.
- **Expand** into a modal (full-height detail view).
- **Hide** and re-show via the sidebar.

The window chrome — a 1-px hairline border tinted by the module's accent, a
gradient-tinted header, icon + title + subtitle, grip/expand/close controls —
is uniform across modules, which is what makes eight very different instruments
read as one system.

## Sidebar

The left rail (`w-56`) lists all modules with their accent colour and icon. It
is simultaneously navigation and legend: each entry's accent matches its
window's border and its graph/chart colour, so the sidebar teaches the colour
language of the OS. Below the module list, a "system" block shows live counts
(notes, nodes, synapses, schemes) and a **reset layout** control.

## Command palette

`Ctrl/⌘+K` opens a search surface over the whole "knowledge base": 327 notes,
45 concepts, and 6 schemes are merged into one ranked-by-source list with
keyboard navigation (↑/↓/Enter) and fuzzy substring filtering. It is the
fastest path to any object in the system and doubles as the app's accessibility
story.

## Minimap

Bottom-right, the minimap draws every visible window as a tinted rectangle and
the current viewport as a white outline. Clicking it recentres the view. It
matters because at 45% zoom the stage is genuinely large; the minimap is the
only way to see the whole thing at once.

## Zoom controls & OS bar

A floating control cluster (zoom in/out, percentage readout, fit) sits
bottom-left. The top **OS bar** carries the brand, a fake "online" status pill,
four live metric chips (neural activity + sparkline, idea velocity, vision
index, vault count), and a session clock — the instrument's self-reporting.

---

## Hierarchy of attention

1. **Accent colour** is the loudest signal — it marks *which* system you are in.
2. **Brightness** (ink vs ink-dim vs ink-faint) marks importance within a window.
3. **Monospace** marks data; **display serif-adjacent grotesque** marks identity.
4. **Motion** marks the live systems (graph, stream, pulses) against the settled
   chrome.

The result is that the interface reads as a machine humming in a dark room: most
of it is still, and the moving parts are exactly the parts that claim to be
alive.
