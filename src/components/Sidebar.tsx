import { RotateCcw, Eye, EyeOff, Layers, Database, Network, Crosshair } from 'lucide-react';
import type { ReactNode } from 'react';
import { PANEL_META } from '../lib/layout';
import { ICONS } from '../lib/icons';
import type { PanelState } from '../types';

interface SidebarProps {
  panels: PanelState[];
  focusedId: string | null;
  stats: { notes: number; concepts: number; edges: number; schemes: number };
  onFocus: (id: string) => void;
  onToggle: (id: string) => void;
  onReset: () => void;
}

export function Sidebar({ panels, focusedId, stats, onFocus, onToggle, onReset }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 glass border-r border-white/[0.06] flex flex-col z-[140]">
      <div className="px-4 pt-4 pb-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-ink-dim">modules</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 space-y-1 no-scrollbar">
        {PANEL_META.map((m) => {
          const st = panels.find((p) => p.id === m.id);
          const visible = st?.visible ?? true;
          const Icon = ICONS[m.icon] ?? ICONS.layers;
          const focused = focusedId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onFocus(m.id)}
              className={`group relative flex items-center gap-2.5 px-2.5 h-10 rounded-lg cursor-pointer transition-all ${
                focused ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
              }`}
              style={focused ? { boxShadow: `inset 2px 0 0 ${m.accent}` } : undefined}
            >
              <span className="shrink-0 p-1 rounded" style={{ color: m.accent, background: `${m.accent}14` }}>
                <Icon size={14} />
              </span>
              <div className="flex flex-col leading-none min-w-0 flex-1">
                <span className="font-mono text-[11px] font-medium text-ink truncate">{m.title}</span>
                <span className="font-mono text-[8px] text-ink-dim truncate">{m.subtitle}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(m.id); }}
                className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: visible ? m.accent : '#6a6f90' }}
                title={visible ? 'Hide' : 'Show'}
              >
                {visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-white/[0.06] space-y-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-ink-dim">system</span>
        <div className="grid grid-cols-2 gap-2">
          <Stat icon={<Database size={12} />} label="notes" value={stats.notes} color="#34d399" />
          <Stat icon={<Network size={12} />} label="nodes" value={stats.concepts} color="#22d3ee" />
          <Stat icon={<Layers size={12} />} label="synapses" value={stats.edges} color="#a78bfa" />
          <Stat icon={<Crosshair size={12} />} label="schemes" value={stats.schemes} color="#fb7185" />
        </div>
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 h-8 rounded-lg bg-white/[0.03] border border-white/[0.07] hover:border-flux/40 hover:bg-flux/[0.06] text-ink-dim hover:text-flux transition-colors"
        >
          <RotateCcw size={12} />
          <span className="font-mono text-[10px] uppercase tracking-wider">reset layout</span>
        </button>
      </div>
    </aside>
  );
}

function Stat({ icon, label, value, color }: { icon: ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
      <span className="flex items-center gap-1" style={{ color }}>
        {icon}
        <span className="font-mono text-[8px] uppercase tracking-wider text-ink-dim">{label}</span>
      </span>
      <span className="font-mono text-[13px] font-bold tabular" style={{ color }}>{value}</span>
    </div>
  );
}
