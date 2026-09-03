import { useRef, useState, type ReactNode, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, X, GripVertical } from 'lucide-react';
import type { PanelState } from '../../types';

interface PanelProps {
  state: PanelState;
  scale: number;
  z: number;
  accent?: string;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, w: number, h: number) => void;
  onHide: (id: string) => void;
  onExpand: (id: string) => void;
  onRaise: (id: string) => void;
  children: ReactNode;
}

export function Panel({
  state, scale, z, accent = '#22d3ee', icon, title, subtitle,
  onMove, onResize, onHide, onExpand, onRaise, children,
}: PanelProps) {
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const rsize = useRef<{ px: number; py: number; w: number; h: number } | null>(null);
  const [mode, setMode] = useState<'none' | 'drag' | 'resize'>('none');

  const startDrag = (e: PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: state.x, y: state.y };
    setMode('drag');
    onRaise(state.id);
  };
  const startResize = (e: PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    rsize.current = { px: e.clientX, py: e.clientY, w: state.w, h: state.h };
    setMode('resize');
    onRaise(state.id);
  };
  const onMoveEv = (e: PointerEvent) => {
    if (drag.current) {
      const dx = (e.clientX - drag.current.px) / scale;
      const dy = (e.clientY - drag.current.py) / scale;
      onMove(state.id, Math.round((drag.current.x + dx) / 8) * 8, Math.round((drag.current.y + dy) / 8) * 8);
    } else if (rsize.current) {
      const dx = (e.clientX - rsize.current.px) / scale;
      const dy = (e.clientY - rsize.current.py) / scale;
      onResize(state.id, Math.max(280, Math.round(rsize.current.w + dx)), Math.max(200, Math.round(rsize.current.h + dy)));
    }
  };
  const end = (e: PointerEvent) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    drag.current = null;
    rsize.current = null;
    setMode('none');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="glass absolute rounded-xl flex flex-col overflow-hidden"
      style={{
        left: state.x, top: state.y, width: state.w, height: state.h, zIndex: z,
        boxShadow: mode !== 'none'
          ? `0 0 0 1px ${accent}66, 0 22px 60px -20px ${accent}88`
          : `0 12px 40px -22px rgba(0,0,0,0.7)`,
        borderColor: `${accent}33`,
      }}
    >
      <header
        onPointerDown={startDrag}
        onPointerMove={onMoveEv}
        onPointerUp={end}
        onPointerCancel={end}
        className="flex items-center gap-2 px-3 h-9 border-b border-white/[0.06] cursor-grab active:cursor-grabbing select-none shrink-0"
        style={{ background: `linear-gradient(90deg, ${accent}1a, transparent 70%)` }}
      >
        <span className="shrink-0" style={{ color: accent }}>{icon}</span>
        <div className="flex flex-col leading-none min-w-0">
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase truncate" style={{ color: accent }}>
            {title}
          </span>
          {subtitle && (
            <span className="font-mono text-[9px] text-ink-dim tracking-wide truncate">{subtitle}</span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1 shrink-0">
          <GripVertical size={13} className="text-ink-faint" />
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onExpand(state.id)}
            className="p-1 rounded hover:bg-white/10 text-ink-dim hover:text-ink transition-colors"
            title="Expand"
          >
            <Maximize2 size={13} />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onHide(state.id)}
            className="p-1 rounded hover:bg-white/10 text-ink-dim hover:text-flux transition-colors"
            title="Hide"
          >
            <X size={13} />
          </button>
        </div>
      </header>
      <div className="flex-1 min-h-0 overflow-hidden relative" onPointerDown={(e) => e.stopPropagation()}>{children}</div>
      <div
        onPointerDown={startResize}
        onPointerMove={onMoveEv}
        onPointerUp={end}
        onPointerCancel={end}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-10"
        style={{ color: accent }}
      >
        <svg viewBox="0 0 16 16" className="w-full h-full opacity-60">
          <path d="M16 6 L6 16 M16 11 L11 16" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </div>
    </motion.div>
  );
}
