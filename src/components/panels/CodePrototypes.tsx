import { useState } from 'react';
import { Terminal, ChevronRight } from 'lucide-react';
import { CODE_PROTOS } from '../../lib/prototypes';
import type { CodeProto } from '../../types';
import { tokenize, LANG_COLOR, TOKEN_COLORS, type Token } from '../../lib/highlight';

interface CodePrototypesProps {
  onOpen: (p: CodeProto) => void;
}

export function CodePrototypes({ onOpen }: CodePrototypesProps) {
  const [active, setActive] = useState<string | null>(CODE_PROTOS[0].id);
  return (
    <div className="flex flex-col h-full">
      <div className="overflow-y-auto p-2 space-y-1.5 flex-1">
        {CODE_PROTOS.map((p) => {
          const color = LANG_COLOR[p.language] ?? '#2dd4bf';
          const isActive = active === p.id;
          return (
            <button
              key={p.id}
              onClick={() => { setActive(p.id); onOpen(p); }}
              className="group w-full text-left rounded-lg p-2.5 bg-white/[0.02] hover:bg-white/[0.05] border transition-all"
              style={{ borderColor: isActive ? `${color}55` : 'rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-center gap-2">
                <Terminal size={12} style={{ color }} />
                <span className="font-mono text-[11px] font-semibold text-ink truncate flex-1">{p.title}</span>
                <span className="font-mono text-[8px] px-1.5 py-0.5 rounded shrink-0" style={{ color, background: `${color}14`, border: `1px solid ${color}33` }}>{p.language}</span>
                <ChevronRight size={12} className="text-ink-faint group-hover:text-ink transition-colors shrink-0" />
              </div>
              <div className="font-mono text-[9px] text-ink-dim mt-1 line-clamp-2 leading-relaxed">{p.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CodeView({ proto }: { proto: CodeProto }) {
  const color = LANG_COLOR[proto.language] ?? '#2dd4bf';
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ color, background: `${color}14`, border: `1px solid ${color}33` }}>{proto.language}</span>
        <span className="font-mono text-[9px] text-ink-dim">{proto.domain}</span>
      </div>
      <h2 className="font-display text-lg font-semibold text-ink mb-1">{proto.title}</h2>
      <p className="text-[13px] text-ink/75 leading-relaxed mb-4">{proto.description}</p>
      <pre className="rounded-xl p-4 overflow-auto text-[12px] leading-relaxed font-mono" style={{ background: '#06060d', border: '1px solid rgba(255,255,255,0.07)' }}>
        <code>{tokenize(proto.code).map((t: Token, i: number) =>
          t.kind === 'ws' ? (
            <span key={i}>{t.text}</span>
          ) : (
            <span key={i} style={{ color: TOKEN_COLORS[t.kind], fontStyle: t.kind === 'comment' ? 'italic' : undefined }}>{t.text}</span>
          ),
        )}</code>
      </pre>
    </div>
  );
}
