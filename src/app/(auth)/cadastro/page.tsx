'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Spinner, GoogleIcon } from '../login/page';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function CadastroPage() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { signUp, signInWithGoogle } = useAuth();

  const passwordOk = password.length >= 8;
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) { setError('E-mail inválido'); return; }
    if (!passwordOk) { setError('A senha deve ter pelo menos 8 caracteres'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem'); return; }

    setLoading(true);
    const err = await signUp(email, password, name.trim(), surname.trim() || undefined);
    if (err) { setError(err); setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const err = await signInWithGoogle();
    if (err) { setError(err); setGoogleLoading(false); }
  };

  return (
    <div className="w-full max-w-[400px] auth-card p-8">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--foreground)] tracking-tight">
          Criar conta
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Comece a organizar sua vida hoje
        </p>
      </div>

      <button
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="auth-social-btn w-full mb-5"
      >
        {googleLoading ? <Spinner /> : <GoogleIcon />}
        Continuar com Google
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-[var(--muted-foreground)]">ou crie com e-mail</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="auth-label">Nome</label>
            <input
              type="text" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="João" required autoFocus
              className="auth-input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="auth-label">Sobrenome</label>
            <input
              type="text" value={surname}
              onChange={e => setSurname(e.target.value)}
              placeholder="Silva"
              className="auth-input"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="auth-label">E-mail</label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="voce@email.com" required
            className="auth-input"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="auth-label">Senha</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres" required
              className="auth-input pr-10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className={`flex items-center gap-1.5 text-xs ${passwordOk ? 'text-green-600 dark:text-green-400' : 'text-[var(--muted-foreground)]'}`}>
              {passwordOk
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                : <AlertCircle className="w-3.5 h-3.5" />}
              Pelo menos 8 caracteres
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="auth-label">Confirmar senha</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha" required
              className="auth-input pr-10"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && (
            <div className={`flex items-center gap-1.5 text-xs ${passwordsMatch ? 'text-green-600 dark:text-green-400' : passwordsMismatch ? 'text-red-600 dark:text-red-400' : ''}`}>
              {passwordsMatch
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                : <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
              {passwordsMatch ? 'Senhas coincidem' : 'Senhas não coincidem'}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || googleLoading} className="mt-1 auth-submit-btn">
          {loading ? <Spinner light /> : 'Criar conta'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--muted-foreground)]">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-[var(--foreground)] font-medium hover:underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </div>
  );
}
