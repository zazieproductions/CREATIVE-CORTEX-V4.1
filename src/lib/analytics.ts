/**
 * Analytics series builders.
 *
 * Deterministic pseudo-metric streams that drive the Cortex Analytics module.
 * They are decorative instrumentation, but they are seeded so the dashboard is
 * stable across reloads and screenshots.
 */
import { mulberry32, between } from './rng';
import { DOMAINS } from './banks';
import { SEEDS } from './config';

export function buildActivitySeries(seed = SEEDS.activity): { t: number; v: number }[] {
  const rng = mulberry32(seed);
  const out: { t: number; v: number }[] = [];
  let v = 50;
  for (let i = 0; i < 64; i++) {
    v += (rng() - 0.5) * 24 + Math.sin(i / 6) * 3;
    v = Math.max(8, Math.min(98, v));
    out.push({ t: i, v });
  }
  return out;
}
export function buildDomainRadar(): { domain: string; value: number }[] {
  const rng = mulberry32(SEEDS.radar);
  return DOMAINS.map((d) => ({ domain: d, value: Math.round(between(rng, 35, 96)) }));
}

export function buildVelocity(): { label: string; value: number }[] {
  const rng = mulberry32(SEEDS.velocity);
  return DOMAINS.map((d) => ({
    label: d.split(' ')[0],
    value: Math.round(between(rng, 12, 60)),
  }));
}
