# Data flow

How a handful of seeds and word banks become the 327-note vault, the knowledge
graph, the metrics, and the schemes. There is no network and no persistence:
this is the entire data story, and it is fully deterministic.

---

## The pipeline

```
seeds ──► mulberry32 ──► pick / pickN / between ──► generators ──► UI state
        (1337, 20240517, 7, 99, 42, 20240517)
```

`mulberry32(seed)` returns a closure holding a 32-bit state; every call advances
it and returns a float in `[0, 1)`. `pick`, `pickN` (without replacement), and
`between` are the only three combinators. Everything else is composition.

---

## 1. Concept graph — `lib/concepts.ts`

- **Seeds:** `20240517` (node jitter), hard-coded layout.
- **Input:** 15 domains × 3 hand-written node labels (`RAW`).
- **Placement:** domains are laid out on an ellipse (radius 360×240 around the
  1080×720 canvas centre); the 3 nodes of each domain orbit their domain's
  centre point with a small seeded jitter.
- **Edges:** a triangle + one extra edge per domain (weighted 1.6 / 0.9), 26
  seeded cross-domain bridges (weight 0.4–0.8, `bridge: true`), and 6 long-range
  "hub" bridges.
- **Output:** `CONCEPTS` (45 nodes), `EDGES` (92 edges), exported once at module
  load.

## 2. Field notes — `lib/generate.ts · generateNotes()`

- **Seed:** `1337`.
- **Composition:** for each of 327 notes — pick a domain, a concept from that
  domain, an adjective, a noun, a phenomenon, a verb; choose a title template
  (8) and a content template (8) and interpolate; sample 2–4 tags plus a
  concept-derived tag; roll coherence (41–99), resonance (20–98), novelty
  (12–97); stamp a creation date within the last 60 days of a fixed epoch.
- **Links:** each note links 2–4 same-domain notes, and 40% of notes also link
  1–2 cross-domain notes.
- **Output:** `Note[]`, ids `N-0001`…`N-0327`, first five pinned.

## 3. Vision stream — `lib/vision.ts`

- **Seed:** `20240517`.
- **Grammar:** three fragment sets. ~50% of entries combine an A-fragment with a
  B-fragment ("The map is not the territory **so we must treat every structure
  as a loan from the future**"); ~28% use a standalone C-fragment (aphorisms);
  the remainder build a compound from the shared word banks. 1–2 tags per entry.
- **Output:** `VisionGenerator.next()` → `{ id, text, tags, ts }`, the `id` a
  session counter, `ts` wall-clock.

## 4. Idea synthesis — `lib/vision.ts · synthesize(a, b, seed)`

- **Seed:** `Math.floor(Math.random() * 1e9)` per forge — the one intentionally
  *non*-deterministic generator, because the act is presented as a live forge.
- **Composition:** 5 templates, each embedding both operand labels; scores
  novelty 40–98, coherence 35–94, resonance 30–93; 2 tags.
- **Commit:** `IdeaSynthesis` wraps the result as a `Note` with domain
  `Synthesis` and prepends it to the vault in `App`.

## 5. Schemes, code prototypes, palettes — `lib/generate.ts`

- **SCHEMES / CODE_PROTOS:** fully hand-authored constants — six schemes, six
  sketches. These are the curated fiction the rest of the system is generated
  around.
- **Palettes:** `generatePalette(seed)` rolls a base hue and builds 6 swatches
  on a fixed hue-offset scheme (`[0, 30, 60, 180, 210, 300]`), converting HSL→
  hex. Three `SEED_PALETTES` are hand-tuned brand palettes.

## 6. Analytics series — `lib/generate.ts`

- **Activity** (seed 7): 64 samples, random walk with sine drift, clamped 8–98.
- **Domain radar** (seed 99): one value per domain, 35–96.
- **Velocity** (seed 42): one value per domain, 12–60.

---

## Determinism and its consequences

1. **Reproducible tests.** The unit suite asserts exact lengths, id sequences,
   bounds, and equality across two calls with the same seed.
2. **Stable "world".** Every visitor sees the same fake knowledge graph, the
   same 327 notes. The OS's claim to be a mind with a memory is undercut by the
   fact that the memory is a function of the seed — which is the intended
   comment on "deterministic" AI outputs.
3. **No loading states.** Generation is synchronous and fast enough (~a few ms
   for 327 notes) to run inside the initial `useState` lazy initialiser, so the
   interface never renders an empty vault.
