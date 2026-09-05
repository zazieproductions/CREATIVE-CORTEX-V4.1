/**
 * capture-screenshots.mjs
 *
 * Builds the app, serves the production bundle locally, and captures the real
 * rendered interface with a headless browser (Playwright). Produces:
 *
 *   docs/images/project-preview.png         default state, full interface
 *   docs/images/project-active.png          interactive state (command palette open)
 *   docs/images/project-detail.png          a Code Prototype opened in the modal
 *   docs/images/github-social-preview.png   1280x640 social card (repo settings)
 *   public/og-cover.png                     copy of the social card (og:image)
 *
 * Run:  npm run capture:screenshots
 *
 * Browser resolution order:
 *   1. CHROMIUM_EXECUTABLE — point at any Chromium binary. Optionally set
 *      CHROMIUM_LD_LIBRARY_PATH to a directory of shared libraries (NSS/NSPR)
 *      when running on a minimal host without them.
 *   2. @sparticuz/chromium-min — the serverless Chromium build, if installed.
 *   3. Playwright's bundled Chromium (npx playwright install chromium).
 *
 * The capture viewport is 1440x900 at 2x device scale (2880x1800 output).
 */

import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.env.PORT ?? 4173);
const BASE_URL = `http://localhost:${PORT}/`;
// 1440x900 at device scale 1. Kept at 1x because the interface layers several
// full-screen backdrop-filter blurs; software-rendering those at 2x (2880x1800)
// can stall the compositor on a CPU-only headless host.
const DEVICE_SCALE = 1;
const VIEWPORT = { width: 1440, height: 900 };

const out = (p) => join(root, p);

function log(msg) {
  process.stdout.write(`[capture] ${msg}\n`);
}

/** Build the production bundle so screenshots reflect the shipped output. */
function build() {
  log('building production bundle…');
  execSync('npm run build', { cwd: root, stdio: 'inherit' });
}

/** Start `vite preview` and resolve once it is answering requests. */
function startServer() {
  const viteBin = join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  const child = spawn(process.execPath, [viteBin, 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', (d) => { stderr += d.toString(); });

  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 20_000;
    const poll = async () => {
      try {
        const res = await fetch(BASE_URL);
        if (res.ok) return resolve({ child });
      } catch {
        /* not up yet */
      }
      if (Date.now() > deadline) {
        child.kill();
        return reject(new Error(`vite preview did not start. ${stderr}`));
      }
      setTimeout(poll, 200);
    };
    poll();
  });
}

/** Resolve and launch the best available Chromium. */
async function launchBrowser(chromium) {
  const executablePath = process.env.CHROMIUM_EXECUTABLE;
  const ldPath = process.env.CHROMIUM_LD_LIBRARY_PATH;

  const withEnv = (extra = {}) => {
    const env = { ...process.env };
    if (ldPath) env.LD_LIBRARY_PATH = ldPath;
    return { ...extra, env };
  };

  if (executablePath) {
    log(`using CHROMIUM_EXECUTABLE=${executablePath}`);
    return chromium.launch(withEnv({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
    }));
  }

  // Serverless Chromium (optional devDependency).
  try {
    const mod = await import('@sparticuz/chromium-min');
    const path = await mod.default.executablePath();
    log(`using @sparticuz/chromium-min (${path})`);
    return chromium.launch(withEnv({
      headless: true,
      executablePath: path,
      args: mod.default.args,
    }));
  } catch {
    /* not installed — fall through */
  }

  log('using Playwright bundled Chromium');
  return chromium.launch({ headless: true });
}

async function waitForApp(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  // The OS bar brand is the first stable element of the interface.
  await page.getByText('NEXUS', { exact: false }).first().waitFor({ timeout: 15_000 });
  // Let the vision stream produce entries and the graph relax before capture.
  // The stream types ~30ms/char + a ~0.9s pause per entry, so ~6.5s yields one
  // or two rendered fragments plus a noticeably settled graph.
  await page.waitForTimeout(6_500);
}

async function capturePreview(page) {
  await page.screenshot({ path: out('docs/images/project-preview.png') });
  log('captured project-preview.png');
}

