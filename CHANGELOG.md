# Changelog

All notable changes to NEXUS//OS are recorded here. The project uses a
single-stream format (no strict SemVer ceremony) because the "v4.1" in the
title is part of the fiction as much as the versioning.

---

## [4.1.0] — repository archival & portfolio release

This release is the *archive* of the work rather than a feature release: the
code is unchanged in behaviour, and the repository around it was rebuilt into a
maintainable, documented project.

### Added

- `README.md` — full orientation: overview, controls, architecture map,
  screenshots, install/develop/build/deploy, design and concept links.
- `ARCHITECTURE.md` — system design with Mermaid diagrams (component map,
  focus/zoom sequence, rendering loop, data pipeline, build/deploy pipeline).
- `docs/technical/` — rendering system, state model, data flow, generative
  systems, performance model.
- `docs/design/` — interface system, visual language, interaction model.
- `docs/concept.md` — the artistic intent and computational aesthetics.
- `docs/development/` — setup, debugging, deployment.
- `CONTRIBUTING.md`, `SECURITY.md`, `ROADMAP.md`.
- Unit test suite (Vitest, 31 tests) covering the deterministic core: RNG,
  note generation, knowledge graph, vision generator, synthesis, palettes,
  analytics series.
- CI workflow (`.github/workflows/ci.yml`): install → typecheck → lint → test →
  build.
- GitHub Pages deployment workflow
  (`.github/workflows/deploy-pages.yml`) and deployment documentation.
- Screenshot pipeline (`scripts/capture-screenshots.mjs`,
  `npm run capture:screenshots`) producing real 1440×900 captures and the
  1280×640 social card.
- Self-hosted fonts (`@fontsource/space-grotesk`, `@fontsource/jetbrains-mono`),
  removing the Google Fonts runtime dependency.
- Missing brand assets: `public/favicon.svg`, `public/atlas-bg.svg`,
  `public/og-cover.png`.
- `npm run typecheck`, `npm run check`, and the `test`/`test:watch` scripts.

### Changed

- `package.json` — real name (`creative-cortex`), version 4.1.0, description,
  repository/author/keywords metadata, `engines`, expanded scripts.
- `vite.config.ts` — simplified to `base: './'` for sub-path deployment;
  removed the optional `.vite-source-tags.js` import (export tooling).
- `index.html` — rebuilt: title/description/OpenGraph/Twitter meta, relative
  favicon, and removal of the DesignArena export instrumentation scripts
  (rrweb session recording, page-view beacon, element picker).
- `src/` refactors to satisfy the React hooks/compiler lint rules:
  - `NeuralGraph` — physics working set in refs + per-frame state snapshot;
    selection by id.
  - `Workspace` — event-driven viewport clamp; render-time focus centring via
    a `focusNonce`; cursor state instead of a ref read during render.
  - `VisionStream` — generator held in state.
  - `Analytics` — wall-clock entropy sampled on a timer.
  - `CommandPalette` — `exec` as `useCallback`, selection reset in the input
    handler.
  - `lib/vision.ts` — removed unused parameters.
- ESLint now passes cleanly (0 errors, 0 warnings) under
  `eslint-plugin-react-hooks` v7.

### Removed

- `src/App.css` — empty, unreferenced template remnant.
- `react-router-dom` — declared but never used.
- DesignArena export scripts from `index.html` (recording/telemetry/element
  picker).

### Fixed

- 22 pre-existing lint errors (unused vars/imports, `prefer-const`,
  `@ts-ignore`, empty blocks, ref-during-render, set-state-in-effect,
  impure-render `Date.now()`).
- Broken asset references (`/atlas-bg.png`, `/favicon.svg` → now committed).

---

## [4.0.0] — the work itself

The Creative Cortex v4.1 as conceived and built by Zazie Productions: the
eight-module instrument, the seeded generative core, the force-directed atlas,
and the windowed stage. This changelog begins at the archival release; the
earlier evolution is not reconstructed here because the repository's history
began as a single export.
