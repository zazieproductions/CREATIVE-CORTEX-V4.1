# Engineering report — archive & portfolio release

This report records what was done to turn the Creative Cortex v4.1 export into
a maintainable, documented, portfolio-grade repository. It is the engineering
companion to `README.md` and `ARCHITECTURE.md`.

---

## 1. Audit findings

The repository arrived as a single DesignArena export commit. Findings:

| Area | Finding |
| --- | --- |
| Identity | `package.json` name `vite-react-ts`, author "DesignArena", no repository/description/keywords |
| README | Stock Vite template text, no relation to the project |
| Assets | `Workspace` referenced `/atlas-bg.png` and the head referenced `/favicon.svg` — neither existed (silent 404s) |
| Dead code | Empty `src/App.css`; `react-router-dom` declared but never imported |
| Tooling | `.vite-source-tags.js` source-tag plugin and Arena telemetry scripts (rrweb recording, page-view beacon, element picker) in `index.html` |
| Lint | 22 errors + 1 warning under `eslint-plugin-react-hooks` v7 (ref-during-render, set-state-in-effect, `Date.now()` in render, unused vars/imports, `@ts-ignore`, empty blocks) |
| Tests | None |
| Docs | None beyond the stock README |
| CI/CD | None |
| License | **None** (see §6) |

The **code itself was strong**: a genuinely original, deterministic generative
system (seeded RNG → 327 field notes, a 45-node/92-edge knowledge graph, vision
fragments, concept synthesis, palettes) rendered as a windowed "creative-genius
OS" with a force-directed atlas, a typing cognition stream, and a full
analytics/chart layer. The goal was therefore to *preserve* the system and
rebuild everything around it, not to rewrite the work.

## 2. Major changes

### Build & identity

- `package.json`: `creative-cortex@4.1.0`, author **Zazie Productions**,
  homepage, repository, keywords, `engines` (Node ≥ 20.19), and a complete
  script set — `dev`, `build`, `preview`, `lint`, `typecheck`, `test`,
  `test:watch`, `capture:screenshots`, and `check` (typecheck + lint + test +
  build).
- `vite.config.ts`: `base: './'` for sub-path (GitHub Pages) deployment;
  removed the optional `.vite-source-tags.js` import.
- `index.html`: rewritten head (description/author/keywords, OpenGraph +
  Twitter cards, theme-color, relative favicon); removed the DesignArena
  recording/telemetry/element-picker scripts.
- Self-hosted fonts (`@fontsource/space-grotesk`, `@fontsource/jetbrains-mono`)
  — no external font CDN at runtime.
- Added `public/`: `favicon.svg` (hexagon mark), `atlas-bg.svg` (2360×1180
  constellation backdrop), `og-cover.png` (social card, mirrored by the capture
  script).

### Code changes (conservative — behaviour preserved)

- `Workspace.tsx` — event-driven viewport clamp (ResizeObserver); render-time
  focus centring via a `focusNonce`; cursor held in state (not a ref read in
  render); backdrop loaded via `import.meta.env.BASE_URL`.
- `NeuralGraph.tsx` — physics working set lives in refs mutated on each
  animation frame; a per-frame snapshot feeds React state. Initialisation split
  into factory functions so refs and state are not read during render.
- `VisionStream.tsx` — generator held in state (one instance per mount).
- `Analytics.tsx` — wall-clock entropy sampled on a timer rather than read
  during render.
- `CommandPalette.tsx` — `exec` as `useCallback`; selection reset in the input
  handler; complete effect dependencies.
- `lib/vision.ts` — removed unused parameters.
- Removed `src/App.css` and `react-router-dom`.

These changes are exactly the minimum needed to satisfy the modern React hooks
rules; no feature or visual behaviour was altered (verified by comparing the
captured screenshots against the pre-change running app).

### Tests

31 Vitest unit tests in `tests/unit/` covering the deterministic core:

- `rng.test.ts` (6) — mulberry32 determinism, `pick`, `pickN`, `between`.
- `generate.test.ts` (14) — 327-note vault, scheme/status invariants, code
  prototypes, palettes, analytics series.
- `vision.test.ts` (5) — generator determinism, id monotonicity, synthesis.
- `concepts.test.ts` (6) — 45 nodes, 92 valid weighted edges, per-domain
  triples.

### Screenshots

`scripts/capture-screenshots.mjs` builds the app, serves `dist/` via
`vite preview`, and drives a headless browser to produce, at device scale 1:

| File | Size | Dimensions |
| --- | --- | --- |
| `docs/images/project-preview.png` | 1440×900 | 745 KB |
| `docs/images/project-active.png` | 1440×900 | 234 KB |
| `docs/images/project-detail.png` | 1440×900 | 209 KB |
| `docs/images/github-social-preview.png` | 1280×640 | 447 KB |
| `public/og-cover.png` | 1280×640 | 447 KB |

The "active" capture opens the command palette (⌘K) and selects a node; the
"detail" capture opens a note modal — so the screenshots show real interaction,
not a blank landing state.

### Documentation

- `README.md` — orientation for newcomer / creative technologist / engineer /
  curator; real screenshot, live-project badge (shields.io), module table,
  controls, architecture link table, install/develop/build/capture/deploy.
