import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useUndoableState } from "../../../shared/lib/useUndoableState";
import type { CsvDocument } from "../types";

export function useCsvFile() {
  const {
    value: document,
    set: setDocument,
    reset: resetDocument,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoableState<CsvDocument>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  async function openPath(path: string) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await invoke<CsvDocument>("open_csv", { path });
      resetDocument(result);
      setIsDirty(false);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function openFile() {
    const path = await open({
      multiple: false,
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });
    if (!path || Array.isArray(path)) return;
    await openPath(path);
  }

  useEffect(() => {
    invoke<string | null>("get_startup_file").then((path) => {
      if (path) void openPath(path);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveFile() {
    if (!document) return;
    setError(null);
    try {
      await invoke("save_csv", { document, path: document.path });
      setIsDirty(false);
    } catch (err) {
      setError(String(err));
    }
  }

  async function saveFileAs() {
    if (!document) return;
    const path = await save({
      defaultPath: document.path,
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });
    if (!path) return;

    setError(null);
    try {
      await invoke("save_csv", { document, path });
      setDocument((doc) => (doc ? { ...doc, path } : doc));
      setIsDirty(false);
    } catch (err) {
      setError(String(err));
    }
  }

  function updateCell(rowIndex: number, columnIndex: number, value: string) {
    setDocument((doc) => {
      if (!doc) return doc;
      const rows = doc.rows.map((row, i) =>
        i === rowIndex ? row.map((cell, j) => (j === columnIndex ? value : cell)) : row,
      );
      return { ...doc, rows };
    });
    setIsDirty(true);
  }

  function pasteAt(startRow: number, startColumn: number, matrix: string[][]) {
    setDocument((doc) => {
      if (!doc) return doc;
      const rows = doc.rows.map((row) => [...row]);
      for (let i = 0; i < matrix.length; i++) {
        const targetRow = startRow + i;
        if (targetRow >= rows.length) break;
        for (let j = 0; j < matrix[i].length; j++) {
          const targetColumn = startColumn + j;
          if (targetColumn >= doc.headers.length) break;
          rows[targetRow][targetColumn] = matrix[i][j];
        }
      }
      return { ...doc, rows };
    });
    setIsDirty(true);
  }

  function addRow() {
    setDocument((doc) => {
      if (!doc) return doc;
      return { ...doc, rows: [...doc.rows, new Array(doc.headers.length).fill("")] };
    });
    setIsDirty(true);
  }

  function removeRow(rowIndex: number) {
    setDocument((doc) => {
      if (!doc) return doc;
      return { ...doc, rows: doc.rows.filter((_, i) => i !== rowIndex) };
    });
    setIsDirty(true);
  }

  function addColumn() {
    setDocument((doc) => {
      if (!doc) return doc;
      const name = `Coluna ${doc.headers.length + 1}`;
      return {
        ...doc,
        headers: [...doc.headers, name],
        rows: doc.rows.map((row) => [...row, ""]),
      };
    });
    setIsDirty(true);
  }

  function removeColumn(columnIndex: number) {
    setDocument((doc) => {
      if (!doc) return doc;
      return {
        ...doc,
        headers: doc.headers.filter((_, i) => i !== columnIndex),
        rows: doc.rows.map((row) => row.filter((_, i) => i !== columnIndex)),
      };
    });
    setIsDirty(true);
  }

  function renameColumn(columnIndex: number, name: string) {
    setDocument((doc) => {
      if (!doc) return doc;
      return { ...doc, headers: doc.headers.map((h, i) => (i === columnIndex ? name : h)) };
    });
    setIsDirty(true);
  }

  return {
    document,
    isLoading,
    error,
    isDirty,
    canUndo,
    canRedo,
    openFile,
    saveFile,
    saveFileAs,
    undo,
    redo,
    updateCell,
    pasteAt,
    addRow,
    removeRow,
    addColumn,
    removeColumn,
    renameColumn,
  };
}
