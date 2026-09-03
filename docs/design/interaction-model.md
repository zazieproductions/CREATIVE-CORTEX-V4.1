# Interaction model

How the piece is *operated*, and what the operation means. This is a document
about both the mechanics and the gesture language.

---

## Two modes of engagement

NEXUS//OS offers two distinct stances, and the shift between them is the piece's
core interaction:

1. **Operator** — the user drives the machine: opens windows, searches the
   vault, drags nodes, forges concepts. Agency is explicit and mechanical.
2. **Observer** — the user watches the machine drive itself: the graph relaxes,
   the stream types, the activity chart breathes. Agency is withdrawn; the OS
   performs cognition without a cognizer.

Most of the interface alternates between these without announcing it. The
vision stream never stops; the user can always interrupt it by grabbing a node
or opening the palette — and always return to watching.

---

## The gesture set

| Gesture | Target | Result | Feedback |
| --- | --- | --- | --- |
| drag | panel header | move (8 px grid) | window re-raises, accent glow |
| drag | panel corner | resize | live geometry |
| drag | empty stage | pan | cursor → grabbing |
| `Ctrl/⌘`+wheel | stage | zoom at cursor | scale % readout |
| drag | graph node | pin node | physics reacts around it |
| click | graph node | select | inspector + neighbour highlight |
| double-click | graph | recentre | nodes re-seed |
| click | minimap | jump view | viewport rect moves |
| `Ctrl/⌘`+K | anywhere | palette | overlay + focus |
| type | palette input | filter 360+ objects | count updates live |
| ↑↓ / Enter | palette | select / open | note modal or panel focus |

Gestures are implemented with Pointer Events and `setPointerCapture`, so a drag
keeps tracking the pointer outside the element. There is no click-vs-drag
threshold: a node "click" is a pointer-down (which begins a potential drag),
and selection happens on down — the natural, immediate feel of an instrument
rather than a form.

## Feedback loops (the intentional ones)

The piece is threaded with small feedback loops between a module and the
"system" that appears to observe it:

- **Vision stream → vision index.** Each completed fragment bumps `visionIndex`,
  displayed in the OS bar and the analytics gauges. The stream's output changes
  the OS's *own* telemetry.
- **Synthesis → vault → counts.** Committing a synthesized note grows the vault
  count in the OS bar and the sidebar, and the note becomes searchable.
- **Node selection → linked notes.** Selecting a concept surfaces the field
  notes *about* that concept — the graph and the prose are two views of the same
  data.
- **Palette locks → regeneration.** Locking a swatch preserves it across
  regenerations, turning a random generator into a curatorial tool.

These loops are what make the OS feel like it *runs* even though nothing is
"running" in any backend sense: every displayed change has a visible cause
inside the interface.

## User agency vs. the machine

The tension is by design. The user can drag every node into any configuration,
then double-click and watch the machine's own physics undo it. The user can
forge a concept, but the template decides what the forge says. The user can
search the vault, but the vault was written by a seed. The interface gives
generous, real agency over *arrangement* while withholding it over *content* —
a precise, if wry, model of how "AI" products actually distribute control.

## Intentional instability

- The graph never fully settles: a per-frame jitter term keeps it faintly alive.
- The entropy gauge oscillates with the wall clock, refusing a stable reading.
- The vision stream's fragments are grammatically plausible and semantically
  unmoored; they feel like signals that do not quite resolve.

None of this is a bug; it is the machine's performance of consciousness as
*persistent slight instability*.
