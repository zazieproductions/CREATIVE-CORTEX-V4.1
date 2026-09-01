export interface ConceptNode {
  id: string;
  label: string;
  domain: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pinned?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  bridge?: boolean;
}

export interface Note {
  id: string;
  title: string;
  domain: string;
  conceptId: string;
  tags: string[];
  content: string;
  links: string[];
  created: number;
  coherence: number;
  resonance: number;
  novelty: number;
  pinned?: boolean;
}

export interface Scheme {
  id: string;
  codename: string;
  objective: string;
  vectors: string[];
  phases: { name: string; detail: string }[];
  targets: string[];
 impact: number;
  risk: string;
  status: 'latent' | 'seeding' | 'cascading' | 'entangled';
}

export interface CodeProto {
  id: string;
  title: string;
  language: string;
  domain: string;
  description: string;
  code: string;
}

export interface Palette {
  id: string;
  name: string;
  swatches: string[];
}

export interface VisionEntry {
  id: number;
  text: string;
  tags: string[];
  ts: number;
}

export interface PanelState {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
}
