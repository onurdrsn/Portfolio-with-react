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
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
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

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<{ token: string; user: User }>(
      "/api/auth/login",
      { email, password }
    );
    if (res.token) {
      localStorage.setItem("token", res.token);
    }
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const res = await apiPost<{ token: string; user: User }>(
        "/api/auth/register",
        { username, email, password }
      );
      if (res.token) {
        localStorage.setItem("token", res.token);
      }
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiPost("/api/auth/logout", {}, { silent: true });
    } catch {}
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
