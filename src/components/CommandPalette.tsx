import { useEffect, useMemo, useState } from 'react';
import { Search, FileText, Network, Crosshair, CornerDownLeft } from 'lucide-react';
import { CONCEPTS } from '../lib/concepts';
import { SCHEMES } from '../lib/generate';
import { DOMAIN_COLORS } from '../lib/banks';
import type { Note } from '../types';

interface CommandPaletteProps {
  open: boolean;
  notes: Note[];
  onClose: () => void;
  onOpenNote: (id: string) => void;
  onFocusPanel: (id: string) => void;
}

type Item =
  | { kind: 'note'; id: string; title: string; sub: string; color: string }
  | { kind: 'concept'; id: string; title: string; sub: string; color: string }
  | { kind: 'scheme'; id: string; title: string; sub: string; color: string };

export function CommandPalette({ open, notes, onClose, onOpenNote, onFocusPanel }: CommandPaletteProps) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);

  const items = useMemo<Item[]>(() => {
    const base: Item[] = [
      ...notes.map((n): Item => ({ kind: 'note', id: n.id, title: n.title, sub: `${n.id} · ${n.domain}`, color: DOMAIN_COLORS[n.domain] ?? '#34d399' })),
      ...CONCEPTS.map((c): Item => ({ kind: 'concept', id: c.id, title: c.label, sub: c.domain, color: DOMAIN_COLORS[c.domain] ?? '#22d3ee' })),
      ...SCHEMES.map((s): Item => ({ kind: 'scheme', id: s.id, title: s.codename, sub: s.objective.slice(0, 48), color: '#fb7185' })),
    ];
    const ql = q.toLowerCase().trim();
    if (!ql) return base.slice(0, 40);
    return base.filter((it) => (it.title + ' ' + it.sub).toLowerCase().includes(ql)).slice(0, 50);
  }, [notes, q]);

  useEffect(() => { setActive(0); }, [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); setQ(''); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
      else if (e.key === 'Enter') { e.preventDefault(); exec(items[active]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, items, active]);

  if (!open) return null;

  const exec = (it?: Item) => {
    if (!it) return;
    if (it.kind === 'note') onOpenNote(it.id);
    else if (it.kind === 'concept') onFocusPanel('neural');
    else onFocusPanel('schemes');
    onClose();
    setQ('');
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[12vh] px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { onClose(); setQ(''); }} />
      <div className="relative w-full max-w-xl glass-strong rounded-xl overflow-hidden border border-white/10" style={{ boxShadow: '0 30px 90px -30px #22d3ee55' }}>
        <div className="flex items-center gap-2.5 px-4 border-b border-white/[0.07]">
          <Search size={16} className="text-neon shrink-0" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search notes, concepts, schemes…"
            className="flex-1 bg-transparent outline-none font-mono text-sm text-ink placeholder:text-ink-faint py-3.5"
          />
          <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-ink-dim">esc</kbd>
        </div>
        <div className="max-h-[52vh] overflow-y-auto py-1">
          {items.length === 0 && <div className="px-4 py-6 font-mono text-[11px] text-ink-faint text-center">no matches in vault</div>}
          {items.map((it, i) => {
            const Icon = it.kind === 'note' ? FileText : it.kind === 'concept' ? Network : Crosshair;
            return (
              <button
                key={`${it.kind}-${it.id}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => exec(it)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${i === active ? 'bg-white/[0.06]' : ''}`}>
                <Icon size={14} className="shrink-0" style={{ color: it.color }} />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-mono text-[12px] text-ink truncate">{it.title}</span>
                  <span className="font-mono text-[9px] text-ink-dim truncate">{it.sub}</span>
                </div>
                {i === active && <CornerDownLeft size={13} className="text-ink-dim shrink-0" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 px-4 h-8 border-t border-white/[0.06] font-mono text-[8px] text-ink-dim uppercase tracking-widest">
          <span>↑↓ navigate</span><span>↵ open</span><span className="ml-auto">{items.length} results</span>
        </div>
      </div>
    </div>
  );
}