- `ARCHITECTURE.md` — lifecycle, module map, state model, rendering loop, data
  pipeline, event model, dependencies, build pipeline, performance, decisions
  and compromises; six Mermaid diagrams.
- `docs/concept.md` — the artistic intent and computational aesthetics.
- `docs/technical/` — `rendering-system`, `state-model`, `data-flow`,
  `generative-systems`, `performance`.
- `docs/design/` — `interface-system`, `visual-language`, `interaction-model`.
- `docs/development/` — `setup`, `debugging`, `deployment`.
- `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `ROADMAP.md`.

### CI/CD

- `.github/workflows/ci.yml` — install → typecheck → lint → test → build on
  push to `main` and every PR.
- `.github/workflows/deploy-pages.yml` — build + `actions/deploy-pages` on
  push to `main` and `workflow_dispatch`.
- Issue templates (bug report + experiment proposal) and a PR template.

## 3. Build & test results (final)

From a clean `npm ci`:

- **Install:** 0 vulnerabilities.
- **Typecheck:** clean (`tsc -b`).
- **Lint:** 0 problems (0 errors, 0 warnings).
- **Tests:** 4 files, **31/31 passing**.
- **Build:** `dist/` 414 KB JS (gzip 134 KB) + 74 KB CSS (gzip 28 KB), fonts
  self-contained; `base: './'` verified in the emitted `index.html` and asset
  URLs.

## 4. Verification

- README internal links and every `docs/` markdown link resolve (18 documents
  checked; 0 broken).
- All seven Mermaid blocks parse (`@mermaid-js/parser`).
- No `localhost`/placeholder/fake content in shipped docs; the only `localhost`
  mentions are legitimate dev-server instructions.
- All README image paths resolve; badges are external shields.io URLs only.
- Screenshots regenerate repeatably via `npm run capture:screenshots`.
- `public/` assets (`favicon.svg`, `atlas-bg.svg`, `og-cover.png`) are present
  and referenced with deploy-safe (relative / `BASE_URL`) paths.

## 5. Deployment status

- Branch `arena/01a06563-creative-cortex-v4-1` is pushed and open as
  **PR #2** (base `main`).
- The Pages workflow is committed, but **GitHub Pages is not yet enabled** on
  the repository, and the repository settings (description, topics, website)
  are not yet set. Both require a repository admin: the integration token used
  for this work has push/PR rights but not administration rights (the GitHub
  API returns 403).

**Owner steps to go live** (also in `docs/development/deployment.md`):

```bash
# 1. Enable Pages: Settings → Pages → Source → "GitHub Actions"
# 2. Merge PR #2 into main (this triggers the deploy)

gh repo edit zazieproductions/CREATIVE-CORTEX-V4.1 \
  --description "Speculative 'creative-genius OS': force-directed neural atlas, procedural field-note vault, generative concept synthesis." \
  --homepage "https://zazieproductions.github.io/CREATIVE-CORTEX-V4.1/" \
  --add-topic creative-coding --add-topic experimental-web --add-topic interactive-art \
  --add-topic generative-art --add-topic procedural-generation --add-topic speculative-design \
  --add-topic react --add-topic typescript --add-topic vite --add-topic tailwindcss \
  --add-topic svg --add-topic data-visualization --add-topic creative-technology --add-topic digital-art

# 3. Upload docs/images/github-social-preview.png at
#    Settings → General → Social preview
```

The live URL will be
`https://zazieproductions.github.io/CREATIVE-CORTEX-V4.1/`.

## 6. License

**The repository has no license.** No license file exists in the export, and
none was invented. Until the owner adds one, the work is legally
"all rights reserved" (unlicensed) — third parties may not reuse it. `package.json`
declares `"license": "UNLICENSED"` to reflect this accurately. The owner should
choose a license (e.g. `MIT`, `CC BY-NC-SA 4.0`, `GPL-3.0`) and add a
`LICENSE` file.

## 7. Files moved / removed

- **Removed:** `src/App.css` (empty), `react-router-dom` (unused),
  `.vite-source-tags.js` (export tooling), Arena telemetry scripts from
  `index.html`.
- **Added:** `public/` (3 assets), `docs/` (13 documents + 5 images),
  `scripts/`, `tests/`, `.github/`, `vitest.config.ts`, root governance docs.
- **No source files moved** — the existing `src/` structure was already clean
  and was preserved.

## 8. Remaining technical debt

- **Real audio engine** — the OS *portrays* listening/signal but produces no
  sound; a WebAudio layer is the obvious next instrument (see `ROADMAP.md`).
- **Persistence** — layout, committed notes, and palettes reset on reload.
- **Graph scalability** — O(n²) repulsion in the force layout caps the atlas at
  ~50 nodes; a WebGL/quadtree port would unlock larger graphs.
- **No e2e/UI tests** — unit coverage is on the deterministic core; a
  lightweight Playwright smoke test could be added once Pages is live.
- **Social preview** — must be uploaded to the repo settings by an admin (GitHub
  does not read it from the tree).

## 9. Recommended next priorities

1. Merge PR #2 and enable GitHub Pages (owner action) → live URL.
2. Add a license.
3. Persistence (layout + notes + palettes to `localStorage`).
4. A WebAudio instrument (map graph activity to sound).
5. A Playwright smoke test in CI against the deployed URL.
