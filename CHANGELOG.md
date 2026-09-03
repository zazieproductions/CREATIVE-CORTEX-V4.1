# Changelog

The format is descriptive rather than strictly semver; the project is a studio artefact.

## [4.1.0] — archival & legibility release

The repository was transformed from a working prototype into its canonical technical archive.

### Added
- Documentation system: `ARCHITECTURE.md`, `docs/{technical,design,development,creative}`, `docs/README.md`.
- Real screenshot automation (`scripts/capture-screenshots.mjs`) + captured `docs/images/*`.
- `scripts/generate-atlas-bg.mjs` — procedural generator for `public/atlas-bg.png` (pure Node PNG writer), plus `public/favicon.svg` and `public/og-image.png`.
- Test suite: Vitest over the generative layer + assets (`tests/`, 30 tests).
- GitHub Actions: `ci.yml` and `deploy-pages.yml`; issue/PR templates.
- `CONTRIBUTING.md`, `SECURITY.md`, `ROADMAP.md`, this changelog.
- `.env.example` documenting the optional `VITE_BASE`.

### Changed
- Repository reorganised: `components/` → `components/shell` + `components/panels`; `lib/generate.ts` split into `notes/schemes/prototypes/palettes/analytics`; styles split into `styles/{tokens,base,index}.css`; tokenizer extracted to pure `lib/highlight.ts`.
- Configuration centralised in `src/lib/config.ts` (seeds, corpus sizes, force constants, stage, camera).
- Base path wired for GitHub Pages (`/CREATIVE-CORTEX-V4.1/` in prod, `/` in dev, `VITE_BASE` override); runtime public-asset URLs use `import.meta.env.BASE_URL`.
- `index.html` rewritten with real metadata + OG tags; package identity (`nexus-creative-cortex`, v4.1.0) and full script surface.

### Fixed
- Missing `/atlas-bg.png` and `/favicon.svg` (both were 404s on every load).
- `npm run lint` failures (22 errors) — real bugs fixed: command-palette use-before-declare, impure render (`Date.now()` in render), unused imports/vars, `prefer-const`.
- Atlas node lookup reduced from `Array.find` (O(E·N)/frame) to a `Map` (O(E)/frame).
- Fragile `Object.keys(DOMAIN_COLORS)[i]` colour mapping replaced with `DOMAINS[i]`.
- Hardcoded "327" UI copy now derives from `NOTE_COUNT`.

### Removed
- Generation-harness instrumentation (rrweb recorder, telemetry beacon, element picker, `vite-source-tags` build plugin) — preserved under `archive/`.
- Unused `react-router-dom` (removed 2 high-severity advisories; `npm audit` now clean).
- Empty, unimported `src/App.css`.

### Security
- Excised the external telemetry beacon and session recorder that shipped in the export.
- `npm audit` reports 0 vulnerabilities.

## [0.0.0] — original export

Initial single-commit export from the generation environment ("DesignArena export"). Stock Vite README, harness-injected scripts, no tests, no CI, no docs.
