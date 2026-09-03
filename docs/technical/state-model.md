# State model

NEXUS separates state by lifetime and blast radius into three tiers.

## Tier 1 — shared source of truth (`App`)

- `notes`: the base 327-note corpus plus any notes committed from the forge. Read by Vault, Atlas inspector, Analytics, and the command palette; written only by `commitNote`.
- `panels`: layout records `{id,x,y,w,h,visible}`. Written by move/resize/hide/toggle/reset.
- Ephemeral UI: `raisedId`, `focusTarget`, `expanded`, `selectedNote`, `selectedProto`, `paletteOpen`, `visionIndex`.

Because several modules read `notes` and `panels`, they live at the top; everything else stays local.

## Tier 2 — local widget state

- `Workspace`: camera + `panning` flag.
- `VisionStream`: typed text + feed.
- `HexLab`: current palette + locks + copied index.
- `IdeaSynthesis`: operands, result, history, committed titles.
- `CommandPalette`: query + active row.

These never escape their component; parents coordinate via callbacks.

## Tier 3 — mutable simulation (refs)

- `NeuralGraph`: node positions/velocities, pulses, drag id, node Map. Rendered via a tick counter.

## Data down, events up

Children receive data via props and report intent via semantic callbacks (`onMove`, `onOpenNote`, `onCommit`, …). Raw pointer coordinates never reach `App`; only the resulting semantic change does. This keeps `App` readable and the modules reusable in isolation.

## Immutability & mutation

Generated corpora are treated as immutable after boot (the exception being note `links`, built during generation). Atlas nodes mutate in place by design (tier 3). `notes` and `panels` are updated immutably (new arrays) so React change-detection is trivial.
