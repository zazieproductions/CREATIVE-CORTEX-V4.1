#!/usr/bin/env node
/**
 * capture-screenshots.mjs — real screenshot automation for the docs.
 *
 * This is NOT a mock: it boots the production build (`vite preview`), drives a
 * headless Chromium through the running application, and writes the captures to
 * `docs/images/`. The README and social-preview images are derived from these
 * frames, so they always show the software as it actually renders.
 *
 * Browser strategy (first that works):
 *   1. Playwright's own Chromium, if it is installed (`npx playwright install`).
 *   2. `puppeteer-core` + `@sparticuz/chromium` — a Chromium shipped through the
 *      npm registry, for egress-restricted environments (like CI sandboxes)
 *      where Playwright's CDN is unreachable. The Amazon-Linux shared libraries
 *      bundled in the package are extracted and placed on LD_LIBRARY_PATH.
 *
 * Outputs:
 *   docs/images/project-preview.png   1440x900  settled default workspace
 *   docs/images/project-active.png    1440x900  after triggering the forge
 *   docs/images/project-detail.png    1440x900  command palette with a query
 *   docs/images/github-social-preview.png  1280x640  composited social card
 *
 * Usage:
 *   npm run build && npm run capture:screenshots
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { brotliDecompressSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = join(ROOT, 'docs', 'images');
const PORT = 4173;
const URL = `http://127.0.0.1:${PORT}/`;
const VIEW = { width: 1440, height: 900 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------- browser */

function extractSparticuzLibs() {
  const libDir = join(tmpdir(), 'al2023', 'lib');
  if (!existsSync(join(libDir, 'libnspr4.so'))) {
    const br = join(ROOT, 'node_modules', '@sparticuz', 'chromium', 'bin', 'al2023.tar.br');
    const tar = join(tmpdir(), 'al2023.tar');
    mkdirSync(join(tmpdir(), 'al2023'), { recursive: true });
    writeFileSync(tar, brotliDecompressSync(readFileSync(br)));
    spawnSyncSafe(`tar -xf ${tar} -C ${join(tmpdir(), 'al2023')}`);
  }
  return libDir;
}

function spawnSyncSafe(cmd) {
  // tar extraction; tolerate failure (libs may already exist).
  try {
    const { execSync } = require('node:child_process');
    execSync(cmd, { stdio: 'ignore' });
  } catch {}
}

// ESM has no require; shim via createRequire.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

async function launchBrowser() {
  // 1. Playwright.
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
    const page = await browser.newPage({ viewport: VIEW });
    return {
      kind: 'playwright',
      page,
      goto: (u) => page.goto(u, { waitUntil: 'networkidle' }),
      shot: (p) => page.screenshot({ path: p }),
      clip: (p, c) => page.screenshot({ path: p, clip: c }),
      type: (t) => page.keyboard.type(t),
      key: (k) => page.keyboard.press(k),
      eval: (fn, ...args) => page.evaluate(fn, ...args),
      close: () => browser.close(),
    };
  } catch (e) {
    console.log('playwright unavailable:', e.message.split('\n')[0]);
  }

  // 2. puppeteer-core + sparticuz chromium.
  const chromium = (await import('@sparticuz/chromium')).default;
  const puppeteer = (await import('puppeteer-core')).default;
  const libDir = extractSparticuzLibs();
  process.env.LD_LIBRARY_PATH = `${libDir}:${process.env.LD_LIBRARY_PATH ?? ''}`;
  const exe = await chromium.executablePath();
  const browser = await puppeteer.launch({
    args: [...chromium.args, '--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
    executablePath: exe,
    headless: true,
    defaultViewport: VIEW,
  });
  const page = await browser.newPage();
  return {
    kind: 'puppeteer',
    page,
    goto: (u) => page.goto(u, { waitUntil: 'networkidle0' }),
    shot: (p) => page.screenshot({ path: p }),
    clip: (p, c) => page.screenshot({ path: p, clip: c }),
      type: (t) => page.keyboard.type(t, { delay: 20 }),
      key: async (k) => {
        const parts = k.split('+');
        for (const m of parts.slice(0, -1)) await page.keyboard.down(m);
        await page.keyboard.press(parts[parts.length - 1]);
        for (const m of parts.slice(0, -1).reverse()) await page.keyboard.up(m);
      },
    eval: (fn, ...args) => page.evaluate(fn, ...args),
    close: () => browser.close(),
  };
}

/* ------------------------------------------------------------- preview server */

/** Build with a domain-root base so the local preview's asset URLs resolve. */
function buildRoot() {
  const { execSync } = require('node:child_process');
  execSync('npx vite build', { cwd: ROOT, env: { ...process.env, VITE_BASE: '/' }, stdio: 'inherit' });
}

