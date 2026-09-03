/**
 * Field-note corpus generator.
 *
 * The vault is not a hand-written database; it is synthesised once at boot from
 * a fixed seed. Each note is composed from a title template, a body template, a
 * domain, a concept anchor and a set of scores. Links are then wired with a
 * same-domain preference plus occasional cross-domain bridges, mirroring the way
 * the concept atlas connects clusters.
 *
 * Pure and deterministic: `generateNotes()` always returns the same 327 notes.
 */
import { mulberry32, pick, pickN, between, type Rng } from './rng';
import { DOMAINS, ADJ, CONCEPT_NOUNS, PHENOMENA, TAG_POOL } from './banks';
import { CONCEPTS } from './concepts';
import { NOTE_COUNT, SEEDS } from './config';
import type { Note } from '../types';

const TITLE_FMT: ((rng: Rng, adj: string, noun: string, domain: string, ph: string) => string)[] = [
  (r, a, n, d) => `${a} ${n} in ${d}`,
  (_r, a, n, _d, p) => `On the ${a} ${n} of ${p}`,
  (_r, _a, n, _d, p) => `${n} of ${p}: A Field Note`,
  (_r, a, n, d) => `${d}: ${a} ${n}`,
  (_r, a, n, _d, p) => `${a} ${n} Against ${p}`,
  (_r, _a, n, d, p) => `Where ${n} Meet ${p} (${d})`,
  (_r, a, n, d) => `${a} ${n} — a ${d} Sketch`,
  (_r, _a, n, _d, p) => `${p}, Refracted Through ${n}`,
];

const CONTENT: ((rng: Rng, noun: string, adj: string, domain: string, ph: string, verb: string) => string)[] = [
  (_r, n, a, d, p) =>
    `${n} within ${d} behave less like structures than ${a} attractors — they persist only because the surrounding field refuses to forget ${p}. Stability, then, is a memory artifact rather than a property.`,
  (_r, n, a, _d, p, v) =>
    `Treat ${p} as a ${a} substrate and the paradox ${v}s: ${n} are not causes but the residue of causes, scar tissue of a system that learned to expect itself.`,
  (_r, n, a, d, p) =>
    `Every ${d} framework smuggles in a hidden ${a} ontology. To expose it, invert the ${n} — what survives the removal of the noun is the actual operator acting on ${p}.`,
  (_r, n, a, d, p, v) =>
    `${n} do not ${v} in isolation; they ${v} across the gradient of ${p}. Map the gradient and the ${d} resolves into a single, ${a} surface.`,
  (_r, n, a, d, p) =>
    `The ${a} reading of ${d} is that ${n} are borrowed from ${p}, then never returned. Interest compounds as the field forgets the original lender.`,
  (_r, n, a, d, p, v) =>
    `Forget causality. In ${d}, ${n} and ${p} ${v} each other into being — a ${a} reciprocity where neither is prior. The observer is the remainder.`,
  (_r, n, a, d, p) =>
    `A ${a} ${n} is a promise the ${d} makes to itself about ${p}, then quietly breaks. Track the breaks, not the promise, and the architecture becomes legible.`,
  (_r, n, a, d, p, v) =>
    `${p} is the limit case of ${d}: as ${n} ${v} toward zero they reveal the ${a} grain of the substrate itself. Edge conditions are not exceptions, they are diagnostics.`,
];

/** Fixed corpus epoch; note timestamps are derived backwards from here. */
const NOW = Date.UTC(2024, 4, 17, 9, 0, 0);

const NOTE_VERBS = [
  'dissolve', 'invert', 'fold', 'refract', 'propagate', 'sediment', 'leak',
  'phase-lock', 'anneal', 'cascade', 'decode', 'redshift', 'entangle', 'shear',
];

export function generateNotes(count = NOTE_COUNT): Note[] {
  const rng = mulberry32(SEEDS.notes);
  const notes: Note[] = [];
  for (let i = 0; i < count; i++) {
    const domain = pick(rng, DOMAINS);
    const domainConcepts = CONCEPTS.filter((c) => c.domain === domain);
    const concept = pick(rng, domainConcepts);
    const adj = pick(rng, ADJ).replace(/-$/, '');
    const noun = pick(rng, CONCEPT_NOUNS);
    const ph = pick(rng, PHENOMENA);
    const verb = pick(rng, NOTE_VERBS);
    const title = pick(rng, TITLE_FMT)(rng, adj, noun, domain, ph);
    const content = pick(rng, CONTENT)(rng, noun, adj, domain, ph, verb);
    const tags: string[] = [...pickN(rng, TAG_POOL, 2 + Math.floor(rng() * 3))];
    if (!tags.includes(concept.label.split(' ')[0].toLowerCase())) tags.push(concept.label.toLowerCase().replace(/\s+/g, '-'));
    const created = NOW - Math.floor(between(rng, 0, 60 * 24 * 3600 * 1000));
    notes.push({
      id: `N-${String(i + 1).padStart(4, '0')}`,
      title,
      domain,
      conceptId: concept.id,
      tags,
      content,
      links: [],
      created,
      coherence: Math.round(between(rng, 41, 99)),
      resonance: Math.round(between(rng, 20, 98)),
      novelty: Math.round(between(rng, 12, 97)),
      pinned: i < 5,
    });
  }

  // Build links: prefer same domain, occasionally bridge across domains.
  const byDomain: Record<string, Note[]> = {};
  notes.forEach((n) => (byDomain[n.domain] ??= []).push(n));
  notes.forEach((n) => {
    const same = (byDomain[n.domain] ?? []).filter((m) => m.id !== n.id);
    const local = pickN(rng, same, 2 + Math.floor(rng() * 3)).map((m) => m.id);
    if (rng() < 0.4) {
      const other = pickN(rng, notes.filter((m) => m.domain !== n.domain), 1 + Math.floor(rng() * 2)).map((m) => m.id);
      n.links = [...local, ...other];
    } else {
      n.links = local;
    }
  });
  return notes;
}
