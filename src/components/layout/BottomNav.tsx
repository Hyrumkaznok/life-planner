'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, CheckSquare, Target, BarChart3, Settings, User, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/',           icon: LayoutDashboard, label: 'Início'  },
  { href: '/calendario', icon: Calendar,        label: 'Agenda'  },
  { href: '/tarefas',    icon: CheckSquare,     label: 'Tarefas' },
  { href: '/habitos',    icon: Target,          label: 'Hábitos' },
];

const MORE_ITEMS = [
  { href: '/estatisticas', icon: BarChart3, label: 'Estatísticas'  },
  { href: '/configuracoes', icon: Settings, label: 'Configurações' },
  { href: '/perfil',       icon: User,     label: 'Meu Perfil'     },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* Overlay escuro ao abrir "Mais" */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* Painel "Mais" — desliza de baixo */}
      {showMore && (
        <div className="fixed bottom-[calc(56px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-50 md:hidden bg-[var(--card)] border border-[var(--border)] rounded-t-2xl shadow-float animate-in slide-in-from-bottom-2 duration-200">
          <div className="w-8 h-1 bg-[var(--border)] rounded-full mx-auto mt-3 mb-2" />

          {user && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
              <div className="w-9 h-9 rounded-full bg-[var(--foreground)] flex items-center justify-center text-[11px] font-bold text-[var(--background)] shrink-0">
                {[user.name[0], user.surname?.[0]].filter(Boolean).join('').toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--foreground)] truncate">
                  {user.name}{user.surname ? ` ${user.surname}` : ''}
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)] truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="py-1">
            {MORE_ITEMS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setShowMore(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 hover:bg-[var(--secondary)] transition-colors',
                  pathname === href && 'bg-[var(--secondary)]'
                )}
              >
                <Icon size={18} className={cn('shrink-0', pathname === href ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]')} strokeWidth={1.75} />
                <span className={cn('text-[13.5px] font-medium flex-1', pathname === href ? 'text-[var(--foreground)]' : 'text-[var(--foreground)]')}>{label}</span>
                <ChevronRight size={14} className="text-[var(--muted-foreground)]" />
              </Link>
            ))}
          </div>

          <div className="border-t border-[var(--border)] px-4 pb-3 pt-1">
            <button
              onClick={() => { signOut(); setShowMore(false); }}
              className="w-full flex items-center gap-3 px-2 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut size={18} className="shrink-0" />
              <span className="text-[13.5px] font-medium">Sair da conta</span>
            </button>
          </div>
        </div>
      )}

      {/* Barra de navegação inferior */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--card)] border-t border-[var(--border)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch h-14">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} className="flex-1 relative">
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[var(--foreground)] rounded-full" />
                )}
                <div className={cn(
                  'flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
                  isActive ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'
                )}>
                  <Icon size={21} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-[10px] font-medium">{label}</span>
                </div>
              </Link>
            );
          })}

          {/* Botão "Mais" */}
          <button onClick={() => setShowMore(!showMore)} className="flex-1 relative">
            {showMore && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[var(--foreground)] rounded-full" />
            )}
            <div className={cn(
              'flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
              showMore ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'
            )}>
              {/* Ícone de 3 linhas */}
              <div className="flex flex-col gap-[3.5px] w-5">
                <div className="h-[2px] rounded-full bg-current" />
                <div className="h-[2px] rounded-full bg-current w-3.5" />
                <div className="h-[2px] rounded-full bg-current" />
              </div>
              <span className="text-[10px] font-medium">Mais</span>
            </div>
          </button>
        </div>
      </nav>
    </>
  );
}
