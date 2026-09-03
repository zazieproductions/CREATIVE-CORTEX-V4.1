# Generative layer

Everything NEXUS "knows" is synthesized at boot by pure functions in `src/lib`. The layer has two inputs — a fixed vocabulary (`banks.ts`) and a fixed set of seeds (`config.ts`) — and one property above all: **determinism**. `generateNotes()` called twice returns deep-equal output; CI, screenshots, and the deployed site all see the identical corpus.

## The PRNG

`rng.ts` implements mulberry32, a small fast seeded PRNG, plus `pick`, `pickN` (sample without replacement), and `between`. Every subsystem constructs its own stream from its own seed so streams never alias.

## Notes (`notes.ts`)

For each of `NOTE_COUNT` (327) notes: choose domain → choose one of that domain's concepts → choose adjective/noun/phenomenon/verb → format a title (8 templates) and a body (8 templates) → draw tags → timestamp backwards from a fixed epoch → score coherence/resonance/novelty in documented ranges. Then a second pass wires links: 2–4 same-domain plus, with p=0.4, 1–2 cross-domain. Result: a connected-but-clustered corpus whose link graph is what the Vault and NoteDetail render as outgoing links / backlinks.

## Concepts (`concepts.ts`)

45 nodes: 3 curated concepts per domain, placed on a ring of domain clusters. Edges: each domain's three nodes form a triangle (weight ~1.6/0.9); 26 random cross-domain bridges; and a 6-hub long-range ring. This gives the atlas its "neural" silhouette: dense clusters threaded by faint bridges.

## Vision (`vision.ts`)

Two generators:
- `makeVision` picks among fragment-fragment compounds, curated single lines, or a synthesized adjective/noun/domain sentence.
- `synthesize(a, b, seed)` combines two concept labels through 5 rhetorical templates and scores novelty/coherence/resonance — this is the Idea Synthesis forge.

## Analytics, palettes, schemes, prototypes

- `analytics.ts`: bounded random-walk activity series (64 samples, clamped 8..98), radar and velocity per domain. Decorative but seeded.
- `palettes.ts`: HSL arithmetic around a base hue with scheme offsets; local `hslToHex`.
- `schemes.ts`, `prototypes.ts`: curated, hand-written — the authored voice of the work.

## Extending it

Add vocabulary in `banks.ts`, templates in the relevant module, and invariants in `tests/generate.test.ts`. Change a seed in `config.ts` and the whole corpus shifts — review the diff; the tests will still pass but the artefact is different.
