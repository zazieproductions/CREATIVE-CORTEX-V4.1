# Security

NEXUS//OS is a static, client-side art piece. Its security surface is
deliberately small, and this document states exactly what it is.

---

## Scope

- **No backend, no database, no auth, no user data.** Nothing a user does is
  transmitted anywhere; there is no server to attack and no data to exfiltrate.
- **No secrets.** The build reads no environment variables and embeds no keys.
- **No runtime data dependencies.** Fonts are self-hosted; there are no
  third-party scripts or trackers in the shipped `index.html`.

## The actual risks

1. **Supply chain (build-time).** The project depends on ~220 npm packages at
   install time. The usual mitigations apply and are expected of contributors:

   ```bash
   npm audit          # review known vulnerabilities
   npm ci             # install from the lockfile, never `npm install` ad hoc
   ```

   Dependabot alerts are enabled on the repository. CI runs `npm ci` (not
   `npm install`) so builds are reproducible from the lockfile.

2. **The PRNG is not cryptographic.** `mulberry32` generates content, not keys.
   Nothing in the app uses it for anything security-relevant, and it must not be
   used that way in future contributions.

3. **`navigator.clipboard` (Hex Lab).** Copying a hex value uses the Clipboard
   API, which requires a secure context (HTTPS or localhost). The GitHub Pages
   deployment is HTTPS; local dev over `http://localhost` is a secure context.
   No other sensitive APIs are used.

## Reporting a vulnerability

If you find a real security issue (e.g., a dependency with a serious advisory
that should be pinned or removed), open an issue in the repository. Given the
project's nature, "security" here almost always means a dependency concern; it
will be treated as a normal bug with priority.

Do **not** expect a formal coordinated-disclosure process or a bug bounty: this
is an experimental art repository, and this is the honest statement of that.
