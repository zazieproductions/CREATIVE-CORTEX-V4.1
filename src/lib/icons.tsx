import {
  Workflow, Radio, Activity, NotebookPen, Atom, Palette, Terminal, Crosshair,
  Hexagon, Cpu, Zap, Command, Maximize2, X, Eye, EyeOff, Plus, Minus, Locate,
  Sparkles, Search, Pin, ArrowRight, Copy, Check, RotateCcw, Brain, Layers,
  Network, Gauge as GaugeIcon, TrendingUp, AlertTriangle, Target, GitFork,
  Lock, Unlock, Shuffle, ChevronRight, Circle, Filter, Clock, Database,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ICONS: Record<string, LucideIcon> = {
  workflow: Workflow, radio: Radio, activity: Activity, notebook: NotebookPen,
  atom: Atom, palette: Palette, terminal: Terminal, crosshair: Crosshair,
  hexagon: Hexagon, cpu: Cpu, zap: Zap, command: Command, maximize: Maximize2,
  x: X, eye: Eye, eyeoff: EyeOff, plus: Plus, minus: Minus, locate: Locate,
  sparkles: Sparkles, search: Search, pin: Pin, arrowright: ArrowRight,
  copy: Copy, check: Check, reset: RotateCcw, brain: Brain, layers: Layers,
  network: Network, gauge: GaugeIcon, trend: TrendingUp, alert: AlertTriangle,
  target: Target, fork: GitFork, lock: Lock, unlock: Unlock, shuffle: Shuffle,
  chevron: ChevronRight, circle: Circle, filter: Filter, clock: Clock,
  database: Database,
};

export type IconName = keyof typeof ICONS;
