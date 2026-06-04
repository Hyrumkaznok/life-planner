'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Spinner } from '../login/page';

function RedefinirForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) router.replace('/recuperar-senha');
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('A senha deve ter pelo menos 8 caracteres'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem'); return; }
    setLoading(true);
    setError(null);
    const err = await resetPassword(token, password);
    setLoading(false);
    if (err) setError(err);
    else {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[380px] auth-card p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        </div>
        <h2 className="text-[18px] font-semibold text-[var(--foreground)] tracking-tight mb-2">
          Senha redefinida!
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Sua senha foi alterada com sucesso. Redirecionando para o login…
        </p>
        <Link
          href="/login"
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[380px] auth-card p-8">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--foreground)] tracking-tight">
          Redefinir senha
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Escolha uma nova senha para sua conta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="auth-label">Nova senha</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required autoFocus
              className="auth-input pr-10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="auth-label">Confirmar nova senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repita a nova senha"
            required
            className="auth-input"
          />
          {confirmPassword && password !== confirmPassword && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              Senhas não coincidem
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="mt-1 auth-submit-btn">
          {loading ? <Spinner light /> : 'Redefinir senha'}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[380px] auth-card p-8 h-[360px]" />}>
      <RedefinirForm />
    </Suspense>
  );
}
