# Development setup

Everything needed to get from a fresh clone to a running dev server, a green
test suite, and a production build.

---

## Prerequisites

- **Node.js 20.19+** (declared in `package.json` `engines`). Node 22 LTS is the
  tested baseline.
- **npm 10+** (the lockfile is `package-lock.json`).
- No databases, no services, no environment variables, no secrets. The app is
  fully static and fully offline after install.

## Install

```bash
git clone https://github.com/zazieproductions/CREATIVE-CORTEX-V4.1.git
cd CREATIVE-CORTEX-V4.1
npm ci
```

Use `npm ci` (not `npm install`) for a reproducible tree from the lockfile.

## Run

```bash
npm run dev
```

Vite prints the local URL (default `http://localhost:5173`). Hot-module
replacement is active; edits to `src/` apply without a full reload.

## Quality gates

```bash
npm run typecheck   # TypeScript project references (app + tests + vite config)
npm run lint        # ESLint flat config, incl. react-hooks/compiler rules
npm test            # Vitest unit suite (31 tests) over tests/unit/
npm run build       # production bundle to dist/
npm run check       # typecheck + lint + test + build, in order
```

`npm run check` is what CI runs; it should be green before any PR.

## Screenshots

```bash
npm run capture:screenshots
```

Builds the app, serves `dist/`, drives a headless browser, and writes the three
interface captures and the 1280×640 social card (see
`scripts/capture-screenshots.mjs` for the browser-resolution logic and the
`CHROMIUM_EXECUTABLE` / `CHROMIUM_LD_LIBRARY_PATH` escape hatches for
restricted hosts).

## What you should not need

- **No `.env`** — the build reads no environment variables. `vite.config.ts`
  sets only `base: './'`.
- **No font CDN** — Space Grotesk and JetBrains Mono are bundled via
  `@fontsource` and imported in `src/main.tsx`.
- **No backend** — there is nothing to run besides the static frontend.

## Troubleshooting the first run

| Symptom | Cause | Fix |
| --- | --- | --- |
| `npm ci` fails on engine | Node too old | install Node 20.19+ |
| `tsc -b` errors about `vitest` | stale install | `rm -rf node_modules && npm ci` |
| Dev server serves 404 for `/atlas-bg.svg` | missing `public/` asset | confirm `public/atlas-bg.svg` and `public/favicon.svg` exist |
| Screenshots time out | software rendering + backdrop blur | capture at 1440×900 (default) or use a GPU host |
