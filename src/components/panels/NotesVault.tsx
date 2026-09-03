import { useMemo, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import type { Note } from '../../types';
import { DOMAINS, DOMAIN_COLORS } from '../../lib/banks';
import { NOTE_COUNT } from '../../lib/config';

interface NotesVaultProps {
  notes: Note[];
  onOpenNote: (id: string) => void;
}

export function NotesVault({ notes, onOpenNote }: NotesVaultProps) {
  const [q, setQ] = useState('');
  const [domain, setDomain] = useState<string>('all');

  const filtered = useMemo(() => {
    const ql = q.toLowerCase().trim();
    return notes.filter((n) => {
      if (domain !== 'all' && n.domain !== domain) return false;
      if (!ql) return true;
      return (
        n.title.toLowerCase().includes(ql) ||
        n.content.toLowerCase().includes(ql) ||
        n.domain.toLowerCase().includes(ql) ||
        n.tags.some((t) => t.includes(ql))
      );
    });
  }, [notes, q, domain]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-2.5 border-b border-white/[0.06] space-y-2 shrink-0">
        <div className="flex items-center gap-2 px-2 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] focus-within:border-neon/40 transition-colors">
          <Search size={13} className="text-ink-dim shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`search ${NOTE_COUNT} notes…`}
            className="flex-1 bg-transparent outline-none font-mono text-[11px] text-ink placeholder:text-ink-faint"
          />
          <span className="font-mono text-[9px] text-ink-dim tabular shrink-0">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <Filter size={11} className="text-ink-dim shrink-0" />
          <Chip active={domain === 'all'} onClick={() => setDomain('all')} color="#c8cadb" label="all" />
          {DOMAINS.map((d) => (
            <Chip key={d} active={domain === d} onClick={() => setDomain(d)} color={DOMAIN_COLORS[d]} label={d.split(' ')[0]} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filtered.slice(0, 240).map((n) => {
          const color = DOMAIN_COLORS[n.domain] ?? '#22d3ee';
          return (
            <button
              key={n.id}
              onClick={() => onOpenNote(n.id)}
              className="group w-full text-left rounded-lg p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                <span className="font-mono text-[8px] text-ink-faint shrink-0">{n.id}</span>
                <span className="font-mono text-[8px] uppercase tracking-wider shrink-0" style={{ color }}>{n.domain.split(' ')[0]}</span>
                <span className="ml-auto flex gap-0.5 shrink-0">
                  {[n.coherence, n.resonance, n.novelty].map((s, i) => (
                    <span key={i} className="h-1 w-4 rounded-full bg-white/[0.06] overflow-hidden inline-block">
                      <span className="block h-full" style={{ width: `${s}%`, background: ['#22d3ee', '#e879f9', '#fbbf24'][i] }} />
                    </span>
                  ))}
                </span>
              </div>
              <div className="font-mono text-[10px] text-ink/90 mt-0.5 leading-snug line-clamp-2 group-hover:text-ink transition-colors">
                {n.title}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="font-mono text-[10px] text-ink-faint text-center py-8">no notes match query</div>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, color, label }: { active: boolean; onClick: () => void; color: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-[9px] px-1.5 py-0.5 rounded shrink-0 transition-all ${active ? '' : 'text-ink-dim hover:text-ink'}`}
      style={active ? { color: '#06060d', background: color, fontWeight: 600 } : { border: `1px solid ${color}33` }}
    >
      {label}
    </button>
  );
}
