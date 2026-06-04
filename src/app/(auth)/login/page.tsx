'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { signIn, signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await signIn(email, password, redirectTo);
    if (err) { setError(err); setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const err = await signInWithGoogle(redirectTo);
    if (err) { setError(err); setGoogleLoading(false); }
  };

  return (
    <div className="w-full max-w-[380px] auth-card p-8">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--foreground)] tracking-tight">
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Entre com sua conta para continuar
        </p>
      </div>

      {/* Botões sociais */}
      <div className="flex flex-col gap-2.5 mb-5">
        <button
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="auth-social-btn"
        >
          {googleLoading ? <Spinner /> : <GoogleIcon />}
          Continuar com Google
        </button>

        <button
          disabled
          title="Em breve"
          className="auth-social-btn opacity-45 cursor-not-allowed"
        >
          <GitHubIcon />
          Continuar com GitHub
          <span className="ml-auto text-[11px] bg-[var(--secondary)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full font-medium">
            Em breve
          </span>
        </button>
      </div>

      {/* Divisor */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-[var(--muted-foreground)]">ou</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {error && <AuthError message={error} />}

        <div className="flex flex-col gap-1.5">
          <label className="auth-label">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="voce@email.com"
            required
            autoFocus
            className="auth-input"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="auth-label">Senha</label>
            <Link
              href="/recuperar-senha"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="auth-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="mt-1 auth-submit-btn"
        >
          {loading ? <Spinner light /> : 'Entrar'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--muted-foreground)]">
        Não tem uma conta?{' '}
        <Link href="/cadastro" className="text-[var(--foreground)] font-medium hover:underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={<div className="w-full max-w-[380px] auth-card p-8 h-[420px]" />}>
        <LoginForm />
      </Suspense>
      <p className="mt-8 text-xs text-[var(--muted-foreground)] text-center max-w-[320px]">
        Ao continuar, você concorda com os{' '}
        <span className="underline underline-offset-4 cursor-pointer hover:text-[var(--foreground)] transition-colors">
          Termos de Uso
        </span>{' '}
        e a{' '}
        <span className="underline underline-offset-4 cursor-pointer hover:text-[var(--foreground)] transition-colors">
          Política de Privacidade
        </span>
      </p>
    </>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function AuthError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm">
      <AlertCircle className="w-4 h-4 shrink-0" />
      {message}
    </div>
  );
}

export function Spinner({ light }: { light?: boolean }) {
  return (
    <svg
      className={`w-4 h-4 animate-spin ${light ? 'text-[var(--background)]' : 'text-[var(--muted-foreground)]'}`}
      fill="none" viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}
