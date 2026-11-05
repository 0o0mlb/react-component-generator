import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

/** useState와 같지만 값을 localStorage에 동기화한다. 저장된 값은 parse로 검증해 복원한다. */
export function usePersistentState<T>(
  key: string,
  initial: T,
  parse: (raw: unknown) => T | undefined,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStorage(key, initial, parse));

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
