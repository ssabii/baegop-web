"use client";

import { useCallback, useSyncExternalStore } from "react";

function getStorageValue(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useRecentSearches(key = "recent-searches", limit = 10) {
  const searches = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key) ?? "[]",
    () => "[]",
  );

  const parsed: string[] = (() => {
    try {
      return JSON.parse(searches);
    } catch {
      return [];
    }
  })();

  const persist = useCallback(
    (next: string[]) => {
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new StorageEvent("storage", { key }));
    },
    [key],
  );

  const addSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      const current = getStorageValue(key);
      const filtered = current.filter((s) => s !== trimmed);
      persist([trimmed, ...filtered].slice(0, limit));
    },
    [key, limit, persist],
  );

  const removeSearch = useCallback(
    (term: string) => {
      const current = getStorageValue(key);
      persist(current.filter((s) => s !== term));
    },
    [key, persist],
  );

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return { searches: parsed, addSearch, removeSearch, clearAll };
}
