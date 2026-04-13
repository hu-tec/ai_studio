import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type UserTier = 'admin' | 'manager' | 'user' | 'external';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  tier: UserTier;
  status?: string;
  last_login_at?: string | null;
  created_at?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasTier: (tier: UserTier) => boolean;
  hasAnyTier: (...tiers: UserTier[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(err?.error ?? '로그인에 실패했습니다');
    }
    const data = (await res.json()) as AuthUser;
    setUser(data);
    return data;
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
    }
  }

  function hasTier(tier: UserTier) {
    return user?.tier === tier;
  }

  function hasAnyTier(...tiers: UserTier[]) {
    return !!user && tiers.includes(user.tier);
  }

  const value: AuthContextValue = { user, loading, login, logout, refresh, hasTier, hasAnyTier };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
