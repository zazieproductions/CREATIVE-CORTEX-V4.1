/**
 * Schemes registry.
 *
 * Six authored social-engineering schemes. Unlike the generated corpora these
 * are hand-written: they carry the work's dark, speculative register and are
 * the project's clearest statement of intent, so they are curated, not seeded.
 */
import type { Scheme } from '../types';


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
