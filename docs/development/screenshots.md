# Screenshots

All imagery in `docs/images/` is captured from the *running application* by
[`scripts/capture-screenshots.mjs`](../../scripts/capture-screenshots.mjs). Nothing is mocked, reconstructed, or AI-generated.

## Pipeline

1. Rebuilds the app with a domain-root base (`VITE_BASE=/`) so local asset URLs resolve.
2. Boots `vite preview` on port 4173 and waits for readiness.
3. Drives a headless Chromium at 1440×900 through three states:
   - `project-preview.png` — settled default workspace,
   - `project-active.png` — after firing the Idea Synthesis forge,
   - `project-detail.png` — command palette open with a query.
4. Composes `github-social-preview.png` (1280×640) by layering restrained typography over the real preview frame, rendered in the same browser.

## Browser strategy

Prefers Playwright's Chromium when installed; otherwise falls back to
`puppeteer-core` + `@sparticuz/chromium` (a Chromium distributed through the npm registry) with the package's bundled Amazon-Linux shared libraries placed on `LD_LIBRARY_PATH`. The fallback exists for egress-restricted environments where Playwright's CDN is unreachable.

## Regenerate

```bash
npm run capture:screenshots
```

After regenerating, also refresh `public/og-image.png` if the social card changed:

```bash
cp docs/images/github-social-preview.png public/og-image.png
```

## Social preview

Upload `docs/images/github-social-preview.png` via
**Repository → Settings → General → Social preview**.
