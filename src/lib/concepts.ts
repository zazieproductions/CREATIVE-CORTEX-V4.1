import { mulberry32, pickN } from './rng';
import type { ConceptNode, GraphEdge } from '../types';
import { DOMAINS } from './banks';

// Curated concept nodes — 3 per domain — forming the neural map.
const RAW: Record<string, string[]> = {
  'Cognitive Architecture': ['Predictive Cascade', 'Global Workspace', 'Active Inference Loop'],
  Memetics: ['Meme Vector', 'Belief Contagion', 'Cultural Immunity'],
  'Topology of Belief': ['Dogma Manifold', 'Epistemic Shear', 'Conviction Basin'],
  'Synthetic Biology': ['Orthogonal Code', 'Protocell Scaffold', 'Xeno-Metabolism'],
  'Algorithmic Aesthetics': ['Generative Canon', 'Style Latent', 'Procedural Sublime'],
  'Post-Scarcity Economics': ['Abundance Vector', 'Reputation Ledger', 'Decay Currency'],
  Neurophenomenology: ['Qualia Field', 'Harden Problem', 'Embodied Frame'],
  'Generative Mythology': ['Hyperstition Engine', 'Myth Compiler', 'Narrative Gravity'],
  'Information Thermodynamics': ['Entropy Pump', 'Maxwell Demon', 'Landauer Limit'],
  'Cybernetic Governance': ['Feedback Sovereign', 'Sensor Grid', 'Autopoiesis'],
  'Resonance Engineering': ['Harmonic Conduit', 'Destructive Lattice', 'Phase Coupling'],
  'Speculative Cosmology': ['Braneworld', 'Dark Flow', 'Anthropic Attractor'],
  'Attention Markets': ['Gaze Auction', 'Salience Token', 'Focus Debt'],
  'Linguistic Gravity': ['Semantic Well', 'Grammar Pull', 'Lexical Decay'],
  'Emergent Governance': ['Stigmergic Trail', 'Swarm Protocol', 'Coordination Field'],
};

function buildConcepts(): { nodes: ConceptNode[]; edges: GraphEdge[] } {
  const rng = mulberry32(20240517);
  const nodes: ConceptNode[] = [];
  const byDomain: Record<string, ConceptNode[]> = {};

  DOMAINS.forEach((domain, di) => {
    const angle = (di / DOMAINS.length) * Math.PI * 2;
    const cx = 540 + Math.cos(angle) * 360;
    const cy = 400 + Math.sin(angle) * 240;
    byDomain[domain] = [];
    RAW[domain].forEach((label, ci) => {
      const a = (ci / 3) * Math.PI * 2;
      const id = `c-${di}-${ci}`;
      const node: ConceptNode = {
        id,
        label,
        domain,
        x: cx + Math.cos(a) * 46 + (rng() - 0.5) * 24,
        y: cy + Math.sin(a) * 46 + (rng() - 0.5) * 24,
        vx: 0,
        vy: 0,
        r: label.length > 12 ? 16 : 13,
      };
      nodes.push(node);
      byDomain[domain].push(node);
    });
  });

  const edges: GraphEdge[] = [];
  const addEdge = (a: ConceptNode, b: ConceptNode, weight = 1, bridge = false) => {
    if (a.id === b.id) return;
    const id = [a.id, b.id].sort().join('--');
    if (edges.some((e) => e.id === id)) return;
    edges.push({ id, source: a.id, target: b.id, weight, bridge });
  };

  // intra-domain clustering
  DOMAINS.forEach((d) => {
    const g = byDomain[d];
    for (let i = 0; i < g.length; i++) addEdge(g[i], g[(i + 1) % g.length], 1.6);
    addEdge(g[0], g[2], 0.9);
  });

  // cross-domain bridges to look like a neural net
  const flat = nodes;
  for (let k = 0; k < 26; k++) {
    const a = pickN(rng, flat, 1)[0];
    const b = pickN(rng, flat, 1)[0];
    if (a.domain !== b.domain) addEdge(a, b, 0.4 + rng() * 0.4, true);
  }

  // a few long-range bridges for aesthetic reach
  const hubs = ['c-0-0', 'c-9-1', 'c-11-0', 'c-4-2', 'c-14-2', 'c-8-0'];
  for (let i = 0; i < hubs.length; i++) {
    const a = nodes.find((n) => n.id === hubs[i])!;
    const b = nodes.find((n) => n.id === hubs[(i + 1) % hubs.length])!;
    if (a && b) addEdge(a, b, 0.3, true);
  }

  return { nodes, edges };
}

export const GRAPH = buildConcepts();
export const CONCEPTS = GRAPH.nodes;
export const EDGES = GRAPH.edges;
