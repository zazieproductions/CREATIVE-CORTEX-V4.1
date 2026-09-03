import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Base path for emitted asset URLs.
 *
 * This repository deploys to GitHub Pages as a *project* site, which is served
 * from a sub-path rather than a domain root:
 *
 *   https://zazieproductions.github.io/CREATIVE-CORTEX-V4.1/
 *
 * Every absolute asset reference in the build (`/assets/*.js`, `/favicon.svg`,
 * `/atlas-bg.png`, `/og-image.png`) must therefore be prefixed with the
 * repository name or the deployed page 404s on its own assets.
 *
 * Resolution order:
 *   1. `VITE_BASE` — explicit override. Set `VITE_BASE=/` for local serving
 *      from a domain root (used by the sandbox preview and `npm run preview:local`).
 *   2. production builds — the Pages sub-path below.
 *   3. dev — `/`, so `npm run dev` serves from http://localhost:5173/.
 */
const PAGES_BASE = '/CREATIVE-CORTEX-V4.1/';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_']);
  const base = env.VITE_BASE ?? (mode === 'production' ? PAGES_BASE : '/');

  return {
    base,
    plugins: [react(), tailwindcss()],
    envPrefix: ['VITE_'],

    // Bind to all interfaces so the app is reachable from containerised
    // previews and CI screenshot jobs, not just loopback.
    server: { host: true, port: 5173 },
    preview: { host: true, port: 4173 },

    build: {
      target: 'es2022',
      sourcemap: true,
      reportCompressedSize: true,
    },
  };
});
