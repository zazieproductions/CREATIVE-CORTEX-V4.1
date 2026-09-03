/**
 * Central configuration for NEXUS's generative layer.
 *
 * The whole interface is derived from a handful of fixed seeds so that every
 * reload (and every screenshot, CI run, and deployment) produces an identical
 * artefact. Those seeds and the corpus sizes live here so they are auditable in
 * one place instead of being scattered magic numbers.
 *
 * Changing a seed or a count is a *content* change: the downstream tests in
 * `tests/generate.test.ts` assert the invariants of the generated corpus, so a
 * deliberate re-seed surfaces as a reviewable diff rather than a silent drift.
 */

/** Number of field notes synthesised into the vault. Surfaces in the UI copy. */
export const NOTE_COUNT = 327;

/**
 * Deterministic seeds. Each generator below names its own seed so that two
 * subsystems never accidentally share a stream.
 */
export const SEEDS = {
  /** Concept atlas layout + cross-domain bridges (lib/concepts.ts). */
  concepts: 20240517,
  /** Field-note corpus: titles, content, links, scores (lib/notes.ts). */
  notes: 1337,
  /** Aphorism / vision stream (lib/vision.ts). */
  vision: 20240517,
  /** Cortical activity series (lib/analytics.ts). */
  activity: 7,
  /** Domain coherence radar (lib/analytics.ts). */
  radar: 99,
  /** Idea-velocity bars (lib/analytics.ts). */
  velocity: 42,
} as const;

/**
 * Neural-atlas force constants. Extracted from `NeuralGraph` so the physics is
 * documented and tunable without editing the render loop.
 */
export const FORCE = {
  /** Coulomb-style pairwise repulsion. */
  repulsion: 1500,
  /** Hooke-style spring stiffness. */
  spring: 0.014,
  /** Ideal spring rest length. */
  restLength: 158,
  /** Velocity damping per frame. */
  damping: 0.85,
  /** Weak pull toward the viewBox centre. */
  centering: 0.0006,
  /** Per-frame stochastic jitter that keeps the field from fully settling. */
  jitter: 0.06,
} as const;

/** Workspace stage extents (logical units), shared by Workspace + Minimap. */
export const STAGE = {
  width: 2360,
  height: 1180,
} as const;

/** Camera clamp values for the pan/zoom stage. */
export const CAMERA = {
  minZoom: 0.45,
  maxZoom: 1.5,
} as const;
