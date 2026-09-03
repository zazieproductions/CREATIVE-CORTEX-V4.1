import { useState } from 'react';
import { Palette as PalIcon, Lock, Unlock, Shuffle, Check, RotateCcw } from 'lucide-react';
import { generatePalette, SEED_PALETTES } from '../lib/generate';
import type { Palette } from '../types';

export function HexLab() {
  const [pal, setPal] = useState<Palette>(SEED_PALETTES[0]);
  const [locks, setLocks] = useState<boolean[]>(new Array(6).fill(false));
  const [copied, setCopied] = useState<number | null>(null);

  const regen = () => {
    const g = generatePalette(Date.now() % 100000);
    setPal((prev) => ({
      id: g.id,
      name: g.name,
      swatches: prev.swatches.map((s, i) => (locks[i] ? s : g.swatches[i])),
    }));
  };
  const loadSeed = (p: Palette) => {
    setPal(p);
    setLocks(new Array(6).fill(false));
  };
  const copy = (hex: string, i: number) => {
    navigator.clipboard?.writeText(hex);
    setCopied(i);
    setTimeout(() => setCopied(null), 900);
  };
  const toggleLock = (i: number) => setLocks((l) => l.map((x, j) => (j === i ? !x : x)));

  return (
    <div className="flex flex-col h-full p-2.5 gap-2.5 overflow-y-auto">
      <div className="flex items-center gap-2">
        <PalIcon size={13} className="text-pink-400" />
        <span className="font-mono text-[11px] font-semibold text-ink truncate">{pal.name}</span>
        <div className="ml-auto flex gap-1">
          <button onClick={regen} className="p-1.5 rounded bg-white/[0.04] border border-white/[0.07] hover:border-pink-400/40 text-ink-dim hover:text-pink-400 transition-colors" title="Regenerate unlocked">
            <Shuffle size={12} />
          </button>
          <button onClick={() => { setLocks(new Array(6).fill(false)); regen(); }} className="p-1.5 rounded bg-white/[0.04] border border-white/[0.07] hover:border-pink-400/40 text-ink-dim hover:text-pink-400 transition-colors" title="Reset">
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {pal.swatches.map((hex, i) => (
          <button
            key={i}
            onClick={() => copy(hex, i)}
            className="group relative flex flex-col items-stretch rounded-lg overflow-hidden border border-white/[0.06] hover:border-white/20 transition-all"
            style={{ background: hex, minHeight: 72 }}
          >
            <span className="absolute top-1 left-1 font-mono text-[8px] px-1 rounded" style={{ color: hex, background: 'rgba(255,255,255,0.85)' }}>
              {copied === i ? <Check size={9} /> : hex.replace('#', '').toUpperCase().slice(0, 2)}
            </span>
            <span
              onClick={(e) => { e.stopPropagation(); toggleLock(i); }}
              className="absolute bottom-1 right-1 p-0.5 rounded bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: locks[i] ? '#fbbf24' : '#ffffffaa' }}
            >
              {locks[i] ? <Lock size={9} /> : <Unlock size={9} />}
            </span>
            <span className="mt-auto mb-1 mx-auto font-mono text-[8px] font-semibold" style={{ color: contrast(hex) }}>
              {hex.toUpperCase()}
            </span>
          </button>
        ))}
      </div>

      <div className="font-mono text-[9px] text-ink-dim px-1">click swatch to copy · lock to preserve across regen</div>

      <div className="space-y-1">
        <div className="font-mono text-[8px] uppercase tracking-widest text-ink-dim px-1">seed palettes</div>
        <div className="grid grid-cols-3 gap-1.5">
          {SEED_PALETTES.map((p) => (
            <button key={p.id} onClick={() => loadSeed(p)} className="rounded-lg overflow-hidden border border-white/[0.06] hover:border-white/20 transition-all">
              <div className="flex h-6">
                {p.swatches.map((h, i) => <div key={i} className="flex-1" style={{ background: h }} />)}
              </div>
              <div className="font-mono text-[8px] text-ink-dim py-0.5 px-1 truncate text-left">{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-white/[0.06]">
        <div className="font-mono text-[8px] uppercase tracking-widest text-ink-dim px-2 py-1 border-b border-white/[0.05]">applied preview</div>
        <div className="p-3" style={{ background: pal.swatches[1] }}>
          <div className="font-display text-sm font-bold" style={{ color: pal.swatches[3] }}>{pal.name}</div>
          <div className="font-mono text-[9px] mt-0.5" style={{ color: pal.swatches[2] }}>an emergent chromatic system</div>
          <div className="mt-2 flex gap-1.5">
            <span className="font-mono text-[8px] px-2 py-0.5 rounded-full" style={{ background: pal.swatches[4], color: pal.swatches[0] }}>tag</span>
            <span className="font-mono text-[8px] px-2 py-0.5 rounded-full" style={{ background: pal.swatches[5], color: pal.swatches[0] }}>tag</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function contrast(hex: string): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? '#06060d' : '#ffffff';
}
