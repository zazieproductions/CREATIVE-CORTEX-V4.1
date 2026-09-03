import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const PUBLIC = resolve(__dirname, '../public');
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('public assets', () => {
  it('atlas-bg.png exists and is a valid PNG', () => {
    const path = resolve(PUBLIC, 'atlas-bg.png');
    expect(existsSync(path)).toBe(true);
    const buf = readFileSync(path);
    expect(buf.subarray(0, 8).equals(PNG_SIG)).toBe(true);
  });

  it('favicon.svg exists and is well-formed SVG', () => {
    const path = resolve(PUBLIC, 'favicon.svg');
    expect(existsSync(path)).toBe(true);
    const svg = readFileSync(path, 'utf8');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.trim().endsWith('</svg>')).toBe(true);
  });
});
