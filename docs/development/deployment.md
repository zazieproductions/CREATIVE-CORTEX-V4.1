# Deployment

NEXUS is a static client app; the supported target is **GitHub Pages** as a project site.

## The base path

GitHub serves project sites from a sub-path, so every asset URL must be prefixed with the repository name. `vite.config.ts` handles this:

- production build → `base = /CREATIVE-CORTEX-V4.1/`
- dev → `base = /`
- override with `VITE_BASE` (e.g. `VITE_BASE=/` for domain-root serving).

`index.html` asset references are rewritten by Vite; runtime references to public files use `import.meta.env.BASE_URL` (see `Workspace.tsx`), so they resolve under either base.

## GitHub Pages workflow

`.github/workflows/deploy-pages.yml`:

1. triggers on push to `main` (and manual dispatch),
2. `npm ci` + `npm run build`,
3. uploads `dist/` with `actions/upload-pages-artifact`,
4. deploys with `actions/deploy-pages`.

### One-time activation (repository owner)

1. Settings → Pages → Source: **GitHub Actions**.
2. Push to `main`. The workflow publishes to
   `https://zazieproductions.github.io/CREATIVE-CORTEX-V4.1/`.

No client routing exists (single page, no router), so there is **no SPA 404/refresh problem** — every path resolves to the one `index.html`.

## Verifying a deployment

- Asset URLs in `dist/index.html` start with the base path.
- `dist/` contains `favicon.svg`, `atlas-bg.png`, `og-image.png` (copied from `public/`).
- A hard refresh shows no 404s in the network panel.

## Other targets

The build is plain static output; Vercel/Netlify/Cloudflare Pages work unchanged — set the build command to `npm run build`, output dir `dist`, and for domain-root hosting set `VITE_BASE=/` in the platform's env.
