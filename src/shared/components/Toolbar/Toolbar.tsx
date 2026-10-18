import type { ReactNode } from "react";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { WindowControls } from "./WindowControls";
import "./Toolbar.css";

interface ToolbarProps {
  fileName?: string;
  isDirty?: boolean;
  children?: ReactNode;
}

export function Toolbar({ fileName, isDirty, children }: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar__title">
        {fileName ? (
          <span>
            {fileName}
            {isDirty ? " •" : ""}
          </span>
        ) : (
          <span className="toolbar__title--empty">CSVPlus</span>
        )}
      </div>
      <div className="toolbar__actions">
        {children}
        <ThemeToggle />
      </div>
      <WindowControls />
    </header>
  );
}
