import { describe, expect, it } from 'vitest';
import { CONCEPTS, EDGES } from '../../src/lib/concepts';
import { DOMAINS } from '../../src/lib/banks';

describe('knowledge graph', () => {
  it('has three curated concepts per domain', () => {
    expect(CONCEPTS).toHaveLength(DOMAINS.length * 3);
    for (const domain of DOMAINS) {
      expect(CONCEPTS.filter((c) => c.domain === domain)).toHaveLength(3);
    }
  });

  it('has unique node ids', () => {
    expect(new Set(CONCEPTS.map((c) => c.id)).size).toBe(CONCEPTS.length);
  });

  it('places every node inside the viewport bounds', () => {
    for (const c of CONCEPTS) {
      expect(c.x).toBeGreaterThan(0);
      expect(c.x).toBeLessThan(1080);
      expect(c.y).toBeGreaterThan(0);
      expect(c.y).toBeLessThan(720);
    }
  });

  it('edges reference existing nodes and never loop to themselves', () => {
    const ids = new Set(CONCEPTS.map((c) => c.id));
    for (const e of EDGES) {
      expect(ids.has(e.source)).toBe(true);
      expect(ids.has(e.target)).toBe(true);
      expect(e.source).not.toBe(e.target);
      expect(e.weight).toBeGreaterThan(0);
    }
  });

  it('has unique edge ids', () => {
    expect(new Set(EDGES.map((e) => e.id)).size).toBe(EDGES.length);
  });

  it('every domain has intra-domain clustering edges', () => {
    for (const domain of DOMAINS) {
      const nodes = CONCEPTS.filter((c) => c.domain === domain).map((c) => c.id);
      const intra = EDGES.filter(
        (e) => nodes.includes(e.source) && nodes.includes(e.target),
      );
      expect(intra.length).toBeGreaterThanOrEqual(3);
    }
  });
});
