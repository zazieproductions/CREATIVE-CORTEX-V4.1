import { describe, expect, it } from 'vitest';
import { VisionGenerator, synthesize, makeVision } from '../../src/lib/vision';
import { mulberry32 } from '../../src/lib/rng';

describe('VisionGenerator', () => {
  it('is deterministic per seed (ignoring the wall-clock timestamp)', () => {
    const a = new VisionGenerator();
    const b = new VisionGenerator();
    for (let i = 0; i < 20; i++) {
      const x = a.next();
      const y = b.next();
      // `ts` is Date.now() and legitimately differs between instances;
      // the generative payload (id, text, tags) must be identical.
      expect({ id: x.id, text: x.text, tags: x.tags }).toEqual({ id: y.id, text: y.text, tags: y.tags });
    }
  });

  it('emits monotonically increasing ids and text', () => {
    const gen = new VisionGenerator();
    let last = gen.next();
    expect(last.id).toBe(1);
    expect(last.text.length).toBeGreaterThan(0);
    expect(last.tags.length).toBeGreaterThan(0);
    for (let i = 0; i < 10; i++) {
      const n = gen.next();
      expect(n.id).toBeGreaterThan(last.id);
      expect(n.text.length).toBeGreaterThan(0);
      last = n;
    }
  });
});

describe('makeVision', () => {
  it('returns text and at least one tag', () => {
    const { text, tags } = makeVision(mulberry32(9));
    expect(text.length).toBeGreaterThan(0);
    expect(tags.length).toBeGreaterThanOrEqual(1);
  });
});

describe('synthesize', () => {
  it('bakes the operands into the title', () => {
    const r = synthesize('Recursion', 'Mirrors', 123);
    expect(r.title).toContain('Recursion');
    expect(r.title).toContain('Mirrors');
  });

  it('scores are bounded and deterministic', () => {
    const a = synthesize('X', 'Y', 5);
    const b = synthesize('X', 'Y', 5);
    expect(a).toEqual(b);
    expect(a.novelty).toBeGreaterThanOrEqual(40);
    expect(a.novelty).toBeLessThanOrEqual(98);
    expect(a.coherence).toBeGreaterThanOrEqual(35);
    expect(a.resonance).toBeGreaterThanOrEqual(30);
  });
});
