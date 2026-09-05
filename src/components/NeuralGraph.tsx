import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { ConceptNode, Note } from '../types';
import { CONCEPTS, EDGES } from '../lib/concepts';
import { DOMAINS, DOMAIN_COLORS } from '../lib/banks';

interface NeuralGraphProps {
  notes: Note[];
  onOpenNote: (id: string) => void;
}

interface Pulse {
  /** Index into EDGES the pulse is currently travelling along. */
  i: number;
  /** Progress along the edge, 0..1. */
  t: number;
  /** Per-frame progress increment. */
  sp: number;
}

const VBW = 1080;
const VBH = 720;

const seedPulses = (): Pulse[] =>
  Array.from({ length: 18 }, () => ({
    i: Math.floor(Math.random() * EDGES.length),
    t: Math.random(),
    sp: 0.0035 + Math.random() * 0.007,
  }));

const createInitialNodes = (): ConceptNode[] => CONCEPTS.map((c) => ({ ...c }));

export function NeuralGraph({ notes, onOpenNote }: NeuralGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // The physics loop mutates these refs in place every frame (they never need
  // to trigger a render on their own). A snapshot is copied into state once per
  // frame so the SVG re-renders from plain state, never from ref reads. Both
  // the ref and the state start from the same factory, so their initial values
  // agree before the first animation frame overwrites the state.
  const nodesRef = useRef<ConceptNode[]>(createInitialNodes());
  const pulsesRef = useRef<Pulse[]>(seedPulses());
  const dragRef = useRef<string | null>(null);

  const [nodes, setNodes] = useState<ConceptNode[]>(createInitialNodes);
  const [pulses, setPulses] = useState<Pulse[]>(seedPulses);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const nodeById = (id: string) => nodes.find((n) => n.id === id);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const ns = nodesRef.current;
      const K_REP = 1500;
      const K_SPR = 0.014;
      const IDEAL = 158;

      // Damping.
      for (const n of ns) { n.vx *= 0.85; n.vy *= 0.85; }

      // Repulsion between every node pair.
      for (let i = 0; i < ns.length; i++) {
        const a = ns[i];
        for (let j = i + 1; j < ns.length; j++) {
          const b = ns[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          let d2 = dx * dx + dy * dy; if (d2 < 1) d2 = 1;
          const d = Math.sqrt(d2);
          const f = K_REP / d2;
          const fx = (f * dx) / d, fy = (f * dy) / d;
          if (dragRef.current !== a.id) { a.vx += fx; a.vy += fy; }
          if (dragRef.current !== b.id) { b.vx -= fx; b.vy -= fy; }
        }
      }

      // Spring attraction along edges (weighted).
      for (const e of EDGES) {
        const a = ns.find((n) => n.id === e.source)!;
        const b = ns.find((n) => n.id === e.target)!;
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - IDEAL) * K_SPR * e.weight;
        const fx = (f * dx) / d, fy = (f * dy) / d;
        if (dragRef.current !== a.id) { a.vx += fx; a.vy += fy; }
        if (dragRef.current !== b.id) { b.vx -= fx; b.vy -= fy; }
      }

      // Weak gravity toward the canvas centre + jitter keeps the field from
      // collapsing into a single point or drifting off-screen.
      for (const n of ns) {
        if (dragRef.current === n.id) continue;
        n.vx += (VBW / 2 - n.x) * 0.0006;
        n.vy += (VBH / 2 - n.y) * 0.0006;
        n.vx += (Math.random() - 0.5) * 0.06;
        n.vy += (Math.random() - 0.5) * 0.06;
        n.x = Math.max(46, Math.min(VBW - 46, n.x + n.vx));
        n.y = Math.max(40, Math.min(VBH - 40, n.y + n.vy));
      }

      // Advance the travelling pulses.
      for (const p of pulsesRef.current) {
        p.t += p.sp;
        if (p.t > 1) { p.t = 0; p.i = Math.floor(Math.random() * EDGES.length); }
      }

      // Snapshot into render state.
      setNodes(ns.map((n) => ({ ...n })));
      setPulses(pulsesRef.current.map((p) => ({ ...p })));
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
    setSelectedId(n.id);
  };
  const onNodeMove = (e: PointerEvent) => {
    if (!dragRef.current) return;
    const { x, y } = toSvg(e.clientX, e.clientY);
    // Mutate the physics working set directly; the next frame's snapshot
    // propagates the change into render state.
    const n = nodesRef.current.find((m) => m.id === dragRef.current);
    if (n) { n.x = x; n.y = y; n.vx = 0; n.vy = 0; }
  };
  const onNodeUp = (e: PointerEvent) => {
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
  };

  const recenter = () => {
    nodesRef.current = CONCEPTS.map((c) => ({ ...c }));
    setNodes(nodesRef.current.map((n) => ({ ...n })));
    setSelectedId(null);
  };

  const selected = selectedId ? nodeById(selectedId) : null;
  const activeId = selectedId ?? hover;
  const neighborIds = activeId
    ? EDGES.filter((e) => e.source === activeId || e.target === activeId)
        .map((e) => (e.source === activeId ? e.target : e.source))
    : [];
  const related = selectedId ? notes.filter((nt) => nt.conceptId === selectedId).slice(0, 4) : [];

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
            const a = nodeById(e.source); const b = nodeById(e.target);
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
            const a = nodeById(e.source); const b = nodeById(e.target);
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
            const isSel = selectedId === n.id;
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
            <button onClick={() => setSelectedId(null)} className="text-ink-dim hover:text-flux text-xs px-1">✕</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {neighborIds.slice(0, 8).map((id) => {
              const nb = nodeById(id);
              return nb ? (
                <button key={id} onClick={() => setSelectedId(id)} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.07] text-ink-dim hover:text-ink hover:border-white/20 transition-colors">
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
