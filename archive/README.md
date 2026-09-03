# Archive — generation-harness provenance

This directory preserves, verbatim and *non-shipping*, the tooling that was injected into the original workspace export. It is kept so the repository's history is legible: what was generated, what was harness, and what was excised when the project was archived into its canonical form.

Nothing in `archive/` is referenced by the application, the build, or the docs. It is evidence, not code.

## Contents

- `harness/vite-source-tags.js` — a Vite transform that stamped every JSX element with `data-source-loc="file:line:col"` so an external element-picker could map DOM nodes back to source. In the export it ran in **production**, injecting 459 attributes into the shipped bundle. Removed from the build pipeline; preserved here for reference.
- `harness/element-picker.js.txt` — the injected in-page inspector/editor (inspect + inline edit modes, driven by `postMessage`).
- `harness/session-recorder.js.txt` — an injected rrweb session recorder that captured clicks/cursor/scrolls into `sessionStorage`.
- `harness/page-view-beacon.js.txt` — an injected telemetry beacon that POSTed a page-view (including a model/tournament identifier) to an external host on every load.

## Why it was removed

1. **Provenance leak.** The beacon and recorder identified the generation tournament/model and phoned home; that is harness metadata, not part of the artwork, and it should never ship to an audience.
2. **Production pollution.** The source-tags transform bloated the shipped DOM and tied the artefact to a development toolchain.
3. **Integrity.** A canonical archive should contain the work and its own tooling; third-party harness instrumentation belongs in the record (here) but not in the runtime.

If you are auditing the repository, the diffs that removed these live alongside this directory's introduction; the runtime entry point (`index.html`) now contains only the application script.
