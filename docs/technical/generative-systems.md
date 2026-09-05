# Generative systems

The engine room. Everything the interface displays is produced here, from a
seeded PRNG and a set of hand-written corpora. This document explains the
machinery precisely enough to extend it.

---

## The RNG — `lib/rng.ts`

`mulberry32` is a small, fast, non-cryptographic PRNG. It is **not** used for
anything security-adjacent; it is used because it is tiny, deterministic, and
statistically adequate for content generation.

```ts
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

Combinators:

- `pick(rng, arr)` — uniform index.
- `pickN(rng, arr, n)` — n unique elements (Fisher–Yates style pool splice).
- `between(rng, lo, hi)` — uniform float in `[lo, hi)`.

`Rng` is the exported function type; every generator accepts an `Rng` so tests
can inject a known seed.

---

## The corpora — `lib/banks.ts`

| Bank | Size | Example entries |
| --- | --- | --- |
| `DOMAINS` | 15 | Cognitive Architecture, Memetics, Topology of Belief, Resonance Engineering… |
| `DOMAIN_COLORS` | 15 | one hex per domain — the graph's per-domain hue |
| `ADJ` | 40 | Recursive, Hyperstitional, Stigmergic, Paraconsistent… |
| `CONCEPT_NOUNS` | 34 | Attractors, Manifolds, Substrates, Fugues… |
| `PHENOMENA` | 28 | Belief, Attention, Meaning, Boundary… |
| `TAG_POOL` | 29 | load-bearing, deprecated, leakage, hermeneutic… |
| `VERBS` | 20 | dissolve, phase-lock, redshift, entangle… |

The corpora are the actual artwork: they were written, not mined. The grammar
that composes them is deliberately mechanical, which is the stylistic joke — a
very specific vocabulary assembled by a very generic procedure.

---

## Template composition

Notes and visions are produced by **interpolation templates**, not by a model.

```ts
// lib/generate.ts — one of eight title templates
(_r, a, n, _d, p) => `On the ${a} ${n} of ${p}`,

// one of eight content templates
(_r, n, a, _d, p, v) =>
  `Forget causality. In ${d}, ${n} and ${p} ${v} each other into being — ` +
  `a ${a} reciprocity where neither is prior. The observer is the remainder.`,
```

Each template is a function of the sampled words. The number of distinct notes
is bounded by the combinatorics of banks × templates × domains, which is
enormous in principle but **fixed in practice** by the seed — the vault is the
same 327 notes every visit.

---

## The vision generator — `lib/vision.ts`

`VisionGenerator` is a class wrapping a counter and an `Rng`:

```ts
export class VisionGenerator {
  private rng: Rng;
  private counter = 0;
  constructor(seed = 20240517) { this.rng = mulberry32(seed); }
  next() {
    this.counter += 1;
    return { id: this.counter, ...makeVision(this.rng), ts: Date.now() };
  }
}
```

The component holds one instance in `useState(() => new VisionGenerator())` so
the counter survives re-renders, and the 30 ms ticker types each fragment out
character by character, commits it to the feed (last 14), and requests the next.

---

## Synthesis — `lib/vision.ts · synthesize()`

`IdeaSynthesis` picks two concept labels and calls `synthesize(a, b, seed)`.
Five templates produce a title and description that embed both operands:

- `a x b` (hybrid operator)
- `a Reflected Through b` (second-order structure)
- `The a-b Recursion` (fixed-point anneal)
- `b as the Limit Case of a` (diagnostic torsion)
- `Counterpoise: a // b` (productive tension)

Scores (novelty/coherence/resonance) are rolled from the seed. This is the only
generator whose seed comes from `Math.random()`, because the forge is presented
as a live act — the user's own synthesis is *supposed* to be unrepeatable, in
contrast to the rest of the OS.

---

## Palettes — `lib/generate.ts`

`generatePalette(seed)` picks a base hue, then applies fixed hue offsets
`[0, 30, 60, 180, 210, 300]` with jitter, rolling saturation (55–90) and
lightness (30–75), and converts to hex. The offsets guarantee an internally
consistent scheme regardless of base hue. `HexLab` layers per-swatch locking on
top: a locked swatch survives the next regeneration.

---

## Extending the system

To add a new instrument that *generates content*, follow the existing shape:

1. Add vocabulary to `lib/banks.ts` (or a new bank file).
2. Write a pure generator that takes an `Rng` and returns typed data.
3. Export it from `lib/generate.ts` (or a sibling module).
4. Add unit tests asserting determinism, bounds, and structure.
5. Wire it into a panel component.

Keep generators pure and seeded; keep `Math.random()` for genuinely one-off acts
(the synthesis forge) and wall-clock values (`Date.now()` for timestamps).
