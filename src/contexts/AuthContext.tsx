'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
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
  accountError: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ACCOUNT_ERROR = 'Unable to load account permissions. Please try again.';

function normalizeRole(value: unknown): UserRole | null {
  const role = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (role === 'USER' || role === 'ADMIN' || role === 'DISTRIBUTOR') return role;
  return null;
}

function normalizeUser(value: unknown): AuthUser {
  if (!value || typeof value !== 'object') throw new Error(ACCOUNT_ERROR);

  const candidate = value as Partial<AuthUser>;
  const role = normalizeRole(candidate.role);
  if (!candidate.id || !candidate.name || !candidate.email || !role) {
    throw new Error(ACCOUNT_ERROR);
  }

  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);
  const authOperationRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    const operation = authOperationRef.current;

    // Restore the server session once. A newer login/logout operation must
    // never be overwritten by this older request completing later.
    axios
      .get('/api/auth/session')
      .then(({ data }) => {
        if (!mounted || operation !== authOperationRef.current) return;
        const nextUser = normalizeUser(data.user);
        setToken(typeof data.token === 'string' ? data.token : null);
        setUser(nextUser);
        setAccountError(null);
      })
      .catch((error) => {
        if (!mounted || operation !== authOperationRef.current) return;
        setToken(null);
        setUser(null);
        setAccountError(axios.isAxiosError(error) && error.response?.status !== 401 ? ACCOUNT_ERROR : null);
      })
      .finally(() => {
        if (mounted && operation === authOperationRef.current) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  function persist(nextToken: unknown, nextUser: unknown): AuthUser {
    const normalizedUser = normalizeUser(nextUser);
    if (typeof nextToken !== 'string' || !nextToken) throw new Error(ACCOUNT_ERROR);

    setToken(nextToken);
    setUser(normalizedUser);
    setAccountError(null);
    setIsLoading(false);
    return normalizedUser;
  }

  async function login(email: string, password: string) {
    authOperationRef.current += 1;
    setAccountError(null);
    setIsLoading(true);

    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      return persist(data.token, data.user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }

  async function signup(name: string, email: string, password: string) {
    authOperationRef.current += 1;
    setAccountError(null);
    setIsLoading(true);

    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password });
      return persist(data.token, data.user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }

  function logout() {
    authOperationRef.current += 1;
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
    setAccountError(null);
    setIsLoading(false);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, accountError, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
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

export function roleLabel(role: UserRole): string {
  if (role === 'ADMIN') return 'Admin Dashboard';
  if (role === 'DISTRIBUTOR') return 'Distributor Dashboard';
  return 'Profile';
}
