# Contributing

NEXUS is a single-author studio artefact, but collaboration is welcome where it respects the work's voice. This is a deliberately lightweight process.

## Before you write code

- Read [docs/creative/concept.md](docs/creative/concept.md) — the piece has a character; changes should not flatten it.
- Read [ARCHITECTURE.md](ARCHITECTURE.md) so your change lands in the right layer.
- Prefer the generative layer for content: add vocabulary/templates, not hardcoded data (schemes and prototypes are the curated exceptions).

## Workflow

1. Fork / branch from `main`.
2. `npm ci`, then keep the gate green: `npm run verify`.
3. If you change the UI, regenerate real screenshots: `npm run capture:screenshots`.
4. Keep commits focused; describe the *why*.
5. Open a PR against `main` using the template; CI (typecheck, lint, test, build) must pass.

## What we merge

- Determinism-preserving changes (seeded, reproducible).
- Legibility: extraction of meaningful modules, comments where the *why* isn't obvious.
- Documentation that matches the code.

## What we don't

- Generic startup branding, emoji-heavy formatting, or marketing copy.
- New dependencies without a proportionate reason.
- Hand-authored content that the generator should own.

## License

**There is currently no license file.** All rights are reserved by Zazie Productions. By submitting a contribution you grant Zazie Productions the right to include it under whatever license the author later chooses. If you need a specific license to contribute, raise it in an issue first.
