# Setup

## Requirements

- Node.js ≥ 20 (developed on Node 22).
- No environment variables are required. (`VITE_BASE` is optional; see deployment.)

## Install & run

```bash
npm ci            # reproducible install from package-lock
npm run dev       # http://localhost:5173/  (HMR)
```

## Verify

```bash
npm run typecheck # tsc -b
npm run lint      # eslint
npm test          # vitest run
npm run build     # tsc -b && vite build
npm run verify    # all of the above in sequence
```

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` | Vite dev server, bound to all interfaces |
| `build` | typecheck + production build (Pages base path) |
| `typecheck` / `lint` / `test` | checks |
| `preview` | serve `dist` at the production base path |
| `preview:local` | serve `dist` at `/` (`VITE_BASE=/`) |
| `assets:atlas` | regenerate `public/atlas-bg.png` |
| `capture:screenshots` | real screenshot automation into `docs/images/` |
| `verify` | typecheck + lint + test + build |

## Environment variables

None required. Optional: `VITE_BASE` overrides the asset base path (`/` for domain-root serving; default is `/CREATIVE-CORTEX-V4.1/` in production builds, `/` in dev). A `.env.example` documents it.

## Why there is no backend

NEXUS is a stateless client artefact. If you add persistence or a server, update [ARCHITECTURE.md](../../ARCHITECTURE.md) and the deployment doc — the current Pages deployment assumes static output.
