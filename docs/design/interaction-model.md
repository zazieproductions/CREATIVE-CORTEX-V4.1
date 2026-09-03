# Interaction model

How agency is distributed between the user and the machine.

## Two cameras, two worlds

The stage is a world you fly over (pan/zoom/minimap); each panel is a world you manipulate directly (drag/resize/expand). The model keeps these distinct: empty-space gestures move the camera; gestures that begin on a panel act on that panel; gestures on atlas nodes act on the simulation. Pointer-capture and `stopPropagation` boundaries enforce the layering.

## Direct manipulation first

Everything important is grabbable: panels by their header, nodes by their body, the stage by its backdrop, the minimap to teleport. There are no nested menus; the only overlay chrome is the command palette (`⌘K`) and modals.

## The palette as the universal verb

`⌘K` searches notes, concepts, and schemes in one list with arrow/enter/esc. It is the fastest path between the three corpora and the reason the OS feels navigable despite its density.

## Commit as the only mutation

The user cannot edit the corpus; the sole write is the forge's **commit to vault**, which appends a synthesized note. This asymmetry is deliberate: NEXUS is a mind you observe and occasionally feed, not a document you edit.

## Feedback & liveness

Live elements advertise themselves with `pulse-glow`/blink; selection raises z-order and lights adjacent edges; hover previews labels. The machine never blocks — every control responds immediately, and long operations (forge) show a brief deterministic "forging…" state.

## Keyboard

- `⌘K`/`Ctrl+K` palette · arrows navigate · `Enter` open · `Esc` close.
- `Ctrl+wheel` zoom.
That is the whole keyboard surface today; widening it is on the ROADMAP.
