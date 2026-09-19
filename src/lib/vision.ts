import { mulberry32, pick, pickN, type Rng } from './rng';
import { ADJ, CONCEPT_NOUNS, PHENOMENA, DOMAINS } from './banks';

const FRAG_A = [
  'The map is not the territory', 'Form is frozen process', 'Stability is a memory artifact',
  'Every boundary is a trade', 'Noise is signal we have not yet learned to read',
  'Identity is the lag between two states', 'A category is a promise the future is not allowed to break',
  'Recursion is how a system tastes itself', 'Meaning is the residue of cancelled causes',
  'Power is the privilege of setting the default', 'Value accrues to whoever names the gradient',
  'The observer is the remainder that the equation refuses to absorb',
  'Myth is a load-bearing fiction that has forgotten it was chosen',
  'Attention is the only true scarcity in a post-scarcity field',
  'A protocol is a frozen vote about a future we have not held yet',
  'What persists is what the field has agreed to forget',
  'The limit case is not the exception — it is the diagnostic',
  'Coordination is just deferred disagreement, well-timed',
];
const FRAG_B = [
  'so we must treat every structure as a loan from the future',
  'which is why design is indistinguishable from prophecy',
  'meaning the operator was never the noun but the gradient between nouns',
  'and the work is to keep the gradient honest',
  'therefore the artifact you ship is a vote on which attractor wins',
  'so build not the object but the field that makes the object inevitable',
  'which collapses the maker/made distinction into a single verb',
  'and reframes strategy as editing the priors of a population',
  'so the only durable asset is the ability to reframe faster than the market can freeze',
  'meaning a brand is a slow-running hyperstition that finally compiled',
  'and the audience was always the compiler, never the reader',
  'so optimize for the field, not the node — nodes are symptoms',
];
const FRAG_C = [
  'The frontier is never where the map says it is.', 'A genius is a person who has agreed to host more contradictions than their peers.',
  'You do not have ideas; ideas have you, and they migrate toward available hosts.', 'The future arrives pre-narrated; your job is to refuse the script.',
  'Every medium is a metabolism; content is just what it excretes.', 'Clarity is a violent act — it kills the alternatives that made it possible.',
  'The market is a lagging indicator of a story someone told too well.', 'Anything you can describe is already a corpse; describe the dying instead.',
  'A network learns the shape of your attention and offers it back as destiny.', 'To engineer culture is to garden the defaults nobody notices.',
];

const VISION_TAGS = ['axiom', 'hyperstition', 'field-note', 'aphorism', 'proto-scheme', 'resonant', 'dangerous', 'speculative'];

export function makeVision(rng: Rng): { text: string; tags: string[] } {
  const roll = rng();
  let text: string;
  if (roll < 0.5) {
    text = `${pick(rng, FRAG_A)} ${pick(rng, FRAG_B)}`;
  } else if (roll < 0.78) {
    text = `${pick(rng, FRAG_C)}`;
  } else {
    // synthesized compound
    const adj = pick(rng, ADJ).replace(/-$/, '');
    const noun = pick(rng, CONCEPT_NOUNS);
    const ph = pick(rng, PHENOMENA);
    const dom = pick(rng, DOMAINS);
    text = `${adj} ${noun} are not features of ${dom} but ${ph} experienced at a slant — and the slant is where every lever lives.`;
  }
  const tags = pickN(rng, VISION_TAGS, 1 + Math.floor(rng() * 2));
  return { text, tags };
}

export class VisionGenerator {
  private rng: Rng;
  private counter = 0;
  constructor(seed = 20240517) {
    this.rng = mulberry32(seed);
  }
  next() {
    this.counter += 1;
    return { id: this.counter, ...makeVision(this.rng), ts: Date.now() };
  }
}

/* ------------------------------------------------------ IDEA SYNTHESIS */

const SYN_TEMPLATES: ((a: string, b: string, rng: Rng) => { title: string; desc: string })[] = [
  (a, b) => ({
    title: `${a} x ${b}`,
    desc: `A hybrid operator: ${a} becomes the substrate and ${b} the forcing function. The composite inherits the surface area of both while collapsing their independent failure modes — ${b} supplies novelty, ${a} supplies the rails that keep it load-bearing.`,
  }),
  (a, b, r) => ({
    title: `${a} Reflected Through ${b}`,
    desc: `Hold ${b} as a mirror to ${a}. What reflects back is a second-order structure — ${a} no longer acts on its original medium but on the impression ${b} leaves there. This is a meta-${pick(r, ['protocol', 'engine', 'grammar', 'substrate'])} that bootstraps from the interference pattern.`,
  }),
  (a, b, r) => ({
    title: `The ${a}-${b} Recursion`,
    desc: `Feed ${a}'s output into ${b}'s input and vice versa. Each loop anneals the other toward a fixed point neither could reach alone. The attractor is a novel ${pick(r, ['institution', 'artifact', 'market', 'ritual', 'medium'])} that did not exist in either parent's possibility space.`,
  }),
  (a, b) => ({
    title: `${b} as the Limit Case of ${a}`,
    desc: `Push ${a} toward its degenerate edge and it discloses ${b}. The synthesis is not additive but diagnostic: ${b} was always the grain of ${a} revealed under torsion. Engineering the torsion is the work.`,
  }),
  (a, b, r) => ({
    title: `Counterpoise: ${a} // ${b}`,
    desc: `${a} and ${b} are kept in productive tension rather than resolved. The space between them becomes a ${pick(r, ['gradient', 'membrane', 'auction', 'lattice', 'trail'])} — a tradable asymmetry. Whoever sets the exchange rate between the two becomes the market maker of the resulting field.`,
  }),
];

export function synthesize(a: string, b: string, seed: number) {
  const rng = mulberry32(seed);
  const tpl = pick(rng, SYN_TEMPLATES);
  const res = tpl(a, b, rng);
  const novelty = 40 + Math.floor(rng() * 59);
  const coherence = 35 + Math.floor(rng() * 60);
  const resonance = 30 + Math.floor(rng() * 64);
  return { ...res, novelty, coherence, resonance, tags: pickN(rng, VISION_TAGS, 2) };
}
