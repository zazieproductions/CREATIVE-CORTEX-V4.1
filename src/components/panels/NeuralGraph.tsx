import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { ConceptNode, Note } from '../../types';
import { CONCEPTS, EDGES } from '../../lib/concepts';
import { DOMAINS, DOMAIN_COLORS } from '../../lib/banks';
import { FORCE } from '../../lib/config';

interface NeuralGraphProps {
  notes: Note[];
  onOpenNote: (id: string) => void;
}

const VBW = 1080;
const VBH = 720;

export function NeuralGraph({ notes, onOpenNote }: NeuralGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<ConceptNode[]>(CONCEPTS.map((c) => ({ ...c })));
  const pulsesRef = useRef<{ i: number; t: number; sp: number }[]>([]);
  const dragRef = useRef<string | null>(null);
  // O(1) lookup for the force loop. Node objects are mutated in place, so the
  // Map stays valid; it is rebuilt only when the array is replaced (recenter).
  const mapRef = useRef<Map<string, ConceptNode> | null>(null);
  const [, setTick] = useState(0);
  const [selected, setSelected] = useState<ConceptNode | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const nodeById = (id: string) =>
    (mapRef.current ??= new Map(nodesRef.current.map((n) => [n.id, n]))).get(id);

  useEffect(() => {
    pulsesRef.current = Array.from({ length: 18 }, () => ({
      i: Math.floor(Math.random() * EDGES.length),
      t: Math.random(),
      sp: 0.0035 + Math.random() * 0.007,
    }));
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const nodes = nodesRef.current;
      const K_REP = FORCE.repulsion;
      const K_SPR = FORCE.spring;
      const IDEAL = FORCE.restLength;
      for (const n of nodes) { n.vx *= FORCE.damping; n.vy *= FORCE.damping; }
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          let d2 = dx * dx + dy * dy; if (d2 < 1) d2 = 1;
          const d = Math.sqrt(d2);
          const f = K_REP / d2;
          const fx = (f * dx) / d, fy = (f * dy) / d;
          if (dragRef.current !== a.id) { a.vx += fx; a.vy += fy; }
          if (dragRef.current !== b.id) { b.vx -= fx; b.vy -= fy; }
        }
      }
      for (const e of EDGES) {
        const a = nodeById(e.source)!; const b = nodeById(e.target)!;
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - IDEAL) * K_SPR * e.weight;
        const fx = (f * dx) / d, fy = (f * dy) / d;
        if (dragRef.current !== a.id) { a.vx += fx; a.vy += fy; }
        if (dragRef.current !== b.id) { b.vx -= fx; b.vy -= fy; }
      }
      for (const n of nodes) {
        if (dragRef.current === n.id) continue;
        n.vx += (VBW / 2 - n.x) * FORCE.centering;
        n.vy += (VBH / 2 - n.y) * FORCE.centering;
        n.vx += (Math.random() - 0.5) * FORCE.jitter;
        n.vy += (Math.random() - 0.5) * FORCE.jitter;
        n.x = Math.max(46, Math.min(VBW - 46, n.x + n.vx));
        n.y = Math.max(40, Math.min(VBH - 40, n.y + n.vy));
      }
      for (const p of pulsesRef.current) {
        p.t += p.sp;
        if (p.t > 1) { p.t = 0; p.i = Math.floor(Math.random() * EDGES.length); }
      }
      setTick((t) => (t + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toSvg = (cx: number, cy: number) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy;
    const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const onNodeDown = (e: PointerEvent, n: ConceptNode) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragRef.current = n.id;
    setSelected(n);
  };
  const onNodeMove = (e: PointerEvent) => {
    if (!dragRef.current) return;
    const { x, y } = toSvg(e.clientX, e.clientY);
    const n = nodeById(dragRef.current);
    if (n) { n.x = x; n.y = y; n.vx = 0; n.vy = 0; }
  };
  const onNodeUp = (e: PointerEvent) => {
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
  };

  const recenter = () => {
    nodesRef.current = CONCEPTS.map((c) => ({ ...c }));
    mapRef.current = new Map(nodesRef.current.map((n) => [n.id, n]));
    setSelected(null);
  };

  const nodes = nodesRef.current;
  const pulses = pulsesRef.current;
  const activeId = selected?.id ?? hover;
  const neighborIds = activeId
    ? EDGES.filter((e) => e.source === activeId || e.target === activeId)
        .map((e) => (e.source === activeId ? e.target : e.source))
    : [];
  const related = selected ? notes.filter((nt) => nt.conceptId === selected.id).slice(0, 4) : [];

  return (
    <div className="relative w-full h-full bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.06),transparent_60%)]">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VBW} ${VBH}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full touch-none"
        onPointerDown={(e) => e.stopPropagation()}
        onDoubleClick={recenter}
      >
        <defs>
          {DOMAINS.map((d) => (
            <radialGradient key={d} id={`g-${d.replace(/\s|-/g, '')}`}>
              <stop offset="0%" stopColor={DOMAIN_COLORS[d]} stopOpacity="1" />
              <stop offset="55%" stopColor={DOMAIN_COLORS[d]} stopOpacity="0.85" />
              <stop offset="100%" stopColor={DOMAIN_COLORS[d]} stopOpacity="0.25" />
            </radialGradient>
          ))}
        </defs>

        {/* edges */}
        <g>
          {EDGES.map((e) => {
            const a = nodeById(e.source)!; const b = nodeById(e.target)!;
            if (!a || !b) return null;
            const lit = activeId && (e.source === activeId || e.target === activeId);
            return (
              <line
                key={e.id}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={lit ? '#ffffff' : e.bridge ? '#3a3e70' : '#2a3a6a'}
                strokeWidth={lit ? 1.8 : e.bridge ? 0.6 : 1}
                strokeDasharray={e.bridge ? '3 5' : undefined}
                opacity={activeId ? (lit ? 0.9 : 0.12) : e.bridge ? 0.4 : 0.7}
              />
            );
          })}
        </g>

        {/* pulses */}
        <g>
          {pulses.map((p, idx) => {
            const e = EDGES[p.i]; if (!e) return null;
            const a = nodeById(e.source)!; const b = nodeById(e.target)!;
            if (!a || !b) return null;
            const x = a.x + (b.x - a.x) * p.t;
            const y = a.y + (b.y - a.y) * p.t;
            const op = Math.sin(p.t * Math.PI);
            return (
              <circle key={idx} cx={x} cy={y} r={2.6} fill={DOMAIN_COLORS[a.domain]} opacity={0.85 * op}>
                <animate attributeName="r" values="2;3.6;2" dur="1.2s" repeatCount="indefinite" />
              </circle>
            );
          })}
        </g>

        {/* nodes */}
        <g>
          {nodes.map((n) => {
            const isSel = selected?.id === n.id;
            const isHover = hover === n.id;
            const isNb = neighborIds.includes(n.id);
            const r = n.r + (isSel ? 4 : isHover ? 2 : 0);
            const grad = `url(#g-${n.domain.replace(/\s|-/g, '')})`;
            const showLabel = isSel || isHover || isNb;
            return (
              <g key={n.id} className="cursor-pointer">
                {(isSel || isHover) && (
                  <circle cx={n.x} cy={n.y} r={r + 8} fill="none" stroke={DOMAIN_COLORS[n.domain]} strokeWidth="1" opacity="0.5">
                    <animate attributeName="r" values={`${r + 6};${r + 12};${r + 6}`} dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={n.x} cy={n.y} r={r} fill={grad}
                  onPointerDown={(e) => onNodeDown(e, n)}
                  onPointerMove={onNodeMove}
                  onPointerUp={onNodeUp}
                  onPointerEnter={() => setHover(n.id)}
                  onPointerLeave={() => setHover(null)}
                  style={{ filter: `drop-shadow(0 0 ${isSel ? 8 : 4}px ${DOMAIN_COLORS[n.domain]})` }}
                  opacity={activeId && !isSel && !isHover && !isNb ? 0.35 : 1}
                />
                <circle cx={n.x} cy={n.y} r={r * 0.4} fill="#fff" opacity={isSel ? 0.9 : 0.55} pointerEvents="none" />
                {showLabel && (
                  <text
                    x={n.x} y={n.y + r + 12} textAnchor="middle"
                    fill={isSel ? '#fff' : '#c8cadb'} fontSize="11"
                    fontFamily="JetBrains Mono, monospace" pointerEvents="none"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
                  >
                    {n.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* hint */}
      {!selected && (
        <div className="absolute top-2 left-2 font-mono text-[9px] text-ink-dim uppercase tracking-widest pointer-events-none">
          drag nodes · click to inspect · dbl-click to recenter
        </div>
      )}

      {/* inspector */}
      {selected && (
        <div className="absolute bottom-2 left-2 right-2 glass-strong rounded-lg p-3 border border-white/10 max-h-[46%] overflow-auto">
          <div className="flex items-start gap-2">
            <span className="mt-1 h-2.5 w-2.5 rounded-full shrink-0" style={{ background: DOMAIN_COLORS[selected.domain], boxShadow: `0 0 8px ${DOMAIN_COLORS[selected.domain]}` }} />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[11px] font-semibold text-ink truncate">{selected.label}</div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-ink-dim">{selected.domain}</div>
            </div>
            <button onClick={() => setSelected(null)} className="text-ink-dim hover:text-flux text-xs px-1">✕</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {neighborIds.slice(0, 8).map((id) => {
              const nb = nodeById(id);
              return nb ? (
                <button key={id} onClick={() => setSelected(nb)} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.07] text-ink-dim hover:text-ink hover:border-white/20 transition-colors">
                  {nb.label}
                </button>
              ) : null;
            })}
          </div>
          {related.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="font-mono text-[8px] uppercase tracking-widest text-ink-dim">linked notes</div>
              {related.map((nt) => (
                <button key={nt.id} onClick={() => onOpenNote(nt.id)} className="block w-full text-left font-mono text-[10px] text-ink/80 hover:text-neon truncate transition-colors">
                  <span className="text-ink-faint">{nt.id}</span> · {nt.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
