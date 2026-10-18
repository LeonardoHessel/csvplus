import { getCurrentWindow } from "@tauri-apps/api/window";
import "./WindowControls.css";

const appWindow = getCurrentWindow();

export function WindowControls() {
  return (
    <div className="window-controls">
      <button
        type="button"
        className="window-controls__button"
        title="Minimizar"
        onClick={() => void appWindow.minimize()}
      >
        &#8211;
      </button>
      <button
        type="button"
        className="window-controls__button"
        title="Maximizar/Restaurar"
        onClick={() => void appWindow.toggleMaximize()}
      >
        &#9633;
      </button>
      <button
        type="button"
        className="window-controls__button window-controls__button--close"
        title="Fechar"
        onClick={() => void appWindow.close()}
      >
        &#10005;
      </button>
    </div>
  );
}
