# Contributing

NEXUS//OS is an experimental art repository first and a codebase second. It
welcomes two kinds of contribution: **technical** (fixes, ports, instruments)
and **conceptual** (new domains, schemes, fragments, palettes). Both go through
the same lightweight workflow.

---

## Ground rules

- **Preserve the premise.** The piece is a satirical "creative-genius OS." New
  features should deepen that fiction, not flatten it into a dashboard.
- **Keep generation deterministic.** Content generators take a seed and return
  typed data. Use `Math.random()` only where the act should be genuinely
  one-off (the synthesis forge) and `Date.now()` only for wall-clock values.
- **Respect the colour language.** Module accents, domain colours, and the
  coherence/resonance/novelty trio are a shared legend — reuse them, don't
  improvise new ones casually.
- **No new runtime dependencies without a reason.** The app is static and
  self-hosted (fonts included); keep it that way.

## Workflow

1. **Open an issue** (bug report or experiment proposal — templates exist in
   `.github/ISSUE_TEMPLATE/`). Describe the change before writing it.
2. **Branch** from `main`: `fix/…`, `feat/…`, or `experiment/…`.
3. **Implement** with tests where the change touches `src/lib/` (the
   deterministic core has full coverage; keep it that way).
4. **Run the gates:**

   ```bash
   npm run check
   ```

   `check` runs `typecheck`, `lint`, `test`, and `build` in order. All must
   pass.

5. **Open a pull request.** Use the PR template. Link the issue.
6. CI runs the same gates on every PR; a maintainer merges to `main`, which
   auto-deploys to GitHub Pages.

## Adding an instrument

To add a new module panel:

1. Add its metadata to `PANEL_META` and a default `PanelState` in
   `src/lib/layout.ts`.
2. Create the component in `src/components/`.
3. Register it in `App.tsx`'s `renderContent` switch.
4. Pick an accent colour consistent with the visual language
   (`docs/design/visual-language.md`).
5. If it generates content, follow the pattern in
   `docs/technical/generative-systems.md` and add unit tests.

## Style

- TypeScript strict mode; no `any` unless there is a documented reason.
- React hooks/compiler rules are enforced (`eslint-plugin-react-hooks` v7) —
  no ref reads during render, no `setState` in effect bodies.
- Comments explain *why*, not what. The codebase prefers a comment on the
  non-obvious decision over a comment on the syntax.

## Reporting bugs

Use the bug-report template. Include: Node version, browser, what you did, what
you expected, what happened, and — for visual issues — a screenshot. For the
generative core, include the seed if you changed one.
