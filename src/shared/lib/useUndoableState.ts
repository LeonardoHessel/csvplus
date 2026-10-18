import { useCallback, useState } from "react";

interface History<T> {
  past: T[];
  present: T | null;
  future: T[];
}

type Updater<T> = T | null | ((prev: T | null) => T | null);

export function useUndoableState<T>(initialValue: T | null = null) {
  const [history, setHistory] = useState<History<T>>({
    past: [],
    present: initialValue,
    future: [],
  });

  const set = useCallback((updater: Updater<T>) => {
    setHistory((h) => {
      const nextPresent =
        typeof updater === "function" ? (updater as (prev: T | null) => T | null)(h.present) : updater;
      if (nextPresent === h.present) return h;
      return {
        past: h.present !== null ? [...h.past, h.present] : h.past,
        present: nextPresent,
        future: [],
      };
    });
  }, []);

  const reset = useCallback((value: T | null) => {
    setHistory({ past: [], present: value, future: [] });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: h.present !== null ? [h.present, ...h.future] : h.future,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      return {
        past: h.present !== null ? [...h.past, h.present] : h.past,
        present: next,
        future: h.future.slice(1),
      };
    });
  }, []);

  return {
    value: history.present,
    set,
    reset,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