function startPreview() {
  const child = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    env: { ...process.env, VITE_BASE: '/' },
    stdio: 'ignore',
  });
  return child;
}

async function waitReady() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(URL);
      if (res.ok) return;
    } catch {}
    await sleep(500);
  }
  throw new Error('preview server did not become ready');
}

/* ------------------------------------------------------------- interactions */

async function clickByText(ctx, text) {
  await ctx.eval((t) => {
    const els = [...document.querySelectorAll('button, [role="button"]')];
    const el = els.find((e) => (e.textContent || '').toLowerCase().includes(t.toLowerCase()));
    if (el) el.click();
  }, text);
}

async function capture() {
  mkdirSync(IMAGES, { recursive: true });
  buildRoot();
  const server = startPreview();
  try {
    await waitReady();
    const ctx = await launchBrowser();
    console.log('browser engine:', ctx.kind);

    // 1. Settled default workspace.
    await ctx.goto(URL);
    await sleep(2200); // let the RAF sim + vision stream populate
    await ctx.shot(join(IMAGES, 'project-preview.png'));
    console.log('wrote project-preview.png');

    // 2. Active: trigger the idea forge.
    await clickByText(ctx, 'synthesize');
    await sleep(1200);
    await ctx.shot(join(IMAGES, 'project-active.png'));
    console.log('wrote project-active.png');

    // 3. Detail: open the command palette and type a query.
    await ctx.key('Control+k');
    await sleep(400);
    await ctx.type('attractor');
    await sleep(500);
    await ctx.shot(join(IMAGES, 'project-detail.png'));
    console.log('wrote project-detail.png');

    // 4. Social card composited from the real preview frame.
    await composeSocial(ctx);

    await ctx.close();
  } finally {
    server.kill();
  }
}

async function composeSocial(ctx) {
  const bg = join(IMAGES, 'project-preview.png');
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;width:1280px;height:640px;overflow:hidden}
    .bg{position:absolute;inset:0;background:url('file://${bg}') center/cover;filter:saturate(1.05)}
    .scrim{position:absolute;inset:0;background:linear-gradient(100deg,rgba(6,6,13,.92) 0%,rgba(6,6,13,.55) 46%,rgba(6,6,13,.15) 100%)}
    .wrap{position:relative;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 72px;box-sizing:border-box;font-family:'JetBrains Mono',ui-monospace,monospace}
    .kicker{color:#22d3ee;font-size:20px;letter-spacing:.32em;text-transform:uppercase}
    h1{color:#e8eaf6;font-size:74px;margin:.18em 0 .1em;letter-spacing:-.02em;font-weight:700}
    .sub{color:#9aa0c0;font-size:22px;max-width:640px;line-height:1.5}
    .foot{position:absolute;left:72px;bottom:52px;color:#6a6f90;font-size:17px;letter-spacing:.18em;text-transform:uppercase}
    .accent{position:absolute;left:0;top:0;bottom:0;width:6px;background:linear-gradient(#22d3ee,#e879f9)}
  </style></head><body>
    <div class="bg"></div><div class="scrim"></div><div class="accent"></div>
    <div class="wrap">
      <div class="kicker">Zazie Productions</div>
      <h1>NEXUS // Creative Cortex</h1>
      <div class="sub">A procedural creative-cognition operating system &mdash; force-directed concept atlas, seeded field-notes vault, live vision stream.</div>
    </div>
    <div class="foot">v4.1 &middot; generative &middot; browser-native</div>
  </body></html>`;
  const tmpHtml = join(tmpdir(), 'social.html');
  writeFileSync(tmpHtml, html);
  const page2 = ctx.kind === 'playwright'
    ? await (await import('playwright')).chromium.launch({ args: ['--no-sandbox'] }).then(async (b) => { const p = await b.newPage({ viewport: { width: 1280, height: 640 } }); await p.goto(`file://${tmpHtml}`); await p.screenshot({ path: join(IMAGES, 'github-social-preview.png') }); await b.close(); return null; })
    : await ctx.page.browser().newPage().then(async (p) => { await p.setViewport({ width: 1280, height: 640 }); await p.goto(`file://${tmpHtml}`, { waitUntil: 'networkidle0' }); await p.screenshot({ path: join(IMAGES, 'github-social-preview.png') }); await p.close(); return null; });
  console.log('wrote github-social-preview.png');
  return page2;
}

capture().then(
  () => { console.log('done'); process.exit(0); },
  (e) => { console.error('capture failed:', e); process.exit(1); },
);
