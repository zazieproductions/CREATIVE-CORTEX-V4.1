/**
 * Code prototypes.
 *
 * Six speculative code artefacts rendered in the Prototypes module. Each is a
 * short, self-contained sketch in a different language; the viewer applies a
 * tiny regex tokenizer (lib/highlight.ts) — not a real grammar — which is an
 * intentional, documented compromise.
 */
import type { CodeProto } from '../types';


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
