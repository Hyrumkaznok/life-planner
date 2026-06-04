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
  { href: "/configuracoes",icon: Settings,        label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userProfile } = useAppStore();

  const displayName = userProfile.name || "Usuário";
  const initials    = userProfile.initials || "U";

  return (
    <aside className="w-[52px] md:w-[212px] flex flex-col shrink-0 bg-[#0F172A] border-r border-white/[0.05]">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 shrink-0">
        <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center shrink-0">
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

      {/* Profile */}
      <div className="px-3 py-3 border-t border-white/[0.05]">
        <Link href="/perfil" className="flex items-center gap-2 group">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
            style={{ backgroundColor: userProfile.avatarColor }}
          >
            {initials}
          </div>
          <span className="hidden md:block text-[12px] text-slate-500 group-hover:text-slate-300 transition-colors truncate">
            {displayName}
          </span>
        </Link>
      </div>
    </aside>
  );
}
