import { describe, it, expect } from 'vitest';
import { tokenize, roundTrip, KEYWORDS, LANG_COLOR } from '../src/lib/highlight';
import { CODE_PROTOS } from '../src/lib/prototypes';

describe('tokenizer', () => {
  it('round-trips every prototype body without loss', () => {
    for (const p of CODE_PROTOS) expect(roundTrip(p.code)).toBe(true);
  });

  it('classifies comments, strings, numbers and keywords', () => {
    const tokens = tokenize('// note\nconst x = 42; // "s"\n');
    const kinds = tokens.filter((t) => t.kind !== 'ws').map((t) => t.kind);
    expect(kinds[0]).toBe('comment');
    expect(kinds).toContain('keyword'); // const
    expect(kinds).toContain('number'); // 42
  });

  it('treats Capitalised identifiers as types and keywords distinctly', () => {
    const t = tokenize('class Foo {}').filter((x) => x.kind !== 'ws');
    expect(t[0].kind).toBe('keyword');
    expect(t[1].kind).toBe('type');
  });

  it('has a language colour for every prototype language', () => {
    for (const p of CODE_PROTOS) expect(LANG_COLOR[p.language]).toBeTruthy();
  });

  it('keyword set is non-trivial', () => {
    expect(KEYWORDS.size).toBeGreaterThan(30);
  });
});
