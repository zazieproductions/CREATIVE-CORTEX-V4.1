# Roadmap

Directions are separated into **Near-term** (realistic, grounded in the current
architecture), **Experimental** (more ambitious creative possibilities), and
**Research directions** (unusual ideas worth exploring, not commitments).
Nothing here is a promise; this is a map of the space around the work.

---

## Near-term

Grounded in the current React/SVG/seeded-RNG architecture.

- **Persistence** — save panel layout, committed notes, and palettes to
  `localStorage` (or an export/import JSON file). The single highest-leverage
  improvement: it turns the instrument from a one-shot into something with a
  memory of *the user* as distinct from its seeded memory.
- **User presets** — named layout presets ("lab", "writing", "surveillance")
  alongside reset.
- **Graph keyboard access** — per-node focus via tab/arrow keys and a
  searchable node list, closing the current pointer-only gap.
- **Note detail from every surface** — deep-link a note by id in the URL hash so
  a single note can be shared.
- **Palette export** — copy a palette as CSS variables / Tailwind theme /
  JSON.
- **Scheme status controls** — let the user advance a scheme's phase/status for
  the theatre of the thing.

## Experimental

More ambitious, still feasible on the current stack.

- **WebAudio / AudioWorklets** — an actual audio engine to match the visual
  "signal" language: map graph node activity to a generative FM/granular voice,
  let pulses trigger percussive events. The OS currently *performs* listening;
  it could actually listen.
- **Generative sequencing** — a step sequencer driven by the activity series or
  the graph's pulse traffic.
- **Spatial audio** — pan audio across the stage; a node's screen position maps
  to a spatial position.
- **Shader systems** — port the Neural Atlas (and the `Resonance Coupling
  Shader` sketch) to WebGL for thousands of nodes; the graph becomes a field.
- **Patch systems** — a node-graph editor that wires instruments to each other
  (vision stream → synthesis → palette → audio).
- **Downloadable output** — render the current state (or a session) to a poster,
  an SVG, a JSON snapshot, or a WAV.
- **Offline rendering** — headless capture at very high resolution for print.

## Research directions

Unusual, low-commitment, high-friction ideas.

- **MIDI / OSC / WebMIDI** — the OS as a controller for external instruments,
  or controlled by them; a physical drum pad drives the graph.
- **Live performance modes** — a full-screen, mouse-free "performance" view
  where the OS plays itself.
- **Sensors** — device motion/light sensors as generative inputs (the
  "phenomena" bank already names the vocabulary).
- **Procedural states** — treat the *interface itself* as the generated object:
  seed a whole OS instance, not just its contents.
- **Multi-seed exploration** — a "seed browser" that lets the visitor step
  through adjacent minds (seed ± 1) and watch the vault re-write itself.
- **Persistent collective memory** — a shared, opt-in, write-only "communal
  vault" where committed notes from all visitors accumulate (the fiction's
  "collective unconscious" made literal — and a real moderation question).

## Principles for choosing what to build

1. Extend the premise — every feature should make the "operating system for a
   mind" fiction *more* convincing or *more* unsettling.
2. Prefer systems over content — a generator that produces ten thousand schemes
   is more interesting than ten more hand-written schemes.
3. Keep it static — the project's zero-backend nature is a feature; adding a
   server is a decision to make loudly, not incidentally.
