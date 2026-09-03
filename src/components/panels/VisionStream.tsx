import { useEffect, useRef, useState } from 'react';
import { Radio } from 'lucide-react';
import { VisionGenerator } from '../../lib/vision';
import type { VisionEntry } from '../../types';

interface VisionStreamProps {
  onNew?: () => void;
}

export function VisionStream({ onNew }: VisionStreamProps) {
  const genRef = useRef<VisionGenerator | null>(null);
  if (!genRef.current) genRef.current = new VisionGenerator();
  const [feed, setFeed] = useState<VisionEntry[]>([]);
  const [typed, setTyped] = useState('');
  const targetRef = useRef<VisionEntry | null>(null);

  useEffect(() => {
    targetRef.current = genRef.current!.next();
    let i = 0;
    let phase: 'typing' | 'pause' = 'typing';
    let pause = 0;
    const id = setInterval(() => {
      const t = targetRef.current;
      if (!t) return;
      if (phase === 'typing') {
        i++;
        if (i <= t.text.length) setTyped(t.text.slice(0, i));
        else { phase = 'pause'; pause = 0; }
      } else {
        pause++;
        if (pause > 30) {
          setFeed((f) => [t, ...f].slice(0, 14));
          onNew?.();
          targetRef.current = genRef.current!.next();
          i = 0;
          phase = 'typing';
          setTyped('');
        }
      }
    }, 30);
    return () => clearInterval(id);
  }, [onNew]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 h-7 border-b border-white/[0.05] shrink-0">
        <Radio size={11} className="text-flux animate-pulse-glow" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-flux">live cognition stream</span>
        <span className="ml-auto flex items-center gap-1 font-mono text-[8px] text-ink-dim">
          <span className="h-1.5 w-1.5 rounded-full bg-flux animate-pulse-glow" /> streaming
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        {feed.map((e) => (
          <div key={e.id} className="border-l-2 border-flux/30 pl-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-mono text-[7px] text-ink-faint tabular">THX-{String(e.id).padStart(4, '0')}</span>
              {e.tags.map((t) => (
                <span key={t} className="font-mono text-[7px] px-1 rounded bg-flux/10 text-flux/80">{t}</span>
              ))}
            </div>
            <p className="font-mono text-[10px] leading-relaxed text-ink/85">{e.text}</p>
          </div>
        ))}
        {feed.length === 0 && (
          <div className="font-mono text-[9px] text-ink-faint">awaiting first signal…</div>
        )}
      </div>
      <div className="border-t border-white/[0.05] p-3 shrink-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-flux animate-pulse-glow" />
          <span className="font-mono text-[7px] uppercase tracking-widest text-flux/70">synthesizing</span>
        </div>
        <p className="font-mono text-[11px] leading-relaxed text-ink min-h-[2.4em]">
          {typed}
          <span className="inline-block w-1.5 h-3.5 bg-flux ml-0.5 align-middle animate-blink" />
        </p>
      </div>
    </div>
  );
}
