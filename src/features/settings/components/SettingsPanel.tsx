import { Button } from "../../../shared/components/Button/Button";
import { useFileAssociation } from "../hooks/useFileAssociation";
import "./SettingsPanel.css";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { isLoading, message, error, setAsDefault } = useFileAssociation();

  if (!open) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-panel__header">
          <h2>Configurações</h2>
          <button type="button" className="settings-panel__close" onClick={onClose}>
            ×
          </button>
        </div>
        <section className="settings-panel__section">
          <h3>Associação de arquivo</h3>
          <p>Defina o CSVPlus como aplicativo padrão para abrir arquivos .csv.</p>
          <Button variant="primary" onClick={() => void setAsDefault()} disabled={isLoading}>
            {isLoading ? "Configurando…" : "Definir como padrão para .csv"}
          </Button>
          {message ? <p className="settings-panel__message">{message}</p> : null}
          {error ? <p className="settings-panel__error">{error}</p> : null}
        </section>
      </div>
    </div>
  );
}
