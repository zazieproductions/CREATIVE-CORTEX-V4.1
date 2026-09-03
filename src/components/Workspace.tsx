import { useEffect, useRef, useState, type ReactNode, type PointerEvent, type WheelEvent } from 'react';
import { Plus, Minus, Locate } from 'lucide-react';
import { Panel } from './Panel';
import { Minimap } from './Minimap';
import { PANEL_META, STAGE_W, STAGE_H } from '../lib/layout';
import { ICONS } from '../lib/icons';
import type { PanelState } from '../types';

interface WorkspaceProps {
  panels: PanelState[];
  raisedId: string | null;
  focusTarget: string | null;
  /** Increments every time a panel is focused, even when it is already the
   *  focused panel, so re-focusing the same module re-centers it. */
  focusNonce: number;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, w: number, h: number) => void;
  onHide: (id: string) => void;
  onExpand: (id: string) => void;
  onRaise: (id: string) => void;
  onViewport: (vp: { w: number; h: number }) => void;
  renderContent: (id: string) => ReactNode;
}

interface View { pan: { x: number; y: number }; scale: number; }

const clampPan = (pan: { x: number; y: number }, scale: number, vw: number, vh: number) => {
  const sw = STAGE_W * scale;
  const sh = STAGE_H * scale;
  const cx = (v: number, s: number, c: number) => Math.min(Math.max(v, Math.min(0, c - s)), Math.max(0, c - s));
  return { x: cx(pan.x, sw, vw), y: cx(pan.y, sh, vh) };
};

export function Workspace({
  panels, raisedId, focusTarget, focusNonce, onMove, onResize, onHide, onExpand, onRaise, onViewport, renderContent,
}: WorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState({ w: 1200, h: 700 });
  const [view, setView] = useState<View>({ pan: { x: 0, y: 0 }, scale: 1 });
  const [panning, setPanning] = useState(false);
  const panRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // ResizeObserver callback is an event handler, so updating `view` here (to
    // re-clamp the pan against the new viewport) is event-driven, not an
    // effect-side-effect.
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      setVp({ w, h });
      onViewport({ w, h });
      setView((v) => ({ ...v, pan: clampPan(v.pan, v.scale, w, h) }));
    });
    ro.observe(el);
    onViewport({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [onViewport]);

  // Center the focused panel. This runs during render via the "adjust state on
  // prop change" pattern rather than inside an effect: when `focusNonce`
  // advances we recompute the view once and record the nonce we handled.
  const [handledNonce, setHandledNonce] = useState(focusNonce);
  if (focusNonce !== handledNonce) {
    setHandledNonce(focusNonce);
    if (focusTarget) {
      const st = panels.find((p) => p.id === focusTarget);
      if (st) {
        const wx = st.x + st.w / 2;
        const wy = st.y + st.h / 2;
        const scale = view.scale;
        setView((v) => ({
          scale: v.scale,
          pan: clampPan({ x: vp.w / 2 - wx * scale, y: vp.h / 2 - wy * scale }, scale, vp.w, vp.h),
        }));
      }
    }
  }

  const startPan = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    panRef.current = { px: e.clientX, py: e.clientY, ox: view.pan.x, oy: view.pan.y };
    setPanning(true);
  };
  const movePan = (e: PointerEvent) => {
    if (!panRef.current) return;
    const dx = e.clientX - panRef.current.px;
    const dy = e.clientY - panRef.current.py;
    setView((v) => ({ ...v, pan: clampPan({ x: panRef.current!.ox + dx, y: panRef.current!.oy + dy }, v.scale, vp.w, vp.h) }));
  };
  const endPan = (e: PointerEvent) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    panRef.current = null;
    setPanning(false);
  };

  const zoomAt = (factor: number, cx?: number, cy?: number) => {
    setView((v) => {
      const ns = Math.max(0.45, Math.min(1.5, v.scale * factor));
      const px = cx ?? vp.w / 2;
      const py = cy ?? vp.h / 2;
      const wx = (px - v.pan.x) / v.scale;
      const wy = (py - v.pan.y) / v.scale;
      return { scale: ns, pan: clampPan({ x: px - wx * ns, y: py - wy * ns }, ns, vp.w, vp.h) };
    });
  };

  const onWheel = (e: WheelEvent) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - rect.left, e.clientY - rect.top);
  };

  const fit = () => {
    const scale = Math.max(0.45, Math.min(vp.w / STAGE_W, vp.h / STAGE_H) * 0.96);
    const pan = clampPan({ x: (vp.w - STAGE_W * scale) / 2, y: (vp.h - STAGE_H * scale) / 2 }, scale, vp.w, vp.h);
    setView({ scale, pan });
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-cortex"
      onPointerDown={startPan}
      onPointerMove={movePan}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      onWheel={onWheel}
      style={{ cursor: panning ? 'grabbing' : 'default' }}
    >
      {/* atmospheric backdrop — asset path via BASE_URL so relative builds
          (e.g. GitHub Pages) resolve it against the deployed sub-path */}
      <img src={`${import.meta.env.BASE_URL}atlas-bg.svg`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none mix-blend-screen" />

      {/* stage */}
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(${view.pan.x}px, ${view.pan.y}px) scale(${view.scale})` }}
      >
        {/* stage grid backdrop */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(120,130,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(120,130,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.6)' }} />

        {PANEL_META.map((m) => {
          const st = panels.find((p) => p.id === m.id);
          if (!st || !st.visible) return null;
          const Icon = ICONS[m.icon] ?? ICONS.layers;
          return (
            <Panel
              key={m.id}
              state={st}
              scale={view.scale}
              z={raisedId === m.id ? 60 : 20}
              accent={m.accent}
              icon={<Icon size={14} />}
              title={m.title}
              subtitle={m.subtitle}
              onMove={onMove}
              onResize={onResize}
              onHide={onHide}
              onExpand={onExpand}
              onRaise={onRaise}
            >
              {renderContent(m.id)}
            </Panel>
          );
        })}
      </div>

      {/* zoom controls */}
      <div onPointerDown={(e) => e.stopPropagation()} className="absolute bottom-3 left-3 z-[120] flex items-center gap-1 glass rounded-lg p-1">
        <button onClick={() => zoomAt(1.18)} className="p-1.5 rounded hover:bg-white/10 text-ink-dim hover:text-neon transition-colors" title="Zoom in"><Plus size={14} /></button>
        <span className="font-mono text-[9px] tabular text-ink-dim w-9 text-center">{Math.round(view.scale * 100)}%</span>
        <button onClick={() => zoomAt(0.85)} className="p-1.5 rounded hover:bg-white/10 text-ink-dim hover:text-neon transition-colors" title="Zoom out"><Minus size={14} /></button>
        <div className="w-px h-5 bg-white/10 mx-0.5" />
        <button onClick={fit} className="p-1.5 rounded hover:bg-white/10 text-ink-dim hover:text-neon transition-colors" title="Fit"><Locate size={14} /></button>
      </div>

      <Minimap
        panels={panels}
        pan={view.pan}
        scale={view.scale}
        viewport={vp}
        onPanTo={(x, y) => setView((v) => ({ ...v, pan: clampPan({ x, y }, v.scale, vp.w, vp.h) }))}
      />

      {/* edge fades */}
      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 80px rgba(6,6,13,0.8)' }} />
    </div>
  );
}
