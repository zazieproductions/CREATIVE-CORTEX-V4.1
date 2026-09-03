# Security

NEXUS is a static, client-only application with no backend, no authentication, no stored user data, and no third-party runtime calls (web fonts are the only external fetch). Its attack surface is therefore small, but not zero.

## Reporting

Report security concerns privately by opening a GitHub security advisory or contacting Zazie Productions directly — **do not** open a public issue for a security vulnerability.

## What matters here

- **Dependency hygiene.** The only runtime dependencies are React, framer-motion, lucide-react, and Tailwind. `npm audit` is expected to be clean; the previous `react-router-dom` advisory vector was removed when the unused dependency was excised.
- **Generated content is inert.** Notes, schemes, and prototypes are rendered as text (React escapes by default) and the code viewer tokenizes without `innerHTML`. There is no user-supplied HTML injection path.
- **No telemetry.** The archive intentionally removed the generation harness's recorder and beacon; the shipped app performs no analytics or session recording.

## Out of scope

- Vulnerabilities in the fonts CDN or in browsers themselves.
- Social-engineering "schemes" depicted in the artwork — they are fiction, not instructions or functionality.
