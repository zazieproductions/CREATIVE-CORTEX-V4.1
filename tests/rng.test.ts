import { describe, it, expect } from 'vitest';
import { mulberry32, pick, pickN, between } from '../src/lib/rng';

describe('mulberry32', () => {
  it('is deterministic for a fixed seed', () => {
    const a = mulberry32(1337);
    const b = mulberry32(1337);
    const seqA = Array.from({ length: 100 }, () => a());
    const seqB = Array.from({ length: 100 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('diverges for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = Array.from({ length: 8 }, () => a());
    const seqB = Array.from({ length: 8 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  it('stays within [0, 1)', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('pick / pickN / between', () => {
  const arr = ['a', 'b', 'c', 'd', 'e'] as const;

  it('pick returns members of the array', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 50; i++) expect(arr).toContain(pick(rng, arr));
  });

  it('pickN returns unique members up to n', () => {
    const rng = mulberry32(9);
    for (let i = 0; i < 50; i++) {
      const got = pickN(rng, arr, 3);
      expect(got).toHaveLength(3);
      expect(new Set(got).size).toBe(3);
      got.forEach((x) => expect(arr).toContain(x));
    }
  });

  it('between stays within bounds', () => {
    const rng = mulberry32(3);
    for (let i = 0; i < 200; i++) {
      const v = between(rng, 10, 20);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThanOrEqual(20);
    }
  });
});
