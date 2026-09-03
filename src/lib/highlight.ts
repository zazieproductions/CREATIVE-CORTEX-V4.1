/**
 * highlight.ts — a deliberately tiny, dependency-free source-code tokenizer.
 *
 * The Code Prototypes module shows speculative sketches in several languages.
 * Rather than pull in a syntax-highlighter dependency (prism / shiki) for a
 * decorative viewer, we run a single-pass regex tokenizer that classifies each
 * run of the source as comment, string, number, keyword, type, identifier,
 * whitespace, or punctuation.
 *
 * This module is pure (no JSX, no React) so it is unit-testable in Node and
 * keeps rendering concerns in the component layer. It is a documented
 * compromise, not a general highlighter: it is tuned to the six prototype bodies
 * in `prototypes.ts`, and an exotic new dialect may need KEYWORDS extended.
 */

export const LANG_COLOR: Record<string, string> = {
  typescript: '#2dd4bf',
  python: '#fbbf24',
  glsl: '#e879f9',
  rust: '#fb7185',
};

export const KEYWORDS = new Set([
  'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'export',
  'import', 'from', 'type', 'interface', 'new', 'void', 'this', 'public', 'private', 'fn', 'def',
  'mut', 'struct', 'impl', 'pub', 'use', 'enum', 'match', 'self', 'as', 'in', 'is', 'None', 'True',
  'False', 'and', 'or', 'not', 'lambda', 'with', 'try', 'except', 'raise', 'yield', 'async', 'await',
  'uniform', 'varying', 'attribute', 'float', 'int', 'vec2', 'vec3', 'vec4', 'mat4', 'out', 'inout',
  'bool', 'main', 'sampler2D', 'dataclass', 'print',
]);

/** Colour per token kind, shared with the viewer's span styles. */
export const TOKEN_COLORS = {
  comment: '#5b6478',
  string: '#4ade80',
  number: '#fbbf24',
  keyword: '#e879f9',
  type: '#22d3ee',
  ident: '#c8cadb',
  punct: '#8b90b0',
} as const;

export type TokenKind = keyof typeof TOKEN_COLORS | 'ws';

export interface Token {
  kind: TokenKind;
  text: string;
}

const TOKEN_RE =
  /(\/\/[^\n]*|#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+\.?\d*\b)|([A-Za-z_]\w*)|(\s+)|(.)/g;

/** Classify `code` into a flat list of tokens. Pure and deterministic. */
export function tokenize(code: string): Token[] {
  const out: Token[] = [];
  const re = new RegExp(TOKEN_RE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    const [, comment, str, num, ident, ws, other] = m;
    if (comment) out.push({ kind: 'comment', text: comment });
    else if (str) out.push({ kind: 'string', text: str });
    else if (num) out.push({ kind: 'number', text: num });
    else if (ident) {
      if (KEYWORDS.has(ident)) out.push({ kind: 'keyword', text: ident });
      else if (/^[A-Z]/.test(ident)) out.push({ kind: 'type', text: ident });
      else out.push({ kind: 'ident', text: ident });
    } else if (ws) out.push({ kind: 'ws', text: ws });
    else out.push({ kind: 'punct', text: other });
  }
  return out;
}

/**
 * Round-trip guarantee used by the tests: concatenating the tokens must
 * reproduce the source exactly, i.e. the tokenizer never drops or rewrites a
 * character.
 */
export function roundTrip(code: string): boolean {
  return tokenize(code).map((t) => t.text).join('') === code;
}
