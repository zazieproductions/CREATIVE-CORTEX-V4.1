# Roadmap

Distinguishes realistic near-term work from experimental and research directions. Nothing here is a commitment; it is a map of intent.

## Near-term

Realistic, architecture-compatible improvements.

- **`prefers-reduced-motion`**: pause the idle jitter/pulses/typist when the OS preference is set; keep the instrument legible when still.
- **Accessibility pass**: focus management for panels/modals, ARIA labels for the stage and atlas, an atlas that is navigable by keyboard.
- **Canvas atlas option**: move the force simulation to `<canvas>` behind a flag to cut per-frame React reconciliation on low-end GPUs.
- **Wider keyboard surface**: panel focus/hide/expand shortcuts beyond the palette.
- **Code-split modals** to trim initial JS.

## Experimental

More ambitious creative possibilities that fit the current system.

- **Persistence of the committed**: serialize forge-committed notes to `localStorage` behind an explicit "remember me" toggle, without breaking default determinism.
- **User seeds**: a seed field that regenerates the whole corpus live, making determinism a control rather than a constant.
- **Audio layer**: a WebAudio drone/sonification driven by the same activity series that feeds the UI — the OS gains a voice, still no network.
- **Offline export**: render the current corpus to a downloadable JSON/Markdown "field manual".
- **Patch/preset system**: save and recall panel layouts as named patches.

## Research directions

Unusual ideas worth exploring; not implied features.

- **AudioWorklet-driven cortex**: replace the seeded activity series with a real analysis of the audio layer, closing the loop between sound and instrument.
- **Shader substrate**: a fragment-shader background (the existing `Resonance Coupling Shader` prototype promoted to the stage) for volumetric decay.
- **Spatial audio**: position each domain cluster in a stereo field so the atlas is audible as well as visible.
- **Sensors / live performance mode**: drive jitter and velocity from microphone or MIDI for stage use.
- **Generative sequencing**: let the vision stream's grammar evolve via a simple L-system so the voice drifts over a session.
- **Multi-mind**: two seeded corpora in counterpoint, rendered as interfering fields.
