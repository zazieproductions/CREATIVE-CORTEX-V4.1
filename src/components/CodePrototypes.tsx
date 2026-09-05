import { useState, type ReactNode } from 'react';
import { Terminal, ChevronRight } from 'lucide-react';
import { CODE_PROTOS } from '../lib/generate';
import type { CodeProto } from '../types';

const LANG_COLOR: Record<string, string> = {
  typescript: '#2dd4bf',
  python: '#fbbf24',
  glsl: '#e879f9',
  rust: '#fb7185',
};

const KEYWORDS = new Set([
  'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'export',
  'import', 'from', 'type', 'interface', 'new', 'void', 'this', 'public', 'private', 'fn', 'def',
  'mut', 'struct', 'impl', 'pub', 'use', 'enum', 'match', 'self', 'as', 'in', 'is', 'None', 'True',
  'False', 'and', 'or', 'not', 'lambda', 'with', 'try', 'except', 'raise', 'yield', 'async', 'await',
  'uniform', 'varying', 'attribute', 'float', 'int', 'vec2', 'vec3', 'vec4', 'mat4', 'out', 'inout',
  'bool', 'main', 'sampler2D', 'dataclass', 'print', 'self',
]);

function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\/\/[^\n]*|#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+\.?\d*\b)|([A-Za-z_]\w*)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(code))) {
    const [, comment, str, num, ident, ws, other] = m;
    if (comment) out.push(<span key={k++} style={{ color: '#5b6478', fontStyle: 'italic' }}>{comment}</span>);
    else if (str) out.push(<span key={k++} style={{ color: '#4ade80' }}>{str}</span>);
    else if (num) out.push(<span key={k++} style={{ color: '#fbbf24' }}>{num}</span>);
    else if (ident) {
      if (KEYWORDS.has(ident)) out.push(<span key={k++} style={{ color: '#e879f9' }}>{ident}</span>);
      else if (/^[A-Z]/.test(ident)) out.push(<span key={k++} style={{ color: '#22d3ee' }}>{ident}</span>);
      else out.push(<span key={k++} style={{ color: '#c8cadb' }}>{ident}</span>);
    } else if (ws) out.push(<span key={k++}>{ws}</span>);
    else out.push(<span key={k++} style={{ color: '#8b90b0' }}>{other}</span>);
  }
  return out;
}

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
        <code>{highlight(proto.code)}</code>
      </pre>
    </div>
  );
}
