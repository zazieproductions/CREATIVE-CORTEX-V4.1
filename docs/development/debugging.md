# Debugging

Diagnostics for the subsystems most likely to misbehave, and how to confirm the
instrument is actually working.

---

## Confirm the deterministic core is intact

The fastest health check is the unit suite:

```bash
npm test
```

`tests/unit/generate.test.ts` asserts the vault is exactly 327 notes with
ordered ids and valid links; `concepts.test.ts` asserts 45 nodes / 92 valid
edges; `vision.test.ts` asserts generator determinism. If any of these fail,
something in `lib/` changed the seed or the corpus — start there.

## The Neural Atlas

| Symptom | Likely cause | Check |
| --- | --- | --- |
| Graph frozen | RAF loop not running | confirm `requestAnimationFrame` is scheduled in the `useEffect` and the effect has `[]` deps (runs once) |
| Nodes fly off | damping or bounds removed | damping is `vx *= 0.85`; bounds clamp to `[46, VBW-46] × [40, VBH-40]` |
| Drag doesn't stick | coordinate mapping | `toSvg` must use `getScreenCTM().inverse()` to map client → viewBox space |
| Nodes jump on selection | stale node reference | selection must be by id (`selectedId`), never by object reference |

To watch physics state in isolation, open the Neural Atlas, expand it (header
expand button), and observe: a healthy graph drifts but stays inside the panel,
pulses travel continuously, and double-click recentres.

## The vision stream

- The stream types at **30 ms/char** then pauses ~0.9 s per entry. If it looks
  stalled, confirm `setInterval` is 30 ms and `onNew` isn't causing a parent
  re-render storm (App only nudges `visionIndex`, which is cheap).
- Determinism: two `VisionGenerator`s with the same seed emit the same
  id/text/tags (but different `ts`); the unit test encodes this.

## Window manager

- **Lost panels:** panning is clamped so the view cannot leave the stage; if a
  panel is off-screen, click it in the sidebar (focus centres it) or press
  **Reset layout** in the sidebar footer.
- **Zoom feels wrong:** zoom is clamped to 45–150% and anchored at the cursor
  (`zoomAt`); the fit button (`Locate` icon) computes a fit-to-viewport scale.

## Rendering & fonts

- Confirm fonts are self-hosted: the network panel should show **no request to
  fonts.googleapis.com**. Fonts load from `dist/assets/*.woff2`.
- If the interface renders with a system font, `@fontsource` imports in
  `src/main.tsx` were removed — restore them.

## Performance

- In the browser Performance tab, the RAF script cost should be a few ms/frame
  at 45 nodes. If the compositor is the bottleneck (backdrop blur under software
  rendering), see `docs/technical/performance.md`.

## Headless capture in restricted networks

The screenshot script supports two override variables for hosts without Playwright's
bundled browser or system NSS libraries:

```bash
CHROMIUM_EXECUTABLE=/path/to/chromium \
CHROMIUM_LD_LIBRARY_PATH=/path/to/libnspr4+nss \
npm run capture:screenshots
```

`CHROMIUM_LD_LIBRARY_PATH` should point at a directory containing
`libnspr4.so`, `libplc4.so`, `libplds4.so`, `libnss3.so`, `libnssutil3.so`,
`libsmime3.so`, `libssl3.so`, and the freebl/softokn/sqlite companions.
