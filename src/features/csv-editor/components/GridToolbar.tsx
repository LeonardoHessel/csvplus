import { Button } from "../../../shared/components/Button/Button";
import "./GridToolbar.css";

interface GridToolbarProps {
  onAddRow: () => void;
  onAddColumn: () => void;
}

export function GridToolbar({ onAddRow, onAddColumn }: GridToolbarProps) {
  return (
    <div className="grid-toolbar">
      <Button onClick={onAddRow}>+ Linha</Button>
      <Button onClick={onAddColumn}>+ Coluna</Button>
    </div>
  );
}
