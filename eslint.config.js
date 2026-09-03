import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * NEXUS lint policy.
 *
 * We keep the strict, type-aware baseline. Two rules from the React-hooks v7
 * "compiler" ruleset are deliberately switched OFF, with rationale, because they
 * conflict with the application's core technique: the neural atlas is an
 * imperative requestAnimationFrame simulation whose mutable state lives in refs
 * and is read during render, and several one-shot effects reconcile state
 * (e.g. clamping the camera when the viewport resizes). These are intentional,
 * reviewed patterns — see docs/technical/rendering-system.md — not accidents.
 *
 * Everything else, including `react-hooks/purity` (no impure renders) and the
 * unused-variable / prefer-const families, stays enforced.
 */
export default defineConfig([
  globalIgnores(['dist', 'coverage', 'scripts', 'archive', 'tests']),

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // The atlas and stream are imperative RAF/pointer-capture simulations.
      // Their mutable state is held in refs and intentionally read during
      // render; a tick counter triggers re-render. Refactor-free by design.
      'react-hooks/refs': 'off',
      // One-shot reconciliation effects (clamp camera on resize, focus a panel)
      // are deliberate; they are not cascading state loops.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
