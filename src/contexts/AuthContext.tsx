import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
  created_at: string;
  business_name?: string;
  trading_name?: string;
  business_status?: string;
  industry_sector?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  businessData?: Record<string, any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUser(data.user);
        return { ok: true };
      }
      return { ok: false, error: data.error || "Login failed" };
    } catch {
      return { ok: false, error: "Network error" };
    }
  };

  const register = async (regData: RegisterData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUser(data.user);
        return { ok: true };
      }
      return { ok: false, error: data.error || "Registration failed" };
    } catch {
      return { ok: false, error: "Network error" };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
