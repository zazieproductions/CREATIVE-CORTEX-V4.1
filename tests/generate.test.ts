import { describe, it, expect } from 'vitest';
import { generateNotes } from '../src/lib/notes';
import { CONCEPTS, EDGES } from '../src/lib/concepts';
import { DOMAINS, DOMAIN_COLORS } from '../src/lib/banks';
import { generatePalette, SEED_PALETTES } from '../src/lib/palettes';
import { buildActivitySeries, buildDomainRadar, buildVelocity } from '../src/lib/analytics';
import { PANEL_META, DEFAULT_PANELS, STAGE_W, STAGE_H } from '../src/lib/layout';
import { NOTE_COUNT } from '../src/lib/config';

const HEX_RE = /^#[0-9a-f]{6}$/i;

describe('field-note corpus', () => {
  const notes = generateNotes();

  it(`generates exactly NOTE_COUNT (${NOTE_COUNT}) notes`, () => {
    expect(notes).toHaveLength(NOTE_COUNT);
  });

  it('uses stable, zero-padded, unique ids', () => {
    const ids = notes.map((n) => n.id);
    expect(new Set(ids).size).toBe(notes.length);
    for (const id of ids.slice(0, 20)) expect(id).toMatch(/^N-\d{4}$/);
  });

  it('anchors every note to a real domain and concept', () => {
    const conceptIds = new Set(CONCEPTS.map((c) => c.id));
    for (const n of notes) {
      expect(DOMAINS).toContain(n.domain);
      expect(conceptIds.has(n.conceptId)).toBe(true);
    }
  });

  it('all inter-note links resolve to existing notes', () => {
    const ids = new Set(notes.map((n) => n.id));
    const dangling = notes.flatMap((n) => n.links).filter((l) => !ids.has(l));
    expect(dangling).toHaveLength(0);
  });

  it('keeps scores within their documented ranges', () => {
    for (const n of notes) {
      expect(n.coherence).toBeGreaterThanOrEqual(41);
      expect(n.coherence).toBeLessThanOrEqual(99);
      expect(n.resonance).toBeGreaterThanOrEqual(20);
      expect(n.resonance).toBeLessThanOrEqual(98);
      expect(n.novelty).toBeGreaterThanOrEqual(12);
      expect(n.novelty).toBeLessThanOrEqual(97);
    }
  });

  it('is deterministic across invocations', () => {
    expect(generateNotes()).toEqual(notes);
  });
});

describe('concept atlas', () => {
  it('has three concepts per domain', () => {
    expect(CONCEPTS).toHaveLength(DOMAINS.length * 3);
    for (const d of DOMAINS) {
      expect(CONCEPTS.filter((c) => c.domain === d)).toHaveLength(3);
    }
  });

  it('edges reference real nodes with no self-loops or duplicates', () => {
    const ids = new Set(CONCEPTS.map((c) => c.id));
    for (const e of EDGES) {
      expect(ids.has(e.source)).toBe(true);
      expect(ids.has(e.target)).toBe(true);
      expect(e.source).not.toBe(e.target);
    }
    expect(new Set(EDGES.map((e) => e.id)).size).toBe(EDGES.length);
  });

  it('every domain has a colour', () => {
    for (const d of DOMAINS) expect(DOMAIN_COLORS[d]).toMatch(HEX_RE);
  });
});

describe('palette foundry', () => {
  it('generates six valid hex swatches', () => {
    const p = generatePalette(20240517);
    expect(p.swatches).toHaveLength(6);
    p.swatches.forEach((s) => expect(s).toMatch(HEX_RE));
  });

  it('is deterministic per seed and differs across seeds', () => {
    expect(generatePalette(1).swatches).toEqual(generatePalette(1).swatches);
    expect(generatePalette(1).swatches).not.toEqual(generatePalette(2).swatches);
  });

  it('seed palettes are well-formed', () => {
    for (const p of SEED_PALETTES) {
      expect(p.swatches).toHaveLength(6);
      p.swatches.forEach((s) => expect(s).toMatch(HEX_RE));
    }
  });
});

describe('analytics series', () => {
  it('activity series is 64 samples clamped to [8, 98]', () => {
    const s = buildActivitySeries();
    expect(s).toHaveLength(64);
    s.forEach((d) => {
      expect(d.v).toBeGreaterThanOrEqual(8);
      expect(d.v).toBeLessThanOrEqual(98);
    });
  });

  it('radar and velocity cover every domain', () => {
    expect(buildDomainRadar()).toHaveLength(DOMAINS.length);
    expect(buildVelocity()).toHaveLength(DOMAINS.length);
  });

  it('is deterministic', () => {
    expect(buildActivitySeries()).toEqual(buildActivitySeries());
  });
});

describe('layout', () => {
  it('panel meta and default panels share the same ids', () => {
    expect(PANEL_META.map((m) => m.id).sort()).toEqual(DEFAULT_PANELS.map((p) => p.id).sort());
  });

  it('default panels fit inside the stage', () => {
    for (const p of DEFAULT_PANELS) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.x + p.w).toBeLessThanOrEqual(STAGE_W);
      expect(p.y + p.h).toBeLessThanOrEqual(STAGE_H);
    }
  });
});
