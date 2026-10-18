import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import type { CsvDocument } from "../types";
import "./Grid.css";

const ROW_HEIGHT = 32;

interface EditingCell {
  rowIndex: number;
  columnIndex: number;
}

interface Selection {
  anchorRow: number;
  anchorColumn: number;
  focusRow: number;
  focusColumn: number;
}

interface GridProps {
  document: CsvDocument;
  onUpdateCell: (rowIndex: number, columnIndex: number, value: string) => void;
  onPaste: (rowIndex: number, columnIndex: number, matrix: string[][]) => void;
  onRemoveRow: (rowIndex: number) => void;
  onRemoveColumn: (columnIndex: number) => void;
  onRenameColumn: (columnIndex: number, name: string) => void;
  onUndo: () => void;
  onRedo: () => void;
}

function normalizeSelection(selection: Selection) {
  return {
    rowStart: Math.min(selection.anchorRow, selection.focusRow),
    rowEnd: Math.max(selection.anchorRow, selection.focusRow),
    columnStart: Math.min(selection.anchorColumn, selection.focusColumn),
    columnEnd: Math.max(selection.anchorColumn, selection.focusColumn),
  };
}

export function Grid({
  document,
  onUpdateCell,
  onPaste,
  onRemoveRow,
  onRemoveColumn,
  onRenameColumn,
  onUndo,
  onRedo,
}: GridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editingHeader, setEditingHeader] = useState<number | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);

  const virtualizer = useVirtualizer({
    count: document.rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  function commitCell(rowIndex: number, columnIndex: number, value: string) {
    onUpdateCell(rowIndex, columnIndex, value);
    setEditingCell(null);
  }

  function commitHeader(columnIndex: number, value: string) {
    onRenameColumn(columnIndex, value);
    setEditingHeader(null);
  }

  function handleCellKeyDown(e: KeyboardEvent<HTMLInputElement>, rowIndex: number, columnIndex: number) {
    if (e.key === "Enter") commitCell(rowIndex, columnIndex, e.currentTarget.value);
    else if (e.key === "Escape") setEditingCell(null);
  }

  function handleHeaderKeyDown(e: KeyboardEvent<HTMLInputElement>, columnIndex: number) {
    if (e.key === "Enter") commitHeader(columnIndex, e.currentTarget.value);
    else if (e.key === "Escape") setEditingHeader(null);
  }

  function handleCellMouseDown(e: MouseEvent, rowIndex: number, columnIndex: number) {
    if (editingCell) return;
    parentRef.current?.focus();
    setSelection((prev) =>
      e.shiftKey && prev
        ? { ...prev, focusRow: rowIndex, focusColumn: columnIndex }
        : { anchorRow: rowIndex, anchorColumn: columnIndex, focusRow: rowIndex, focusColumn: columnIndex },
    );
  }

  function isCellSelected(rowIndex: number, columnIndex: number) {
    if (!selection) return false;
    const { rowStart, rowEnd, columnStart, columnEnd } = normalizeSelection(selection);
    return rowIndex >= rowStart && rowIndex <= rowEnd && columnIndex >= columnStart && columnIndex <= columnEnd;
  }

  async function copySelection() {
    if (!selection) return;
    const { rowStart, rowEnd, columnStart, columnEnd } = normalizeSelection(selection);
    const lines: string[] = [];
    for (let r = rowStart; r <= rowEnd; r++) {
      const cells: string[] = [];
      for (let c = columnStart; c <= columnEnd; c++) {
        cells.push(document.rows[r]?.[c] ?? "");
      }
      lines.push(cells.join("\t"));
    }
    await writeText(lines.join("\n"));
  }

  async function pasteSelection() {
    if (!selection) return;
    const text = await readText();
    if (!text) return;
    const { rowStart, columnStart } = normalizeSelection(selection);
    const matrix = text.replace(/\r/g, "").split("\n").map((line) => line.split("\t"));
    onPaste(rowStart, columnStart, matrix);
  }

  function handleGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (editingCell || editingHeader !== null) return;
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (!mod) return;

    const key = e.key.toLowerCase();
    if (key === "z") {
      e.preventDefault();
      if (e.shiftKey) onRedo();
      else onUndo();
    } else if (key === "y") {
      e.preventDefault();
      onRedo();
    } else if (key === "c") {
      e.preventDefault();
      void copySelection();
    } else if (key === "v") {
      e.preventDefault();
      void pasteSelection();
    }
  }

  return (
    <div className="grid" ref={parentRef} role="table" tabIndex={0} onKeyDown={handleGridKeyDown}>
      <div className="grid__header" role="rowgroup">
        <div className="grid__row grid__row--header" role="row">
          <div className="grid__cell grid__cell--gutter grid__cell--header" role="columnheader" />
          {document.headers.map((header, columnIndex) => (
            <div className="grid__cell grid__cell--header" role="columnheader" key={columnIndex}>
              {editingHeader === columnIndex ? (
                <input
                  autoFocus
                  className="grid__input"
                  defaultValue={header}
                  onBlur={(e) => commitHeader(columnIndex, e.currentTarget.value)}
                  onKeyDown={(e) => handleHeaderKeyDown(e, columnIndex)}
                />
              ) : (
                <>
                  <span
                    className="grid__header-label"
                    onDoubleClick={() => setEditingHeader(columnIndex)}
                  >
                    {header || `Coluna ${columnIndex + 1}`}
                  </span>
                  <button
                    type="button"
                    className="grid__remove-column"
                    title="Remover coluna"
                    onClick={() => onRemoveColumn(columnIndex)}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="grid__body" role="rowgroup" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowIndex = virtualRow.index;
          const row = document.rows[rowIndex];
          return (
            <div
              key={rowIndex}
              role="row"
              className="grid__row"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <div className="grid__cell grid__cell--gutter" role="cell">
                <button
                  type="button"
                  className="grid__remove-row"
                  title="Remover linha"
                  onClick={() => onRemoveRow(rowIndex)}
                >
                  ×
                </button>
                <span className="grid__row-number">{rowIndex + 1}</span>
              </div>
              {document.headers.map((_, columnIndex) => {
                const isEditing =
                  editingCell?.rowIndex === rowIndex && editingCell?.columnIndex === columnIndex;
                const value = row[columnIndex] ?? "";
                return (
                  <div
                    role="cell"
                    className={`grid__cell ${isCellSelected(rowIndex, columnIndex) ? "grid__cell--selected" : ""}`}
                    key={columnIndex}
                    onMouseDown={(e) => handleCellMouseDown(e, rowIndex, columnIndex)}
                    onDoubleClick={() => setEditingCell({ rowIndex, columnIndex })}
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        className="grid__input"
                        defaultValue={value}
                        onBlur={(e) => commitCell(rowIndex, columnIndex, e.currentTarget.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, rowIndex, columnIndex)}
                      />
                    ) : (
                      value
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
