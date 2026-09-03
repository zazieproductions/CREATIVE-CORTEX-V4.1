## What & why

<!-- Describe the change and the reasoning. Link the relevant doc if one exists. -->

## Layer touched

- [ ] Generative (`src/lib`) — determinism preserved?
- [ ] State (`App` / hooks)
- [ ] Presentation (`components/*`)
- [ ] Styles / tokens
- [ ] Docs / screenshots
- [ ] Build / CI

## Checks

- [ ] `npm run verify` is green (typecheck, lint, test, build)
- [ ] If the UI changed, `npm run capture:screenshots` was re-run and committed
- [ ] No new dependency added without justification
- [ ] Determinism: no unseeded runtime randomness introduced

## Screenshots

<!-- Paste before/after captures if visual. -->
