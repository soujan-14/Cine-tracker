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
    try {
      const storedToken = localStorage.getItem('ct_token');
      const storedUser = localStorage.getItem('ct_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as AuthUser);
      }
    } catch {
      localStorage.removeItem('ct_token');
      localStorage.removeItem('ct_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  function persist(nextToken: string, nextUser: AuthUser) {
    localStorage.setItem('ct_token', nextToken);
    localStorage.setItem('ct_user', JSON.stringify(nextUser));
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
    localStorage.removeItem('ct_token');
    localStorage.removeItem('ct_user');
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
