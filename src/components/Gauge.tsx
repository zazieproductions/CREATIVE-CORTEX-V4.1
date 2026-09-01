interface GaugeProps {
  value: number;
  max?: number;
  size?: number;
  color?: string;
  label?: string;
  unit?: string;
}

export function Gauge({ value, max = 100, size = 96, color = '#a78bfa', label, unit = '%' }: GaugeProps) {
  const r = (size - 12) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const dash = circ * 0.75;
  const arc = dash * pct;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        <circle
          cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}aa)`, transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-bold tabular" style={{ color }}>{Math.round(value)}{unit}</span>
        {label && <span className="font-mono text-[8px] uppercase tracking-widest text-ink-dim mt-0.5">{label}</span>}
      </div>
    </div>
  );
}
