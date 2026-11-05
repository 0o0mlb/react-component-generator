// localStorage 영속화용 순수 함수 모음. 접근 실패(차단, 용량 초과, 깨진 JSON)는 모두 조용히 무시한다.
import type { GeneratedComponent, Provider } from '../types';

export const HISTORY_MAX = 20;

const PROVIDERS: readonly Provider[] = ['anthropic', 'google'];

export const STORAGE_KEYS = {
  provider: 'rcg.provider',
  apiKeys: 'rcg.apiKeys',
  history: 'rcg.promptHistory',
  components: 'rcg.components',
} as const;

export function readStorage<T>(key: string, fallback: T, parse: (raw: unknown) => T | undefined): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    return parse(JSON.parse(stored)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 앱 동작에 영향을 주지 않는다.
  }
}

export function parseProvider(raw: unknown): Provider | undefined {
  return PROVIDERS.find((p) => p === raw);
}

export function parseApiKeys(raw: unknown): Record<Provider, string> | undefined {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return undefined;
  const obj = raw as Record<string, unknown>;
  const pick = (p: Provider) => (typeof obj[p] === 'string' ? (obj[p] as string) : '');
  return { anthropic: pick('anthropic'), google: pick('google') };
}

export function parseHistory(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.filter((item): item is string => typeof item === 'string');
}

export function parseComponents(raw: unknown): GeneratedComponent[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const result: GeneratedComponent[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const { id, prompt, code, createdAt } = item as Record<string, unknown>;
    if (typeof id !== 'string' || typeof prompt !== 'string' || typeof code !== 'string') continue;
    if (typeof createdAt !== 'string') continue;
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) continue;
    result.push({ id, prompt, code, createdAt: date });
  }
  return result;
}

export function addToHistory(history: string[], prompt: string): string[] {
  const trimmed = prompt.trim();
  if (!trimmed) return history;
  return [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, HISTORY_MAX);
}
