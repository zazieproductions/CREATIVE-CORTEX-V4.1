/**
 * Palette foundry.
 *
 * Generates candidate colour palettes from a seed using HSL arithmetic, plus a
 * few curated seed palettes. `hslToHex` is implemented locally so the module is
 * free of colour libraries; it is unit-tested in `tests/generate.test.ts`.
 */
import { mulberry32, pick } from './rng';
import type { Palette } from '../types';

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return `#${[f(0), f(8), f(4)].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export function generatePalette(seed: number): Palette {
  const rng = mulberry32(seed);
  const baseH = Math.floor(rng() * 360);
  const schemes = [0, 30, 60, 180, 210, 300] as const;
  const swatches: string[] = [];
  for (let i = 0; i < 6; i++) {
    const h = (baseH + schemes[i % schemes.length] + (rng() - 0.5) * 22 + 360) % 360;
    const s = 55 + rng() * 35;
    const l = 30 + rng() * 45;
    swatches.push(hslToHex(h, s, l));
  }
  const names = ['Hyperstition', 'Torsion', 'Lantern', 'Substrate', 'Rhizome', 'Spectral', 'Anthropic', 'Vellum', 'Cinder', 'Mirror'];
  return { id: `pal-${seed}`, name: `${pick(rng, names)} ${pick(rng, ['Drift', 'Bloom', 'Fade', 'Crux', 'Veil'])}`, swatches };
}

export const SEED_PALETTES: Palette[] = [
  { id: 'pal-seed-1', name: 'Pale Lantern', swatches: ['#0b0b14', '#141a2e', '#22d3ee', '#5eead4', '#e879f9', '#fbbf24'] },
  { id: 'pal-seed-2', name: 'Strange Loop', swatches: ['#0a0a0f', '#1a1033', '#8b5cf6', '#c084fc', '#f472b6', '#34d399'] },
  { id: 'pal-seed-3', name: 'Entropy Sink', swatches: ['#08090d', '#15171f', '#2dd4bf', '#38bdf8', '#a78bfa', '#fb7185'] },
];
