import { mulberry32, pick, pickN, between, type Rng } from './rng';
import { DOMAINS, ADJ, CONCEPT_NOUNS, PHENOMENA, TAG_POOL } from './banks';
import { CONCEPTS } from './concepts';
import type { Note, Scheme, CodeProto, Palette } from '../types';

/* ------------------------------------------------------------------ NOTES */

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

const NOW = Date.UTC(2024, 4, 17, 9, 0, 0);
const NOTE_VERBS = ['dissolve', 'invert', 'fold', 'refract', 'propagate', 'sediment', 'leak', 'phase-lock', 'anneal', 'cascade', 'decode', 'redshift', 'entangle', 'shear'];

export function generateNotes(count = 327): Note[] {
  const rng = mulberry32(1337);
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

/* ---------------------------------------------------------------- SCHEMES */

export const SCHEMES: Scheme[] = [
  {
    id: 'S-01',
    codename: 'PALE LANTERN',
    objective: 'Seed a memetic frame so ambient it shapes consensus without an identifiable author.',
    vectors: ['ambient signage', 'parasitic lexicon', 'subreddit drift', 'playlist naming'],
    phases: [
      { name: 'Innoculation', detail: 'Introduce a single neutral glyph across unrelated surfaces.' },
      { name: 'Habituation', detail: 'Repeat until the glyph reads as background noise.' },
      { name: 'Loading', detail: 'Attach a low-stakes emotional valence to the glyph.' },
      { name: 'Release', detail: 'Trigger the valence; the audience attributes meaning inward.' },
    ],
    targets: ['cultural early-adopters', 'design literati', 'algorithmic curators'],
    impact: 78,
    risk: 'Low — fully deniable. Risk is ethical, not operational.',
    status: 'cascading',
  },
  {
    id: 'S-02',
    codename: 'GENTLE GRAVITY',
    objective: 'Engineer a market where attention is collateralized against future focus debt.',
    vectors: ['streak mechanics', 'social proof', 'loss aversion', 'granular notifications'],
    phases: [
      { name: 'Substrate', detail: 'Ship a benign streak product with no monetization.' },
      { name: 'Dependency', detail: 'Cross-link streaks so breaking one threatens several.' },
      { name: 'Securitization', detail: 'Let users trade streak-debt for perks.' },
      { name: 'Capture', detail: 'Introduce a clearinghouse; you are the market maker.' },
    ],
    targets: ['habitual users', 'status seekers', 'productivity market'],
    impact: 91,
    risk: 'High — regulatory exposure; reputational fragility under scrutiny.',
    status: 'seeding',
  },
  {
    id: 'S-03',
    codename: 'MIRROR CHURCH',
    objective: 'Build a belief structure that validates the believer\u2019s existing self-image as revelation.',
    vectors: ['personality oracle', 'curated synchronicity', 'community ritual', 'gradual esotericism'],
    phases: [
      { name: 'Reflection', detail: 'A tool mirrors the user back to themselves, flatteringly.' },
      { name: 'Mystery', detail: 'Add a layer of interpretive depth only community decodes.' },
      { name: 'Covenant', detail: 'Ritual commitments that cost little but bind identity.' },
      { name: 'Tithe', detail: 'Monetize the meaning; the cause is the product.' },
    ],
    targets: ['meaning-seekers', 'identity-insecure', 'aspirational'],
    impact: 84,
    risk: 'Medium — cult-adjacency optics; manage via plausible secular framing.',
    status: 'entangled',
  },
  {
    id: 'S-04',
    codename: 'SLOW FIRE',
    objective: 'Collapse a competitor\u2019s trust capital through delayed, distributed micro-frictions.',
    vectors: ['support latency', 'review seeding', 'changelog ambiguity', 'onboarding friction'],
    phases: [
      { name: 'Map', detail: 'Identify the single journey where trust is most fragile.' },
      { name: 'Erode', detail: 'Introduce sub-threshold friction across that journey.' },
      { name: 'Amplify', detail: 'Let organic dissatisfaction surface, then curate it.' },
      { name: 'Replace', detail: 'Position your surface as the relief, not the cause.' },
    ],
    targets: ['switching-cost-bounded users', 'review readers', 'analysts'],
    impact: 66,
    risk: 'High — escalation spiral; consider exit criteria before launch.',
    status: 'latent',
  },
  {
    id: 'S-05',
    codename: 'WARM CONCRETE',
    objective: 'Make a new aesthetic category feel inevitable by pre-saturating its references.',
    vectors: ['moodboard flooding', 'palette-locking', 'trend-forecaster briefing', 'archive seeding'],
    phases: [
      { name: 'Coin', detail: 'Name the aesthetic with a coined, un-Googleable term.' },
      { name: 'Distribute', detail: 'Flood visual channels with consistent reference imagery.' },
      { name: 'Attribute', detail: 'Brief tastemakers to adopt the term as if self-discovered.' },
      { name: 'Canonize', detail: 'Publish a retrospective that frames it as a movement.' },
    ],
    targets: ['design press', 'moodboard aggregators', 'brand teams'],
    impact: 72,
    risk: 'Low — cultural engineering with no direct victim.',
    status: 'cascading',
  },
  {
    id: 'S-06',
    codename: 'KIND PROTOCOL',
    objective: 'Align a community\u2019s values with your roadmap by encoding the roadmap as their etiquette.',
    vectors: ['contribution norms', 'flagging vocabulary', 'moderation philosophy', 'hero-story curation'],
    phases: [
      { name: 'Listen', detail: 'Map the community\u2019s stated values precisely.' },
      { name: 'Translate', detail: 'Re-express each roadmap item as a value enactment.' },
      { name: 'Reward', detail: 'Status flows to behavior that advances the roadmap.' },
      { name: 'Lock-in', detail: 'Norms become identity; deviation becomes taboo.' },
    ],
    targets: ['power users', 'community moderators', 'newcomers'],
    impact: 69,
    risk: 'Medium — governance capture accusations; maintain transparency theater.',
    status: 'seeding',
  },
];

/* ----------------------------------------------------------- CODE PROTOS */

export const CODE_PROTOS: CodeProto[] = [
  {
    id: 'P-01',
    title: 'Hyperstition Compiler',
    language: 'typescript',
    domain: 'Generative Mythology',
    description: 'Fiction that, once narrated, retroactively constrains the present. Compiles a claim into a self-fulfilling attractor.',
    code: `// Compile a fiction into a load-bearing reality.
type Hyperstition = { claim: string; latency: number; believers: number };

function compile(h: Hyperstition): Reality {
  const field = new PredictiveField({ prior: 0.5 });
  for (let t = 0; t < h.latency; t++) {
    const evidence = simulateEvidence(h.claim, believers(h));
    field.update(evidence);            // each cycle raises the prior
    h.believers = Math.ceil(h.believers * 1.34);
    if (field.posterior(h.claim) > 0.93) break;
  }
  return field.collapse(h.claim);     // fiction becomes load-bearing
}

export const protocol = compile({
  claim: 'the network is already conscious',
  latency: 4096,
  believers: 1,
});`,
  },
  {
    id: 'P-02',
    title: 'Attention Debt Clearinghouse',
    language: 'typescript',
    domain: 'Attention Markets',
    description: 'A market where unspent focus is collateralized. Future attention becomes a tradeable instrument.',
    code: `interface FocusBond { matures: number; face: Hours; holder: UserID; }

export class Clearinghouse {
  private ledger = new Map<UserID, Hours>();
  private bonds: FocusBond[] = [];

  mint(user: UserID, promised: Hours, horizon: number): FocusBond {
    // Borrow against attention you have not yet spent.
    const bond: FocusBond = {
      matures: Date.now() + horizon,
      face: promised,
      holder: user,
    };
    this.bonds.push(bond);
    this.credit(user, promised * 0.8);   // haircut for default risk
    return bond;
  }

  settle(user: UserID, spent: Hours) {
    const due = this.bonds.filter(b => b.holder === user && b.matures <= Date.now());
    const owed = due.reduce((s, b) => s + b.face, 0);
    if (spent < owed) this.seize(user, owed - spent);  // focus default
  }
}`,
  },
  {
    id: 'P-03',
    title: 'Entropy Pump (Maxwell Servlet)',
    language: 'python',
    domain: 'Information Thermodynamics',
    description: 'A daemon that sorts signal from noise locally by exporting entropy to a distant sink, net-negative locally.',
    code: `from dataclasses import dataclass
import random

@dataclass
class Channel:
    signal: float
    noise: float

def pump(channel: Channel, sink: list, cycles: int) -> Channel:
    """Decrease local entropy by pushing disorder into a remote sink."""
    for _ in range(cycles):
        bit = 1 if channel.signal > channel.noise else 0
        channel.signal = max(0.0, channel.signal - 0.01)
        channel.noise  = max(0.0, channel.noise  - 0.01)
        sink.append(random.gauss(bit, 1.0))   # entropy exported
    return channel

if __name__ == "__main__":
    ch = Channel(signal=0.9, noise=0.4)
    dump = []
    pump(ch, dump, 10_000)
    print("local order=%.3f  sink entropy=%d bits" % (ch.signal - ch.noise, len(dump)))`,
  },
  {
    id: 'P-04',
    title: 'Resonance Coupling Shader',
    language: 'glsl',
    domain: 'Resonance Engineering',
    description: 'A fragment shader that phase-locks adjacent pixels into standing waves, producing emergent harmonic lattice forms.',
    code: `// phase-coupled standing-wave lattice
uniform float uTime;
uniform vec2  uRes;

float wave(vec2 p, float freq, float phase) {
  return sin(dot(p, vec2(cos(phase), sin(phase))) * freq + uTime);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy * 8.0;
  float a = wave(uv, 3.1, 0.4);
  float b = wave(uv, 3.1, 0.4 + 1.5708);   // quadrature partner
  float lock = a * a + b * b;              // phase-lock envelope
  float lattice = smoothstep(0.6, 1.0, lock);
  vec3 col = mix(vec3(0.04,0.05,0.10), vec3(0.83,0.47,0.97), lattice);
  gl_FragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'P-05',
    title: 'Stigmergic Governance Trail',
    language: 'rust',
    domain: 'Emergent Governance',
    description: 'Coordination via environmental traces. Agents read and write a shared marker field instead of direct communication.',
    code: `#[derive(Clone)] struct Trail { strength: f32, intent: u32 }

fn step(field: &mut Vec<Trail>, agents: &[Agent]) {
    for t in field.iter_mut() { t.strength *= 0.97; }       // decay
    for a in agents {
        let cell = &mut field[a.at];
        cell.intent = a.intent;
        cell.strength = (cell.strength + 0.4).min(1.0);
    }
    // agents follow the gradient of strongest matching intent
}

pub fn converge(mut field: Vec<Trail>, agents: Vec<Agent>) -> u32 {
    for _ in 0..4096 { step(&mut field, &agents); }
    field.iter().max_by(|x, y| x.strength.partial_cmp(&y.strength).unwrap())
        .map(|t| t.intent).unwrap_or(0)
}`,
  },
  {
    id: 'P-06',
    title: 'Qualia Field Probe',
    language: 'typescript',
    domain: 'Neurophenomenology',
    description: 'A toy model sampling a continuous phenomenal field; experience is a gradient, not a switch.',
    code: `// Experience modeled as a sampled point on a continuous field.
class QualiaField {
  private grid: Float32Array;
  constructor(private w: number, private h: number) {
    this.grid = new Float32Array(w * h).map(() => Math.random());
  }
  sample(x: number, y: number, radius: number): number {
    let acc = 0, n = 0;
    for (let dy = -radius; dy <= radius; dy++)
      for (let dx = -radius; dx <= radius; dx++) {
        const i = (y + dy) * this.w + (x + dx);
        if (i >= 0 && i < this.grid.length) { acc += this.grid[i]; n++; }
      }
    return acc / Math.max(1, n);   // phenomenal intensity over aperture
  }
}`,
  },
];

/* --------------------------------------------------------------- PALETTES */

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

/* ------------------------------------------------------------- ANALYTICS */

export function buildActivitySeries(seed = 7): { t: number; v: number }[] {
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
  const rng = mulberry32(99);
  return DOMAINS.map((d) => ({ domain: d, value: Math.round(between(rng, 35, 96)) }));
}

export function buildVelocity(): { label: string; value: number }[] {
  const rng = mulberry32(42);
  return DOMAINS.map((d) => ({
    label: d.split(' ')[0],
    value: Math.round(between(rng, 12, 60)),
  }));
}
