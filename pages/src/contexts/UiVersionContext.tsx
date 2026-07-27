import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiGet, apiPut } from "../lib/api";

export type UiVersion = "v1" | "v2" | "v3";

interface UiVersionContextType {
  uiVersion: UiVersion;
  loading: boolean;
  setUiVersion: (version: UiVersion) => Promise<void>;
  refetchSettings: () => Promise<void>;
}

const UiVersionContext = createContext<UiVersionContextType | null>(null);

export function UiVersionProvider({ children }: { children: React.ReactNode }) {
  const [uiVersion, setUiVersionState] = useState<UiVersion>("v1");
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiGet<{ uiVersion?: string }>("/api/settings", { silent: true });
      if (res && res.uiVersion && ["v1", "v2", "v3"].includes(res.uiVersion)) {
        setUiVersionState(res.uiVersion as UiVersion);
      }
    } catch {
      // Fallback to v1 on network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    // Poll every 12 seconds to keep all open client tabs synced live
    const interval = setInterval(fetchSettings, 12000);
    return () => clearInterval(interval);
  }, [fetchSettings]);

  const setUiVersion = async (newVersion: UiVersion) => {
    setUiVersionState(newVersion);
    try {
      await apiPut("/api/settings", { uiVersion: newVersion });
    } catch (err) {
      // Revert if API call fails
      fetchSettings();
      throw err;
    }
  };

  return (
    <UiVersionContext.Provider value={{ uiVersion, loading, setUiVersion, refetchSettings: fetchSettings }}>
      {children}
    </UiVersionContext.Provider>
  );
}

export function useUiVersion() {
  const ctx = useContext(UiVersionContext);
  if (!ctx) throw new Error("useUiVersion must be used within UiVersionProvider");
  return ctx;
}
