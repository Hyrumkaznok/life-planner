'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser, AuthSession } from './auth-types';
import { authService } from './auth-service';

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, name: string, surname?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<string | null>;
  signInWithGitHub: () => Promise<string | null>;
  sendPasswordReset: (email: string) => Promise<string | null>;
  resetPassword: (token: string, password: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    authService.getSession().then(s => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authService.signIn({ email, password });
    if (result.session) {
      setSession(result.session);
      router.push('/');
    }
    return result.error;
  }, [router]);

  const signUp = useCallback(async (email: string, password: string, name: string, surname?: string) => {
    const result = await authService.signUp({ email, password, name, surname });
    if (result.session) {
      setSession(result.session);
      router.push('/');
    }
    return result.error;
  }, [router]);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setSession(null);
    router.push('/login');
  }, [router]);

  const signInWithGoogle = useCallback(async () => {
    const result = await authService.signInWithGoogle();
    if (result.session) {
      setSession(result.session);
      router.push('/');
    }
    return result.error;
  }, [router]);

  const signInWithGitHub = useCallback(async () => {
    const result = await authService.signInWithGitHub();
    if (result.session) {
      setSession(result.session);
      router.push('/');
    }
    return result.error;
  }, [router]);

  const sendPasswordReset = useCallback(async (email: string) => {
    const result = await authService.sendPasswordReset(email);
    return result.error;
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    const result = await authService.resetPassword(token, password);
    return result.error;
  }, []);

  return (
    <AuthContext.Provider value={{
      user: session?.user ?? null,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      signInWithGitHub,
      sendPasswordReset,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
