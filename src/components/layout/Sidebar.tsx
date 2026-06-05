"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, CheckSquare,
  Target, BarChart3, Settings, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/",             icon: LayoutDashboard, label: "Início"        },
  { href: "/calendario",   icon: Calendar,        label: "Calendário"    },
  { href: "/tarefas",      icon: CheckSquare,     label: "Tarefas"       },
  { href: "/habitos",      icon: Target,          label: "Hábitos"       },
  { href: "/estatisticas", icon: BarChart3,       label: "Estatísticas"  },
  { href: "/configuracoes",icon: Settings,        label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userProfile } = useAppStore();
  const { user, signOut } = useAuth();

  const displayName  = user?.name || userProfile.name || "Usuário";
  const displayEmail = user?.email || userProfile.email || "";
  const avatarColor  = userProfile.avatarColor || "#7C3AED";

  const initials = (() => {
    if (user?.name) {
      const parts = [user.name, user.surname].filter(Boolean);
      return parts.map(p => p![0].toUpperCase()).join('').slice(0, 2) || 'U';
    }
    return userProfile.initials || "U";
  })();

  return (
    <aside className="hidden md:flex w-[52px] md:w-[212px] flex-col shrink-0 bg-[var(--sidebar-bg)] border-r border-white/[0.03] relative overflow-hidden">

      {/* Orbs de fundo */}
      <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-violet-600/10 blur-2xl animate-orb pointer-events-none" />
      <div className="absolute bottom-20 -right-6 w-24 h-24 rounded-full bg-indigo-600/8 blur-2xl animate-orb pointer-events-none" style={{ animationDelay: "3s" }} />

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 shrink-0 relative">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(124,58,237,0.5)]">
          <span className="text-white text-[10px] font-bold">L</span>
        </div>
        <span className="hidden md:block text-[13px] font-semibold tracking-tight text-gradient">
          LifeBook
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-1.5 py-1 relative">
        {navItems.map(({ href, icon: Icon, label }, i) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-[7px] rounded-xl mb-[2px] relative group transition-all duration-200 animate-slide-in",
                isActive
                  ? "bg-gradient-to-r from-violet-600/15 to-indigo-600/10 text-[var(--sidebar-active)]"
                  : "text-[var(--sidebar-icon)] hover:bg-white/[0.04] hover:text-white/55"
              )}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Linha esquerda ativa com glow */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-gradient-to-b from-violet-400 to-indigo-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              )}

              <Icon
                size={15}
                strokeWidth={isActive ? 2.1 : 1.6}
                className={cn(
                  "shrink-0 transition-all duration-200",
                  isActive
                    ? "text-violet-400 drop-shadow-[0_0_6px_rgba(139,92,246,0.7)]"
                    : "text-[var(--sidebar-icon)] group-hover:text-white/50"
                )}
              />
              <span className="hidden md:block text-[12.5px] font-medium truncate">
                {label}
              </span>

              {/* Glow hover */}
              {!isActive && (
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-white/[0.03] to-transparent pointer-events-none" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Separador com gradiente */}
      <div className="mx-3 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Perfil + Logout */}
      <div className="px-3 py-3">
        <Link href="/perfil" className="flex items-center gap-2 group mb-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0 ring-1 ring-white/10 shadow-[0_0_8px_rgba(124,58,237,0.3)]"
            style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}aa)` }}
          >
            {initials}
          </div>
          <div className="hidden md:flex flex-col min-w-0">
            <span className="text-[12px] text-white/40 group-hover:text-white/70 truncate leading-tight transition-colors">
              {displayName}
            </span>
            {displayEmail && (
              <span className="text-[10px] text-white/20 truncate leading-tight">{displayEmail}</span>
            )}
          </div>
        </Link>

        <button
          onClick={() => signOut()}
          title="Sair"
          className="hidden md:flex items-center gap-2 w-full px-0 py-1 text-white/20 hover:text-red-400/70 transition-colors group"
        >
          <LogOut size={13} strokeWidth={1.5} className="shrink-0 ml-0.5" />
          <span className="text-[11.5px]">Sair</span>
        </button>

        <button
          onClick={() => signOut()}
          title="Sair"
          className="flex md:hidden items-center justify-center w-6 h-6 text-white/20 hover:text-red-400/70 transition-colors mt-1"
        >
          <LogOut size={13} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
