import type { PanelState } from '../types';

export const STAGE_W = 2360;
export const STAGE_H = 1180;

export interface PanelMeta {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  icon: string;
}

export const PANEL_META: PanelMeta[] = [
  { id: 'neural', title: 'Neural Atlas', subtitle: 'knowledge graph', accent: '#22d3ee', icon: 'workflow' },
  { id: 'vision', title: 'Vision Stream', subtitle: 'live cognition', accent: '#e879f9', icon: 'radio' },
  { id: 'analytics', title: 'Cortex Analytics', subtitle: 'metrics + signals', accent: '#a78bfa', icon: 'activity' },
  { id: 'notes', title: 'Field Notes Vault', subtitle: '327 notes', accent: '#34d399', icon: 'notebook' },
  { id: 'idea', title: 'Idea Synthesis', subtitle: 'concept forge', accent: '#fbbf24', icon: 'atom' },
  { id: 'hex', title: 'Hex Lab', subtitle: 'palette foundry', accent: '#f472b6', icon: 'palette' },
  { id: 'code', title: 'Code Prototypes', subtitle: 'visionary sketches', accent: '#2dd4bf', icon: 'terminal' },
  { id: 'schemes', title: 'Schemes', subtitle: 'social engineering', accent: '#fb7185', icon: 'crosshair' },
];

export const DEFAULT_PANELS: PanelState[] = [
  { id: 'neural', x: 24, y: 24, w: 660, h: 484, visible: true },
  { id: 'vision', x: 712, y: 24, w: 432, h: 484, visible: true },
  { id: 'analytics', x: 1172, y: 24, w: 472, h: 484, visible: true },
  { id: 'hex', x: 1672, y: 24, w: 428, h: 300, visible: true },
  { id: 'notes', x: 24, y: 540, w: 544, h: 612, visible: true },
  { id: 'idea', x: 600, y: 540, w: 432, h: 432, visible: true },
  { id: 'code', x: 1064, y: 540, w: 504, h: 432, visible: true },
  { id: 'schemes', x: 1600, y: 540, w: 544, h: 460, visible: true },
];
