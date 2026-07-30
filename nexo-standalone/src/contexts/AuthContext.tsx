import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin" | "franchise";
  business_name?: string;
  industry_sector?: string;
  business_type?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isImpersonating: boolean;
  originalAdminName: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; isAdmin?: boolean; isFranchise?: boolean }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  businessData?: Record<string, any>;
  franchiseCode?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalAdminName, setOriginalAdminName] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setUser(data.user || null);
      setIsImpersonating(!!data.isImpersonating);
      setOriginalAdminName(data.originalAdminName || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

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
        refreshUser();
        return { ok: true, isAdmin: data.user.role === "admin", isFranchise: data.user.role === "franchise" };
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
        body: JSON.stringify({
          email: regData.email,
          password: regData.password,
          fullName: regData.fullName,
          businessData: regData.businessData,
          franchiseCode: regData.franchiseCode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) return { ok: true };
      return { ok: false, error: data.error || "Registration failed" };
    } catch {
      return { ok: false, error: "Network error" };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setIsImpersonating(false);
    setOriginalAdminName(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isImpersonating, originalAdminName, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
