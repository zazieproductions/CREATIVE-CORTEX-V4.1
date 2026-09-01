import { Crosshair, Target, AlertTriangle, GitFork } from 'lucide-react';
import { SCHEMES } from '../lib/generate';

const STATUS_COLOR: Record<string, string> = {
  latent: '#6a6f90',
  seeding: '#fbbf24',
  cascading: '#22d3ee',
  entangled: '#e879f9',
};

export function Schemes() {
  return (
    <div className="overflow-y-auto p-2.5 space-y-2.5 h-full">
      {SCHEMES.map((s) => {
        const color = STATUS_COLOR[s.status] ?? '#fb7185';
        return (
          <div key={s.id} className="glass rounded-lg p-3 border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Crosshair size={13} className="shrink-0" style={{ color }} />
              <span className="font-mono text-[12px] font-bold tracking-wide text-ink">{s.codename}</span>
              <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-widest" style={{ color, background: `${color}14`, border: `1px solid ${color}33` }}>{s.status}</span>
              <span className="font-mono text-[8px] text-ink-faint ml-auto">{s.id}</span>
            </div>

            <p className="text-[11px] text-ink/80 leading-relaxed mt-1.5">{s.objective}</p>

            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-[8px] uppercase tracking-widest text-ink-dim w-12 shrink-0">impact</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${s.impact}%`, background: `linear-gradient(90deg, ${color}, #fb7185)`, boxShadow: `0 0 8px ${color}88` }} />
              </div>
              <span className="font-mono text-[10px] tabular w-7 text-right" style={{ color }}>{s.impact}</span>
            </div>

            <div className="mt-2.5">
              <div className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-widest text-ink-dim mb-1"><GitFork size={9} /> phases</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {s.phases.map((p, i) => (
                  <div key={i} className="flex gap-1.5">
                    <span className="font-mono text-[9px] tabular shrink-0" style={{ color }}>{String(i + 1).padStart(2, '0')}</span>
                    <div className="min-w-0">
                      <div className="font-mono text-[9px] font-semibold text-ink/90 truncate">{p.name}</div>
                      <div className="font-mono text-[8px] text-ink-dim leading-tight line-clamp-2">{p.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-1">
              <Target size={9} className="text-ink-dim" />
              {s.targets.map((t) => (
                <span key={t} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-ink-dim">{t}</span>
              ))}
            </div>

            <div className="mt-2 flex items-start gap-1.5">
              <AlertTriangle size={10} className="text-amber shrink-0 mt-0.5" />
              <span className="font-mono text-[8px] text-ink-dim leading-relaxed">{s.risk}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
