import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Activity, TrendingUp, Gauge as GaugeIcon, Layers } from 'lucide-react';
import { buildActivitySeries, buildDomainRadar, buildVelocity } from '../lib/generate';
import { DOMAIN_COLORS } from '../lib/banks';
import type { Note } from '../types';
import { Gauge } from './Gauge';

interface AnalyticsProps {
  notes: Note[];
  visionIndex: number;
  ideaVelocity: number;
}

function AreaChart({ data, color }: { data: { t: number; v: number }[]; color: string }) {
  const W = 420, H = 150, P = 4;
  const vals = data.map((d) => d.v);
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const sx = (W - P * 2) / (data.length - 1);
  const pts = data.map((d, i) => [P + i * sx, H - P - ((d.v - min) / range) * (H - P * 2 - 14)] as const);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="actarea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={0} y1={H * g} x2={W} y2={H * g} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#actarea)" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color}>
        <animate attributeName="r" values="3;5;3" dur="1.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Radar({ data }: { data: { domain: string; value: number }[] }) {
  const S = 200, cx = S / 2, cy = S / 2, R = 76;
  const n = data.length;
  const angle = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pt = (i: number, v: number) => [cx + Math.cos(angle(i)) * R * (v / 100), cy + Math.sin(angle(i)) * R * (v / 100)] as const;
  const poly = data.map((d, i) => pt(i, d.value).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="w-full h-full">
      {[0.33, 0.66, 1].map((g) => (
        <polygon key={g} points={data.map((_, i) => pt(i, g * 100).join(',')).join(' ')} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
      })}
      <polygon points={poly} fill="rgba(167,139,250,0.18)" stroke="#a78bfa" strokeWidth="1.5" />
      {data.map((d, i) => {
        const [x, y] = pt(i, d.value);
        return <circle key={i} cx={x} cy={y} r="2" fill={DOMAIN_COLORS[d.domain] ?? '#a78bfa'} />;
      })}
    </svg>
  );
}

function Bars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-[3px] h-full w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
          <div className="w-full rounded-t transition-all" style={{ height: `${(d.value / max) * 100}%`, background: `linear-gradient(180deg, ${DOMAIN_COLORS[Object.keys(DOMAIN_COLORS)[i]] ?? '#22d3ee'}, transparent)`, minHeight: 3 }} />
          <span className="font-mono text-[7px] text-ink-faint rotate-0 truncate w-full text-center">{d.label.slice(0, 3)}</span>
        </div>
      ))}
    </div>
  );
}

function Tile({ icon, label, value, sub, color }: { icon: ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="glass rounded-lg p-2.5 flex items-center gap-2.5">
      <span className="p-1.5 rounded-lg" style={{ color, background: `${color}14` }}>{icon}</span>
      <div className="flex flex-col leading-none min-w-0">
        <span className="font-mono text-[8px] uppercase tracking-widest text-ink-dim">{label}</span>
        <span className="font-mono text-base font-bold tabular" style={{ color }}>{value}</span>
        <span className="font-mono text-[8px] text-ink-faint truncate">{sub}</span>
      </div>
    </div>
  );
}

export function Analytics({ notes, visionIndex, ideaVelocity }: AnalyticsProps) {
  const activity = useMemo(() => buildActivitySeries(), []);
  const radar = useMemo(() => buildDomainRadar(), []);
  const velocity = useMemo(() => buildVelocity(), []);
  const avgCoh = useMemo(() => Math.round(notes.reduce((s, n) => s + n.coherence, 0) / notes.length), [notes]);
  const avgNov = useMemo(() => Math.round(notes.reduce((s, n) => s + n.novelty, 0) / notes.length), [notes]);

  // The entropy gauge drifts slowly with wall-clock time. Date.now() is impure,
  // so it is sampled into state on a timer rather than read during render.
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setClock(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const entropy = Math.round(72 + Math.sin(clock / 60_000) * 6);

  return (
    <div className="flex flex-col h-full p-2.5 gap-2.5 overflow-y-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Tile icon={<Layers size={14} />} label="vault" value={`${notes.length}`} sub="field notes" color="#34d399" />
        <Tile icon={<Activity size={14} />} label="neural" value={`${Math.round(activity[activity.length - 1].v)}`} sub="activity index" color="#22d3ee" />
        <Tile icon={<TrendingUp size={14} />} label="avg coh" value={`${avgCoh}`} sub="coherence μ" color="#a78bfa" />
        <Tile icon={<GaugeIcon size={14} />} label="novelty" value={`${avgNov}`} sub="novelty μ" color="#fbbf24" />
      </div>

      <div className="glass rounded-lg p-2 flex flex-col h-[150px]">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[9px] uppercase tracking-widest text-neon">cortical activity · 64h</span>
          <span className="font-mono text-[9px] text-ink-dim tabular">σ {ideaVelocity}/h</span>
        </div>
        <div className="flex-1 min-h-0"><AreaChart data={activity} color="#22d3ee" /></div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="glass rounded-lg p-2 flex flex-col h-[170px]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-violet mb-1">domain coherence</span>
          <div className="flex-1 min-h-0"><Radar data={radar} /></div>
        </div>
        <div className="glass rounded-lg p-2 flex flex-col h-[170px]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-flux mb-1">idea velocity</span>
          <div className="flex-1 min-h-0"><Bars data={velocity} /></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="glass rounded-lg flex flex-col items-center justify-center py-2">
          <Gauge value={visionIndex} size={84} color="#e879f9" label="vision" />
        </div>
        <div className="glass rounded-lg flex flex-col items-center justify-center py-2">
          <Gauge value={avgCoh} size={84} color="#22d3ee" label="coherence" />
        </div>
        <div className="glass rounded-lg flex flex-col items-center justify-center py-2">
          <Gauge value={entropy} size={84} color="#fbbf24" label="entropy" />
        </div>
      </div>
    </div>
  );
}
