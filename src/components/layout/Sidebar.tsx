"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, CheckSquare, Target, BarChart3, Settings, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/calendario", icon: Calendar, label: "Calendário" },
  { href: "/tarefas", icon: CheckSquare, label: "Tarefas" },
  { href: "/habitos", icon: Target, label: "Hábitos" },
  { href: "/estatisticas", icon: BarChart3, label: "Estatísticas" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userProfile } = useAppStore();

  const displayName = userProfile.name || "Meu Planejador";
  const displayRole = userProfile.role || "Plano pessoal";
  const initials = userProfile.initials || "U";

  return (
    <aside className="w-16 md:w-64 flex flex-col shrink-0 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 shrink-0">
        <div className="relative w-9 h-9 shrink-0">
          {/* Glow layer */}
          <div className="absolute inset-0 rounded-xl bg-rose-500/30 blur-sm" />
          {/* Icon bg */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center shadow-md">
            <Layers className="w-4 h-4 text-rose-400" strokeWidth={1.75} />
          </div>
        </div>
        <div className="hidden md:block">
          <span className="font-semibold text-white text-sm tracking-wide">Life Planner</span>
          <p className="text-[10px] text-slate-600 tracking-widest uppercase mt-0.5">Personal OS</p>
        </div>
      </div>

      <div className="mx-4 h-px bg-slate-800 mb-3" />

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5 px-3">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive ? "bg-gradient-to-r from-rose-500/20 to-pink-500/10 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              )}>
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-rose-400 to-pink-500 rounded-full" />}
              <Icon className={cn("shrink-0 transition-colors", isActive ? "text-rose-400" : "text-slate-500 group-hover:text-slate-300")} size={18} />
              <span className={cn("hidden md:block text-sm font-medium", isActive ? "text-white" : "")}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1">
        <Link href="/configuracoes"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
            pathname === "/configuracoes" ? "bg-gradient-to-r from-rose-500/20 to-pink-500/10 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
          )}>
          <Settings className={cn("shrink-0", pathname === "/configuracoes" ? "text-rose-400" : "text-slate-500 group-hover:text-slate-300")} size={18} />
          <span className="hidden md:block text-sm font-medium">Configurações</span>
        </Link>

        {/* Profile link */}
        <Link href="/perfil"
          className={cn(
            "hidden md:flex items-center gap-3 px-3 py-2.5 rounded-xl mt-2 border transition-all duration-200",
            pathname === "/perfil"
              ? "border-rose-500/30 bg-rose-500/10"
              : "border-slate-800 bg-slate-900/50 hover:bg-slate-800/70"
          )}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: userProfile.avatarColor }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{displayName}</p>
            <p className="text-[10px] text-slate-500 truncate">{displayRole}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
