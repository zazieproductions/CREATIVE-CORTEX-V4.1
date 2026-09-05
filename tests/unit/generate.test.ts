import { describe, expect, it } from 'vitest';
import {
  generateNotes,
  SCHEMES,
  CODE_PROTOS,
  generatePalette,
  SEED_PALETTES,
  buildActivitySeries,
  buildDomainRadar,
  buildVelocity,
} from '../../src/lib/generate';
import { DOMAINS } from '../../src/lib/banks';
import { CONCEPTS } from '../../src/lib/concepts';

describe('generateNotes', () => {
  const notes = generateNotes();

  it('generates the documented vault size of 327 notes', () => {
    expect(notes).toHaveLength(327);
  });

  it('is deterministic across calls', () => {
    const again = generateNotes();
    expect(again).toEqual(notes);
  });

  it('assigns unique, ordered ids', () => {
    expect(notes[0].id).toBe('N-0001');
    expect(notes[notes.length - 1].id).toBe('N-0327');
    expect(new Set(notes.map((n) => n.id)).size).toBe(327);
  });

  it('only references concept ids that exist and match the note domain', () => {
    const conceptIds = new Set(CONCEPTS.map((c) => c.id));
    const conceptDomain = new Map(CONCEPTS.map((c) => [c.id, c.domain]));
    for (const n of notes) {
      expect(conceptIds.has(n.conceptId)).toBe(true);
      expect(conceptDomain.get(n.conceptId)).toBe(n.domain);
    }
  });

  it('keeps scored metrics within their documented ranges', () => {
    for (const n of notes) {
      expect(n.coherence).toBeGreaterThanOrEqual(41);
      expect(n.coherence).toBeLessThanOrEqual(99);
      expect(n.resonance).toBeGreaterThanOrEqual(20);
      expect(n.resonance).toBeLessThanOrEqual(98);
      expect(n.novelty).toBeGreaterThanOrEqual(12);
      expect(n.novelty).toBeLessThanOrEqual(97);
    }
  });

  it('links only to existing note ids, never to itself', () => {
    const ids = new Set(notes.map((n) => n.id));
    for (const n of notes) {
      expect(n.links.length).toBeGreaterThan(0);
      for (const link of n.links) {
        expect(ids.has(link)).toBe(true);
        expect(link).not.toBe(n.id);
      }
    }
  });

  it('pins the first five notes only', () => {
    expect(notes.filter((n) => n.pinned)).toHaveLength(5);
    for (let i = 0; i < 5; i++) expect(notes[i].pinned).toBe(true);
    for (let i = 5; i < notes.length; i++) expect(notes[i].pinned).toBe(false);
  });
});

describe('SCHEMES', () => {
  it('contains six codenamed schemes with valid statuses', () => {
    expect(SCHEMES).toHaveLength(6);
    const statuses = ['latent', 'seeding', 'cascading', 'entangled'];
    for (const s of SCHEMES) {
      expect(s.codename).toMatch(/[A-Z]/);
      expect(statuses).toContain(s.status);
      expect(s.impact).toBeGreaterThanOrEqual(0);
      expect(s.impact).toBeLessThanOrEqual(100);
      expect(s.phases).toHaveLength(4);
    }
  });
});

describe('CODE_PROTOS', () => {
  it('ships the six prototype sketches with code bodies', () => {
    expect(CODE_PROTOS).toHaveLength(6);
    for (const p of CODE_PROTOS) {
      expect(p.code.length).toBeGreaterThan(40);
      expect(p.language).toBeTruthy();
      expect(p.domain).toBeTruthy();
    }
  });
});

describe('palettes', () => {
  it('generatePalette emits six valid hex swatches', () => {
    const pal = generatePalette(7);
    expect(pal.swatches).toHaveLength(6);
    for (const s of pal.swatches) expect(s).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('is deterministic per seed', () => {
    expect(generatePalette(11)).toEqual(generatePalette(11));
  });

  it('seed palettes are valid hex', () => {
    for (const p of SEED_PALETTES) {
      expect(p.swatches).toHaveLength(6);
      for (const s of p.swatches) expect(s).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('analytics series', () => {
  it('buildActivitySeries returns 64 bounded samples', () => {
    const series = buildActivitySeries();
    expect(series).toHaveLength(64);
    for (const d of series) {
      expect(d.v).toBeGreaterThanOrEqual(8);
      expect(d.v).toBeLessThanOrEqual(98);
    }
  });

  it('radar and velocity cover every domain', () => {
    expect(buildDomainRadar()).toHaveLength(DOMAINS.length);
    expect(buildVelocity()).toHaveLength(DOMAINS.length);
  });
});
