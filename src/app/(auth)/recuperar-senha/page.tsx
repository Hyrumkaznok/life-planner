'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Spinner } from '../login/page';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { sendPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await sendPasswordReset(email);
    setLoading(false);
    if (err) setError(err);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="w-full max-w-[380px] auth-card p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--secondary)] flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-[var(--foreground)]" />
        </div>
        <h2 className="text-[18px] font-semibold text-[var(--foreground)] tracking-tight mb-2">
          Verifique seu e-mail
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-1">
          Enviamos um link de recuperação para
        </p>
        <p className="text-sm font-medium text-[var(--foreground)] mb-5">{email}</p>
        <p className="text-xs text-[var(--muted-foreground)] mb-6 leading-relaxed">
          Não recebeu? Verifique a pasta de spam ou{' '}
          <button
            onClick={() => setSent(false)}
            className="text-[var(--foreground)] underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            tente novamente
          </button>
        </p>
        <Link
          href="/login"
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[380px] auth-card p-8">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--foreground)] tracking-tight">
          Recuperar senha
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1 leading-relaxed">
          Informe seu e-mail e enviaremos um link para redefinir sua senha
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="auth-label">E-mail</label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="voce@email.com"
            required autoFocus
            className="auth-input"
          />
        </div>

        <button type="submit" disabled={loading} className="auth-submit-btn">
          {loading ? <Spinner light /> : 'Enviar link de recuperação'}
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
