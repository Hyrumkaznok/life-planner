"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, CheckSquare,
  Target, BarChart3, Settings, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const navItems = [
  { href: "/",             icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/calendario",   icon: Calendar,        label: "Calendário"   },
  { href: "/tarefas",      icon: CheckSquare,     label: "Tarefas"      },
  { href: "/habitos",      icon: Target,          label: "Hábitos"      },
  { href: "/estatisticas", icon: BarChart3,       label: "Estatísticas" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userProfile } = useAppStore();

  const displayName = userProfile.name || "Meu Planejador";
  const displayRole = userProfile.role || "Personal OS";
  const initials    = userProfile.initials || "U";

  return (
    <aside className="w-[60px] md:w-[220px] flex flex-col shrink-0 bg-[#0F172A] dark:bg-[#09090B] border-r border-white/[0.06]">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3.5 py-5 shrink-0">
        <div className="w-8 h-8 rounded-[10px] bg-indigo-500 flex items-center justify-center shrink-0">
          <Layers className="w-4 h-4 text-white" strokeWidth={1.75} />
        </div>
        <div className="hidden md:block min-w-0">
          <p className="text-[13px] font-semibold text-white tracking-tight leading-none">Life Planner</p>
          <p className="text-[10px] text-slate-500 mt-0.5 tracking-widest uppercase">Personal OS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 group",
                isActive
                  ? "bg-indigo-500/15 text-indigo-400"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              )}
            >
              <Icon
                size={16}
                className={cn("shrink-0", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")}
                strokeWidth={isActive ? 2 : 1.75}
              />
              <span className={cn(
                "hidden md:block text-[13px] font-medium",
                isActive ? "text-indigo-300" : ""
              )}>
                {label}
              </span>
              {isActive && (
                <div className="ml-auto hidden md:block w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-0.5">
        <Link
          href="/configuracoes"
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 group",
            pathname === "/configuracoes"
              ? "bg-indigo-500/15 text-indigo-400"
              : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
          )}
        >
          <Settings
            size={16}
            className={cn("shrink-0", pathname === "/configuracoes" ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")}
            strokeWidth={1.75}
          />
          <span className="hidden md:block text-[13px] font-medium">Configurações</span>
        </Link>

        {/* Profile */}
        <Link href="/perfil" className="hidden md:flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-white/[0.05] transition-all duration-150 group mt-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
            style={{ backgroundColor: userProfile.avatarColor }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-slate-300 truncate leading-none">{displayName}</p>
            <p className="text-[10px] text-slate-600 truncate mt-0.5">{displayRole}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
