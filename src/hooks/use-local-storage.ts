"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * A typed hook for reading and writing a value in localStorage.
 *
 * - On the server (SSR) it returns `defaultValue` and never touches storage.
 * - On mount it reads the stored JSON (if any) and hydrates state.
 * - Every time `setValue` is called the new value is written to storage.
 *
 * @param key         localStorage key
 * @param defaultValue  value to use when nothing is stored (or parsing fails)
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Lazy initialiser -- only runs on the client after mount.
  const [storedValue, setStoredValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        setStoredValue(JSON.parse(raw) as T);
      }
    } catch {
      // ignore parse / access errors
    }
    setHydrated(true);
  }, [key]);

  // Persist whenever the value changes (skip the initial default)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // ignore quota / access errors
    }
  }, [key, storedValue, hydrated]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        return next;
      });
    },
    [],
  );

  return [storedValue, setValue];
}
