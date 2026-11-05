import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  readStorage,
  writeStorage,
  parseProvider,
  parseApiKeys,
  parseHistory,
  parseComponents,
  addToHistory,
  HISTORY_MAX,
} from './storage';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('readStorage', () => {
  it('키가 없으면 fallback을 반환한다', () => {
    expect(readStorage('k', 'fb', parseProvider as never)).toBe('fb');
  });

  it('저장된 값을 parse해서 반환한다', () => {
    localStorage.setItem('k', JSON.stringify('google'));
    expect(readStorage('k', 'anthropic', parseProvider)).toBe('google');
  });

  it('JSON이 깨져 있으면 fallback을 반환한다', () => {
    localStorage.setItem('k', '{broken');
    expect(readStorage('k', 'anthropic', parseProvider)).toBe('anthropic');
  });

  it('parse가 undefined를 반환하면 fallback을 반환한다', () => {
    localStorage.setItem('k', JSON.stringify('openai'));
    expect(readStorage('k', 'anthropic', parseProvider)).toBe('anthropic');
  });

  it('localStorage 접근이 throw해도 fallback을 반환한다', () => {
    vi.spyOn(Object.getPrototypeOf(localStorage), 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readStorage('k', 'anthropic', parseProvider)).toBe('anthropic');
  });
});

describe('writeStorage', () => {
  it('값을 JSON으로 저장한다', () => {
    writeStorage('k', { a: 1 });
    expect(localStorage.getItem('k')).toBe('{"a":1}');
  });

  it('setItem이 throw해도 예외를 던지지 않는다', () => {
    vi.spyOn(Object.getPrototypeOf(localStorage), 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => writeStorage('k', 1)).not.toThrow();
  });
});

describe('parseProvider', () => {
  it('허용된 provider만 통과시킨다', () => {
    expect(parseProvider('anthropic')).toBe('anthropic');
    expect(parseProvider('google')).toBe('google');
    expect(parseProvider('openai')).toBeUndefined();
    expect(parseProvider(1)).toBeUndefined();
  });
});

describe('parseApiKeys', () => {
  it('provider별 문자열 키를 읽고 없는 값은 빈 문자열로 채운다', () => {
    expect(parseApiKeys({ google: 'AIza' })).toEqual({ anthropic: '', google: 'AIza' });
  });

  it('문자열이 아닌 값은 빈 문자열로 처리한다', () => {
    expect(parseApiKeys({ anthropic: 5, google: 'g' })).toEqual({ anthropic: '', google: 'g' });
  });

  it('객체가 아니면 undefined를 반환한다', () => {
    expect(parseApiKeys(null)).toBeUndefined();
    expect(parseApiKeys('x')).toBeUndefined();
  });
});

describe('parseHistory', () => {
  it('문자열 배열만 남긴다', () => {
    expect(parseHistory(['a', 1, 'b', null])).toEqual(['a', 'b']);
  });

  it('배열이 아니면 undefined를 반환한다', () => {
    expect(parseHistory({})).toBeUndefined();
  });
});

describe('parseComponents', () => {
  const valid = { id: '1', prompt: 'p', code: 'c', createdAt: '2026-01-02T03:04:05.000Z' };

  it('createdAt을 Date로 복원한다', () => {
    const [c] = parseComponents([valid])!;
    expect(c.createdAt).toBeInstanceOf(Date);
    expect(c.createdAt.toISOString()).toBe(valid.createdAt);
  });

  it('형식이 잘못된 항목은 버린다', () => {
    const result = parseComponents([valid, { id: '2' }, { ...valid, createdAt: 'nope' }, null]);
    expect(result).toHaveLength(1);
  });

  it('배열이 아니면 undefined를 반환한다', () => {
    expect(parseComponents('x')).toBeUndefined();
  });
});

describe('addToHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addToHistory(['a'], 'b')).toEqual(['b', 'a']);
  });

  it('중복이면 기존 항목을 제거하고 맨 앞으로 옮긴다', () => {
    expect(addToHistory(['a', 'b'], 'b')).toEqual(['b', 'a']);
  });

  it('빈 프롬프트는 무시한다', () => {
    expect(addToHistory(['a'], '   ')).toEqual(['a']);
  });

  it(`최대 ${HISTORY_MAX}개까지만 유지한다`, () => {
    const full = Array.from({ length: HISTORY_MAX }, (_, i) => `p${i}`);
    const next = addToHistory(full, 'new');
    expect(next).toHaveLength(HISTORY_MAX);
    expect(next[0]).toBe('new');
  });
});
