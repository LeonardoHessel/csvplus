import "./EmptyState.css";

interface EmptyStateProps {
  onOpenFile: () => void;
}

export function EmptyState({ onOpenFile }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        ⊞
      </div>
      <p className="empty-state__text">Abra um arquivo CSV para começar</p>
      <button type="button" className="empty-state__button" onClick={onOpenFile}>
        Abrir arquivo
      </button>
    </div>
  );
}
