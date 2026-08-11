'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

export type UserRole = 'USER' | 'ADMIN' | 'DISTRIBUTOR';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Authentication is restored from the secure httpOnly session cookie.
    // No client-side storage is used as an authorization source.
    axios
      .get('/api/auth/session')
      .then(({ data }) => {
        if (!mounted) return;
        setToken(data.token as string);
        setUser(data.user as AuthUser);
      })
      .catch(() => {
        if (!mounted) return;
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  function persist(nextToken: string, nextUser: AuthUser) {
    // Keep the token only in memory for existing client API calls. The
    // authoritative session is the secure httpOnly cookie on the server.
    setToken(nextToken);
    setUser(nextUser);
  }

  async function login(email: string, password: string) {
    const { data } = await axios.post('/api/auth/login', { email, password });
    persist(data.token, data.user);
    return data.user as AuthUser;
  }

  async function signup(name: string, email: string, password: string) {
    const { data } = await axios.post('/api/auth/register', { name, email, password });
    persist(data.token, data.user);
    return data.user as AuthUser;
  }

  function logout() {
    void axios.post('/api/auth/logout').catch(() => undefined);
    // Remove legacy client-side auth artifacts left by older builds.
    try {
      localStorage.removeItem('ct_token');
      localStorage.removeItem('ct_user');
    } catch {
      // Ignore storage restrictions; the server cookie remains authoritative.
    }
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function roleHome(role: UserRole): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'DISTRIBUTOR') return '/distributor';
  return '/';
}
