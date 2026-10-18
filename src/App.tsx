import { useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask } from "@tauri-apps/plugin-dialog";
import { ThemeProvider } from "./shared/theme/ThemeProvider";
import { Toolbar } from "./shared/components/Toolbar/Toolbar";
import { StatusBar } from "./shared/components/StatusBar/StatusBar";
import { Button } from "./shared/components/Button/Button";
import { EmptyState } from "./features/csv-editor/components/EmptyState";
import { Grid } from "./features/csv-editor/components/Grid";
import { GridToolbar } from "./features/csv-editor/components/GridToolbar";
import { useCsvFile } from "./features/csv-editor/hooks/useCsvFile";
import { SettingsPanel } from "./features/settings/components/SettingsPanel";
import "./App.css";

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    document,
    isLoading,
    error,
    isDirty,
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
  } = useCsvFile();

  const isDirtyRef = useRef(isDirty);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod || e.key.toLowerCase() !== "s") return;
      e.preventDefault();
      if (e.shiftKey) void saveFileAs();
      else void saveFile();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveFile, saveFileAs]);

  useEffect(() => {
    const appWindow = getCurrentWindow();
    let unlisten: (() => void) | undefined;

    appWindow
      .onCloseRequested(async (event) => {
        if (!isDirtyRef.current) return;
        event.preventDefault();
        const shouldClose = await ask("Existem alterações não salvas. Sair sem salvar?", {
          title: "Alterações não salvas",
          kind: "warning",
        });
        if (shouldClose) {
          await appWindow.destroy();
        }
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => unlisten?.();
  }, []);

  return (
    <ThemeProvider>
      <div className="app-shell">
        <Toolbar fileName={document?.path.split(/[\\/]/).pop()} isDirty={isDirty}>
          {document ? (
            <>
              <Button onClick={() => void saveFile()} disabled={!isDirty}>
                Salvar
              </Button>
              <Button onClick={() => void saveFileAs()}>Salvar como</Button>
            </>
          ) : null}
          <Button title="Configurações" onClick={() => setIsSettingsOpen(true)}>
            ⚙
          </Button>
        </Toolbar>
        <SettingsPanel open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        {document ? (
          <>
            <GridToolbar onAddRow={addRow} onAddColumn={addColumn} />
            <Grid
              document={document}
              onUpdateCell={updateCell}
              onPaste={pasteAt}
              onRemoveRow={removeRow}
              onRemoveColumn={removeColumn}
              onRenameColumn={renameColumn}
              onUndo={undo}
              onRedo={redo}
            />
          </>
        ) : (
          <EmptyState onOpenFile={openFile} />
        )}
        {error ? <div className="app-error">{error}</div> : null}
        <StatusBar
          rowCount={document?.rows.length}
          columnCount={document?.headers.length}
          delimiter={document?.delimiter}
          encoding={document?.encoding}
        />
        {isLoading ? <div className="app-loading">Abrindo arquivo…</div> : null}
      </div>
    </ThemeProvider>
  );
}

export default App;
