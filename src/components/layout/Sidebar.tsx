"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, CheckSquare,
  Target, BarChart3, Settings, Layers, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/",             icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/calendario",   icon: Calendar,        label: "Calendário"   },
  { href: "/tarefas",      icon: CheckSquare,     label: "Tarefas"      },
  { href: "/habitos",      icon: Target,          label: "Hábitos"      },
  { href: "/estatisticas", icon: BarChart3,       label: "Estatísticas" },
  { href: "/configuracoes",icon: Settings,        label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userProfile } = useAppStore();
  const { user, signOut } = useAuth();

  // Preferência: dados do auth. Fallback para perfil local durante transição.
  const displayName = user?.name || userProfile.name || "Usuário";
  const displayEmail = user?.email || userProfile.email || "";
  const avatarColor = userProfile.avatarColor || "#E11D48";

  const initials = (() => {
    if (user?.name) {
      const parts = [user.name, user.surname].filter(Boolean);
      return parts.map(p => p![0].toUpperCase()).join('').slice(0, 2) || 'U';
    }
    return userProfile.initials || "U";
  })();

  return (
    <aside className="hidden md:flex w-[52px] md:w-[212px] flex-col shrink-0 bg-[#0F172A] border-r border-white/[0.05]">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 shrink-0">
        <div className="w-6 h-6 rounded-md bg-zinc-600 flex items-center justify-center shrink-0">
          <Layers size={13} className="text-white" strokeWidth={1.5} />
        </div>
        <span className="hidden md:block text-[12px] font-medium text-white/70 tracking-tight">
          Life Planner
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-1.5 py-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md mb-px transition-colors duration-100",
                isActive
                  ? "bg-white/[0.07] text-white"
                  : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
              )}
            >
              <Icon
                size={15}
                strokeWidth={1.5}
                className={cn("shrink-0", isActive ? "text-white" : "text-slate-500")}
              />
              <span className="hidden md:block text-[12.5px] font-medium truncate">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Perfil + Logout */}
      <div className="px-3 py-3 border-t border-white/[0.05]">
        <Link href="/perfil" className="flex items-center gap-2 group mb-1">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
          <div className="hidden md:flex flex-col min-w-0">
            <span className="text-[12px] text-slate-400 group-hover:text-slate-200 transition-colors truncate leading-tight">
              {displayName}
            </span>
            {displayEmail && (
              <span className="text-[10px] text-slate-600 truncate leading-tight">
                {displayEmail}
              </span>
            )}
          </div>
        </Link>

        <button
          onClick={() => signOut()}
          title="Sair"
          className="hidden md:flex items-center gap-2 w-full px-0 py-1 text-slate-600 hover:text-slate-300 transition-colors group"
        >
          <LogOut size={13} strokeWidth={1.5} className="shrink-0 ml-0.5" />
          <span className="text-[11.5px]">Sair</span>
        </button>

        {/* Mobile: só o botão de logout */}
        <button
          onClick={() => signOut()}
          title="Sair"
          className="flex md:hidden items-center justify-center w-6 h-6 text-slate-600 hover:text-slate-300 transition-colors mt-1"
        >
          <LogOut size={13} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
