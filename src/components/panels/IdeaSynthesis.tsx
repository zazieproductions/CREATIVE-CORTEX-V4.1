import { useState } from 'react';
import { Atom, Sparkles, Plus, RotateCcw } from 'lucide-react';
import { CONCEPTS } from '../../lib/concepts';
import { synthesize } from '../../lib/vision';
import type { Note } from '../../types';

interface IdeaSynthesisProps {
  onCommit: (note: Note) => void;
}

interface Synth {
  title: string;
  desc: string;
  novelty: number;
  coherence: number;
  resonance: number;
  tags: string[];
  a: string;
  b: string;
}

export function IdeaSynthesis({ onCommit }: IdeaSynthesisProps) {
  const labels = CONCEPTS.map((c) => c.label);
  const [a, setA] = useState(labels[3]);
  const [b, setB] = useState(labels[14]);
  const [result, setResult] = useState<Synth | null>(null);
  const [forging, setForging] = useState(false);
  const [history, setHistory] = useState<Synth[]>([]);
  const [committed, setCommitted] = useState<string[]>([]);

  const forge = () => {
    setForging(true);
    setTimeout(() => {
      const seed = Math.floor(Math.random() * 1e9);
      const r = synthesize(a, b, seed);
      const s: Synth = { ...r, a, b };
      setResult(s);
      setHistory((h) => [s, ...h].slice(0, 6));
      setForging(false);
    }, 650);
  };

  const commit = (s: Synth) => {
    const id = `N-SYN-${Math.floor(Math.random() * 9000 + 1000)}`;
    onCommit({
      id, title: s.title, domain: 'Synthesis', conceptId: 'synth',
      tags: s.tags, content: s.desc, links: [],
      created: Date.now(), coherence: s.coherence, resonance: s.resonance, novelty: s.novelty,
    });
    setCommitted((c) => [...c, s.title]);
  };

  return (
    <div className="flex flex-col h-full p-3 gap-3 overflow-y-auto">
      <div className="grid grid-cols-1 gap-2">
        <Selector value={a} onChange={setA} options={labels} tone="#fbbf24" label="operand α" />
        <div className="flex items-center justify-center">
          <Atom size={16} className="text-amber animate-spin-slow" />
        </div>
        <Selector value={b} onChange={setB} options={labels} tone="#e879f9" label="operand β" />
      </div>

      <button
        onClick={forge}
        disabled={forging}
        className="flex items-center justify-center gap-2 h-9 rounded-lg font-mono text-[11px] uppercase tracking-widest font-semibold transition-all disabled:opacity-60"
        style={{ background: 'linear-gradient(90deg,#fbbf2433,#e879f933)', border: '1px solid #fbbf2466', color: '#fbbf24' }}
      >
        {forging ? <><RotateCcw size={14} className="animate-spin" /> forging…</> : <><Sparkles size={14} /> synthesize</>}
      </button>

      {result && (
        <div className="glass rounded-lg p-3 border border-amber/20" style={{ boxShadow: '0 0 24px -10px #fbbf2466' }}>
          <div className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-amber" />
            <span className="font-mono text-[8px] uppercase tracking-widest text-ink-dim">emergent concept</span>
          </div>
          <div className="font-display text-sm font-semibold text-ink mt-1 leading-tight">{result.title}</div>
          <p className="text-[11px] leading-relaxed text-ink/80 mt-1.5">{result.desc}</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Score label="novelty" v={result.novelty} c="#fbbf24" />
            <Score label="coher" v={result.coherence} c="#22d3ee" />
            <Score label="reson" v={result.resonance} c="#e879f9" />
          </div>
          <button
            onClick={() => commit(result)}
            disabled={committed.includes(result.title)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-acid/40 hover:text-acid text-ink-dim font-mono text-[10px] uppercase tracking-wider transition-colors disabled:opacity-40"
          >
            <Plus size={11} /> {committed.includes(result.title) ? 'committed' : 'commit to vault'}
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-1">
          <div className="font-mono text-[8px] uppercase tracking-widest text-ink-dim px-1">recent forges</div>
          {history.map((h, i) => (
            <button key={i} onClick={() => setResult(h)} className="block w-full text-left rounded px-2 py-1 hover:bg-white/[0.04] transition-colors">
              <span className="font-mono text-[10px] text-ink/70 truncate block">{h.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Selector({ value, onChange, options, tone, label }: { value: string; onChange: (v: string) => void; options: string[]; tone: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[8px] uppercase tracking-widest text-ink-dim px-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 rounded-lg bg-white/[0.03] border px-2 font-mono text-[11px] text-ink outline-none transition-colors"
        style={{ borderColor: `${tone}44`, color: tone }}
      >
        {options.map((o) => <option key={o} value={o} className="bg-panel text-ink">{o}</option>)}
      </select>
    </div>
  );
}

function Score({ label, v, c }: { label: string; v: number; c: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1 rounded bg-white/[0.03]">
      <span className="font-mono text-[10px] font-bold tabular" style={{ color: c }}>{v}</span>
      <span className="font-mono text-[7px] uppercase tracking-wider text-ink-dim">{label}</span>
    </div>
  );
}
