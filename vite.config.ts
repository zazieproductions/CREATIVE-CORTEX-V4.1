import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
//
// `base: './'` makes every asset URL relative to the page, which lets the same
// build be served from GitHub Pages (https://<owner>.github.io/<repo>/), a
// custom domain, or a static file host without recompiling. The app reads
// asset paths through `import.meta.env.BASE_URL`, so this single setting is the
// only deployment switch.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
})
