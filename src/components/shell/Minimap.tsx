import { STAGE_W, STAGE_H, PANEL_META } from '../../lib/layout';
import type { MouseEvent } from 'react';
import type { PanelState } from '../../types';

interface MinimapProps {
  panels: PanelState[];
  pan: { x: number; y: number };
  scale: number;
  viewport: { w: number; h: number };
  onPanTo: (x: number, y: number) => void;
}

const MW = 168;
const MH = 96;

export function Minimap({ panels, pan, scale, viewport, onPanTo }: MinimapProps) {
  const sx = MW / STAGE_W;
  const sy = MH / STAGE_H;
  const vw = viewport.w / scale;
  const vh = viewport.h / scale;
  const vx = -pan.x / scale;
  const vy = -pan.y / scale;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / MW;
    const my = (e.clientY - rect.top) / MH;
    const targetX = mx * STAGE_W - vw / 2;
    const targetY = my * STAGE_H - vh / 2;
    onPanTo(-targetX * scale, -targetY * scale);
  };

  return (
    <div
      onClick={handleClick}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute bottom-3 right-3 z-[120] glass rounded-lg p-1.5 cursor-pointer group"
      style={{ width: MW + 12, height: MH + 12 }}
      title="Click to navigate"
    >
      <div className="relative" style={{ width: MW, height: MH }}>
        {/* panel rects */}
        {panels.filter((p) => p.visible).map((p) => {
          const meta = PANEL_META.find((m) => m.id === p.id);
          return (
            <div
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: p.x * sx, top: p.y * sy, width: p.w * sx, height: p.h * sy,
                background: `${meta?.accent ?? '#22d3ee'}55`,
                border: `1px solid ${meta?.accent ?? '#22d3ee'}aa`,
              }}
            />
          );
        })}
        {/* viewport indicator */}
        <div
          className="absolute border border-white/70 rounded-sm pointer-events-none"
          style={{
            left: Math.max(0, vx * sx), top: Math.max(0, vy * sy),
            width: Math.min(MW, vw * sx), height: Math.min(MH, vh * sy),
            boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
          }}
        />
      </div>
      <div className="font-mono text-[8px] uppercase tracking-widest text-ink-dim text-center mt-1">
        atlas · {(scale * 100).toFixed(0)}%
      </div>
    </div>
  );
}
