import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "../lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  sendPasscode: (email: string, username?: string) => Promise<{ success: boolean; message: string; devCode?: string }>;
  loginWithPasscode: (email: string, code: string) => Promise<void>;
  login: (email: string, passwordOrCode: string) => Promise<void>;
  register: (username: string, email: string, passwordOrCode?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session automatically via HttpOnly Cookie / Token
  useEffect(() => {
    apiGet<User>("/api/auth/me", { silent: true })
      .then((u) => setUser(u))
      .catch(() => {
        setUser(null);
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  const sendPasscode = useCallback(async (email: string, username?: string) => {
    const res = await apiPost<{ success: boolean; message: string; devCode?: string }>(
      "/api/auth/send-passcode",
      { email, username }
    );
    return res;
  }, []);

  const loginWithPasscode = useCallback(async (email: string, code: string) => {
    const res = await apiPost<{ token: string; user: User }>(
      "/api/auth/login-passcode",
      { email, code }
    );
    if (res.token) {
      localStorage.setItem("token", res.token);
    }
    setUser(res.user);
  }, []);

  const login = useCallback(async (email: string, passwordOrCode: string) => {
    return loginWithPasscode(email, passwordOrCode);
  }, [loginWithPasscode]);

  const register = useCallback(
    async (username: string, email: string, passwordOrCode?: string) => {
      if (passwordOrCode) {
        return loginWithPasscode(email, passwordOrCode);
      }
      await sendPasscode(email, username);
    },
    [loginWithPasscode, sendPasscode]
  );

  const logout = useCallback(async () => {
    try {
      await apiPost("/api/auth/logout", {}, { silent: true });
    } catch {}
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, sendPasscode, loginWithPasscode, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
