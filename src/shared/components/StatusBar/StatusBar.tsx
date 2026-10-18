import "./StatusBar.css";

interface StatusBarProps {
  rowCount?: number;
  columnCount?: number;
  delimiter?: string;
  encoding?: string;
}

export function StatusBar({ rowCount, columnCount, delimiter, encoding }: StatusBarProps) {
  const hasFile = rowCount !== undefined;

  return (
    <footer className="status-bar">
      {hasFile ? (
        <span>
          {rowCount} linhas · {columnCount} colunas
          {delimiter ? ` · delimitador "${delimiter}"` : ""}
          {encoding ? ` · ${encoding}` : ""}
        </span>
      ) : (
        <span>Nenhum arquivo aberto</span>
      )}
    </footer>
  );
}
