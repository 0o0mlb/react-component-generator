import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';
import { STORAGE_KEYS } from '../utils/storage';

const saved = { id: 's1', prompt: '저장됨', code: 'render(<div/>)', createdAt: '2026-01-01T00:00:00.000Z' };

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('useComponentGenerator 영속화', () => {
  it('저장된 컴포넌트 목록을 복원한다', () => {
    localStorage.setItem(STORAGE_KEYS.components, JSON.stringify([saved]));
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });

  it('생성에 성공하면 목록이 localStorage에 저장된다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'render(<p/>)' }) }),
    );
    const { result } = renderHook(() => useComponentGenerator());
    await act(() => result.current.generate('새 것', undefined, 'google'));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.components)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].prompt).toBe('새 것');
  });

  it('전체 삭제하면 저장된 목록도 비워진다', () => {
    localStorage.setItem(STORAGE_KEYS.components, JSON.stringify([saved]));
    const { result } = renderHook(() => useComponentGenerator());
    act(() => result.current.clearAll());
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.components)!)).toEqual([]);
  });
});