async function captureActive(page) {
  await page.keyboard.press('Control+k');
  const input = page.getByPlaceholder('search notes, concepts, schemes…');
  await input.waitFor({ timeout: 5_000 });
  await input.type('attractor', { delay: 40 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: out('docs/images/project-active.png') });
  log('captured project-active.png');
}

async function captureDetail(page) {
  // Close the palette.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Focus (center) the Code Prototypes module via the sidebar.
  await page.locator('aside').getByText('Code Prototypes', { exact: true }).click();
  await page.waitForTimeout(700);

  // Open the first prototype sketch in the modal.
  await page.getByText('Hyperstition Compiler', { exact: true }).click();
  await page.getByRole('heading', { name: 'Hyperstition Compiler' }).waitFor({ timeout: 5_000 });
  await page.waitForTimeout(500);

  await page.screenshot({ path: out('docs/images/project-detail.png') });
  log('captured project-detail.png');
}

/** Compose the 1280x640 social card from the freshly captured preview. */
async function buildSocialCard(page) {
  // The card must be exactly 1280x640, so it is rendered on its own page at
  // device scale 1 (the interface captures above use 2x for crispness).
  const preview = readFileSync(out('docs/images/project-preview.png'));
  const b64 = preview.toString('base64');

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1280px; height: 640px; background: #06060d; overflow: hidden; position: relative; }
    .bg { position: absolute; inset: 0; background-image: url('data:image/png;base64,${b64}');
          background-size: cover; background-position: center; }
    .shade { position: absolute; inset: 0;
             background: linear-gradient(90deg, rgba(6,6,13,0.97) 0%, rgba(6,6,13,0.82) 44%, rgba(6,6,13,0.30) 100%); }
    .frame { position: absolute; inset: 0; border: 1px solid rgba(120,130,255,0.22); }
    .text { position: absolute; left: 64px; bottom: 60px; color: #c8cadb; font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
    .rule { width: 56px; height: 3px; background: #22d3ee; margin-bottom: 26px; }
    .sub { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 15px; letter-spacing: 0.22em;
           text-transform: uppercase; color: #22d3ee; margin-bottom: 12px; }
    h1 { font-size: 60px; font-weight: 700; letter-spacing: -0.02em; color: #e8eaf2; line-height: 1; }
    h1 .sep { color: #22d3ee; }
    .credit { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; letter-spacing: 0.34em;
              text-transform: uppercase; color: #6a6f90; margin-top: 18px; }
  </style></head><body>
    <div class="bg"></div><div class="shade"></div><div class="frame"></div>
    <div class="text">
      <div class="rule"></div>
      <div class="sub">Speculative creative-genius operating system</div>
      <h1>NEXUS<span class="sep">//</span>OS</h1>
      <div class="credit">Zazie Productions</div>
    </div>
  </body></html>`;

  const cardContext = await page.context().browser().newContext({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 1 });
  const cardPage = await cardContext.newPage();
  await cardPage.setContent(html, { waitUntil: 'load' });
  await cardPage.waitForTimeout(250);

  const cardPath = out('docs/images/github-social-preview.png');
  await cardPage.screenshot({ path: cardPath });
  // Mirror into public/ so the deployed site's og:image resolves.
  writeFileSync(out('public/og-cover.png'), readFileSync(cardPath));
  // Best-effort: the browser is closed in main()'s finally block anyway.
  await cardContext.close().catch(() => {});
  log('captured github-social-preview.png + public/og-cover.png');
}

async function main() {
  mkdirSync(out('docs/images'), { recursive: true });
  if (!existsSync(out('public'))) mkdirSync(out('public'));

  build();

  const { chromium } = await import('playwright');
  const { child } = await startServer();
  let browser;
  try {
    browser = await launchBrowser(chromium);
    const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DEVICE_SCALE });
    const page = await context.newPage();

    await waitForApp(page);
    await capturePreview(page);
    await captureActive(page);
    await captureDetail(page);
    await buildSocialCard(page);
    log('done');
  } finally {
    if (browser) await browser.close().catch(() => {});
    child.kill();
  }
}

main().catch((err) => {
  console.error('[capture] failed:', err);
  process.exit(1);
});
