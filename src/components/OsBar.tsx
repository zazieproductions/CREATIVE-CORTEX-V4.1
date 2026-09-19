import { useEffect, useState, type ReactNode } from 'react';
import { Hexagon, Command, Cpu, Zap, Database, Activity as ActIcon } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface OsBarProps {
  activity: number[];
  visionIndex: number;
  ideaVelocity: number;
  noteCount: number;
  onOpenPalette: () => void;
}

function Metric({ icon, label, value, color, children }: { icon: ReactNode; label: string; value: string; color: string; children?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06]">
      <span style={{ color }}>{icon}</span>
      <div className="flex flex-col leading-none">
        <span className="font-mono text-[8px] uppercase tracking-widest text-ink-dim">{label}</span>
        <span className="font-mono text-[11px] font-semibold tabular" style={{ color }}>{value}</span>
      </div>
      {children}
    </div>
  );
}

export function OsBar({ activity, visionIndex, ideaVelocity, noteCount, onOpenPalette }: OsBarProps) {
  const [now, setNow] = useState(new Date());
  const [session, setSession] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setNow(new Date());
      setSession((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const last = activity[activity.length - 1] ?? 0;
  const time = now.toLocaleTimeString('en-GB', { hour12: false });

  return (
    <header className="h-12 shrink-0 glass-strong border-b border-white/[0.07] flex items-center gap-3 px-4 z-[150]">
      {/* brand */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <Hexagon size={22} className="text-neon animate-pulse-glow" />
          <span className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-neon" style={{ boxShadow: '0 0 8px #22d3ee' }} />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-display font-bold text-sm tracking-tight text-ink">
            NEXUS<span className="text-neon">//</span>OS
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-ink-dim">creative cortex v4.1</span>
        </div>
        <span className="ml-1 flex items-center gap-1.5 px-2 h-5 rounded-full bg-acid/10 border border-acid/20">
          <span className="h-1.5 w-1.5 rounded-full bg-acid animate-pulse-glow" />
          <span className="font-mono text-[8px] uppercase tracking-widest text-acid">online</span>
        </span>
      </div>

      {/* metrics */}
      <div className="hidden md:flex items-center gap-2 ml-2">
        <Metric icon={<ActIcon size={13} />} label="neural act" value={last.toFixed(0)} color="#22d3ee">
          <Sparkline data={activity.slice(-24)} width={64} height={22} color="#22d3ee" fill={false} strokeWidth={1.2} />
        </Metric>
        <Metric icon={<Zap size={13} />} label="idea vel" value={`${ideaVelocity}/h`} color="#fbbf24" />
        <Metric icon={<Cpu size={13} />} label="vision idx" value={visionIndex.toFixed(0)} color="#e879f9" />
        <Metric icon={<Database size={13} />} label="vault" value={`${noteCount}`} color="#34d399" />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end leading-none">
          <span className="font-mono text-[12px] font-semibold tabular text-ink">{time}</span>
          <span className="font-mono text-[8px] uppercase tracking-widest text-ink-dim">sess {(session / 60).toFixed(0)}m · uptime nominal</span>
        </div>
        <button
          onClick={onOpenPalette}
          className="flex items-center gap-2 px-3 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-neon/40 hover:bg-neon/[0.06] transition-colors group"
        >
          <Command size={14} className="text-ink-dim group-hover:text-neon transition-colors" />
          <span className="font-mono text-[11px] text-ink-dim group-hover:text-ink transition-colors">search vault</span>
          <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-ink-dim">⌘K</kbd>
        </button>
      </div>
    </header>
  );
}
