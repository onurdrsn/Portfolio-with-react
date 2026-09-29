import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiGet, apiPut } from "../lib/api";

export type UiVersion = "v1" | "v2" | "v3" | "v4";

interface UiVersionContextType {
  uiVersion: UiVersion;
  loading: boolean;
  setUiVersion: (version: UiVersion) => Promise<void>;
  refetchSettings: () => Promise<void>;
}

const UI_STORAGE_KEY = "portfolio_ui_version";

function getInitialUiVersion(): UiVersion {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(UI_STORAGE_KEY);
      if (stored && ["v1", "v2", "v3", "v4"].includes(stored)) {
        return stored as UiVersion;
      }
    } catch {}
  }
  return "v1";
}

const UiVersionContext = createContext<UiVersionContextType | null>(null);

export function UiVersionProvider({ children }: { children: React.ReactNode }) {
  // Synchronous initialization prevents any flashing of default v1 when reloading
  const [uiVersion, setUiVersionState] = useState<UiVersion>(getInitialUiVersion);
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiGet<{ uiVersion?: string }>("/api/settings", { silent: true });
      if (res && res.uiVersion && ["v1", "v2", "v3", "v4"].includes(res.uiVersion)) {
        const serverVersion = res.uiVersion as UiVersion;
        setUiVersionState(serverVersion);
        try {
          localStorage.setItem(UI_STORAGE_KEY, serverVersion);
        } catch {}
      }
    } catch {
      // Retain stored version on network error
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
    // Immediately persist to localStorage synchronously so any refresh instantly picks it up
    try {
      localStorage.setItem(UI_STORAGE_KEY, newVersion);
    } catch {}
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
