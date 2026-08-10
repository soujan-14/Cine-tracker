'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Resolves to true when Supabase requires the user to confirm their email. */
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(user: SupabaseUser | undefined | null): AuthUser | null {
  if (!user?.email) return null;
  const name = (user.user_metadata?.name as string | undefined)?.trim();
  return { id: user.id, email: user.email, name: name || user.email.split('@')[0] };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    function applySession(session: Session | null) {
      setToken(session?.access_token ?? null);
      setUser(toAuthUser(session?.user));
    }

    supabase.auth
      .getSession()
      .then(({ data }) => applySession(data.session))
      .finally(() => setIsLoading(false));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
  }

  async function signup(name: string, email: string, password: string) {
    const { data, error } = await getSupabaseBrowserClient().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) throw error;
    return !data.session;
  }

  async function logout() {
    const { error } = await getSupabaseBrowserClient().auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
