import { Pin, ArrowRight, Link2, Clock } from 'lucide-react';
import type { Note } from '../types';
import { DOMAIN_COLORS } from '../lib/banks';

interface NoteDetailProps {
  note: Note;
  notes: Note[];
  onOpenNote: (id: string) => void;
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color, boxShadow: `0 0 6px ${color}88` }} />
      </div>
      <span className="font-mono text-[10px] tabular w-7 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

export function NoteDetail({ note, notes, onOpenNote }: NoteDetailProps) {
  const color = DOMAIN_COLORS[note.domain] ?? '#22d3ee';
  const backlinks = notes.filter((n) => n.links.includes(note.id)).slice(0, 8);
  const outgoing = note.links.map((id) => notes.find((n) => n.id === id)).filter(Boolean) as Note[];
  const created = new Date(note.created).toISOString().slice(0, 10);

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border" style={{ color, borderColor: `${color}55`, background: `${color}14` }}>
          {note.domain}
        </span>
        <span className="font-mono text-[10px] text-ink-faint">{note.id}</span>
        {note.pinned && <Pin size={11} className="text-amber fill-amber/40" />}
        <span className="ml-auto flex items-center gap-1 font-mono text-[9px] text-ink-dim">
          <Clock size={10} /> {created}
        </span>
      </div>

      <h2 className="mt-3 font-display text-xl sm:text-2xl font-semibold text-ink leading-tight" style={{ textShadow: `0 0 30px ${color}22` }}>
        {note.title}
      </h2>

      <div className="mt-4 grid sm:grid-cols-3 gap-2">
        <Bar label="coherence" value={note.coherence} color="#22d3ee" />
        <Bar label="resonance" value={note.resonance} color="#e879f9" />
        <Bar label="novelty" value={note.novelty} color="#fbbf24" />
      </div>

      <p className="mt-4 text-[14px] leading-relaxed text-ink/90">{note.content}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {note.tags.map((t) => (
          <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-ink-dim">#{t}</span>
        ))}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-lg p-3">
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-neon mb-2">
            <ArrowRight size={11} /> outgoing links ({outgoing.length})
          </div>
          <div className="space-y-1">
            {outgoing.length === 0 && <span className="font-mono text-[10px] text-ink-faint">no outgoing links</span>}
            {outgoing.map((n) => (
              <button key={n.id} onClick={() => onOpenNote(n.id)} className="block w-full text-left font-mono text-[10px] text-ink/75 hover:text-neon truncate transition-colors">
                <span className="text-ink-faint">{n.id}</span> · {n.title}
              </button>
            ))}
          </div>
        </div>
        <div className="glass rounded-lg p-3">
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-flux mb-2">
            <Link2 size={11} /> backlinks ({backlinks.length})
          </div>
          <div className="space-y-1">
            {backlinks.length === 0 && <span className="font-mono text-[10px] text-ink-faint">no backlinks yet</span>}
            {backlinks.map((n) => (
              <button key={n.id} onClick={() => onOpenNote(n.id)} className="block w-full text-left font-mono text-[10px] text-ink/75 hover:text-flux truncate transition-colors">
                <span className="text-ink-faint">{n.id}</span> · {n.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
