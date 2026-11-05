import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Node 25+는 --localstorage-file 없이 깨진 전역 localStorage를 노출해 jsdom 것을 가린다.
// 정상 동작하지 않으면 메모리 기반 구현으로 대체한다.
function hasWorkingLocalStorage(): boolean {
  try {
    return typeof localStorage?.getItem === 'function';
  } catch {
    return false;
  }
}

if (!hasWorkingLocalStorage()) {
  class MemoryStorage {
    private store = new Map<string, string>();
    get length() {
      return this.store.size;
    }
    key(index: number) {
      return [...this.store.keys()][index] ?? null;
    }
    getItem(key: string) {
      return this.store.get(key) ?? null;
    }
    setItem(key: string, value: string) {
      this.store.set(key, String(value));
    }
    removeItem(key: string) {
      this.store.delete(key);
    }
    clear() {
      this.store.clear();
    }
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
}

// 각 테스트 후 렌더된 DOM을 정리해 테스트 간 격리를 보장한다.
afterEach(() => {
  cleanup();
});
