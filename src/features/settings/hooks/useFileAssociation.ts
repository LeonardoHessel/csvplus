import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useFileAssociation() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setAsDefault() {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await invoke<string>("set_default_csv_handler");
      setMessage(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, message, error, setAsDefault };
}
