import { describe, expect, it } from 'vitest';
import { mulberry32, pick, pickN, between, type Rng } from '../../src/lib/rng';

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(1337);
    const b = mulberry32(1337);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    let sawDifference = false;
    for (let i = 0; i < 100; i++) if (a() !== b()) { sawDifference = true; break; }
    expect(sawDifference).toBe(true);
  });

  it('stays within [0, 1)', () => {
    const rng = mulberry32(20240517);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('pick / pickN / between', () => {
  const rng: Rng = mulberry32(42);

  it('pick returns an element of the array', () => {
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i++) expect(arr).toContain(pick(rng, arr));
  });

  it('pickN returns unique elements without replacement', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = pickN(rng, arr, 4);
    expect(out).toHaveLength(4);
    expect(new Set(out).size).toBe(4);
    for (const v of out) expect(arr).toContain(v);
  });

  it('between stays within the requested bounds', () => {
    for (let i = 0; i < 100; i++) {
      const v = between(rng, 10, 20);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThan(20);
    }
  });
});
