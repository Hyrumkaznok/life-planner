"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useCategoryMap } from "@/lib/useCategories";
import { EventForm } from "@/components/events/EventForm";
import { Button } from "@/components/ui/button";
import {
  Calendar, CheckSquare, Target, Flame,
  Plus, Clock, ArrowRight, CheckCircle2,
  Circle, AlertCircle, TrendingUp,
} from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

const priorityStyle = {
  high:   "text-red-500 bg-red-50 dark:bg-red-950/40",
  medium: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
  low:    "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
};
const priorityLabel = { high: "Alta", medium: "Média", low: "Baixa" };
const statusIcon = {
  pending:     <Circle className="w-[15px] h-[15px] text-[#CBD5E1]" strokeWidth={1.75} />,
  in_progress: <AlertCircle className="w-[15px] h-[15px] text-amber-400" strokeWidth={1.75} />,
  completed:   <CheckCircle2 className="w-[15px] h-[15px] text-emerald-500" strokeWidth={1.75} />,
};

function StatCard({
  icon: Icon, color, bg, label, value, sub, href,
}: {
  icon: React.ElementType; color: string; bg: string;
  label: string; value: string | number; sub?: string; href: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-[var(--card)] dark:bg-[#27272A] rounded-3xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer border border-[var(--border)] group">
        <div className={`w-9 h-9 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
          <Icon size={16} className={color} strokeWidth={1.75} />
        </div>
        <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">{value}</p>
        <p className="text-[12px] font-medium text-[var(--foreground)] mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{sub}</p>}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { events, tasks, habits } = useAppStore();
  const CATEGORY_MAP = useCategoryMap();
  const [showEventForm, setShowEventForm] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const hour  = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const dateLabel = format(new Date(), "EEE, d 'de' MMMM", { locale: ptBR });

  const todayEvents = events.filter((e) => e.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const upcomingEvents = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.startTime.localeCompare(b.startTime))
    .slice(0, 6);
  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const todayHabits = habits.filter((h) => h.targetDays.includes(new Date().getDay()));
  const completedHabits = todayHabits.filter((h) => h.completedDates.includes(today));
  const bestStreak = Math.max(...habits.map((h) => h.streak), 0);
  const highPriorityTasks = pendingTasks.filter((t) => t.priority === "high");

  return (
    <div className="min-h-full bg-[var(--background)]">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#0F172A] dark:bg-[#09090B] border-b border-white/[0.06]">
        {/* Glassmorphism orbs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-48 h-48 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-8 py-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] text-slate-500 uppercase tracking-widest font-medium capitalize">{dateLabel}</p>
              <h1 className="text-[28px] font-bold text-white tracking-tight mt-1">{greeting} 👋</h1>
              <p className="text-[13px] text-slate-400 mt-1.5">
                {todayEvents.length === 0 ? "Nenhum evento hoje." : (
                  <>{todayEvents.length} evento{todayEvents.length > 1 ? "s" : ""} · {pendingTasks.length} tarefas pendentes</>
                )}
              </p>
            </div>
            <Button
              onClick={() => setShowEventForm(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white border-0 rounded-2xl px-4 shadow-none h-9 text-[13px] font-medium transition-all duration-150"
            >
              <Plus size={14} className="mr-1.5" />
              Novo evento
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-7 space-y-8 max-w-6xl">

        {/* ── Stat cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard icon={Calendar}    color="text-indigo-500"  bg="bg-indigo-50 dark:bg-indigo-950/50"  label="Eventos hoje"       value={todayEvents.length}                             href="/calendario" />
          <StatCard icon={CheckSquare} color="text-blue-500"    bg="bg-blue-50 dark:bg-blue-950/50"      label="Tarefas pendentes"  value={pendingTasks.length}                            href="/tarefas" />
          <StatCard icon={Target}      color="text-violet-500"  bg="bg-violet-50 dark:bg-violet-950/50"  label="Hábitos hoje"       value={`${completedHabits.length}/${todayHabits.length}`} href="/habitos" />
          <StatCard icon={CheckCircle2}color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-950/50" label="Concluídas"        value={completedCount}     sub={`de ${tasks.length} tarefas`} href="/tarefas" />
          <StatCard icon={Flame}       color="text-orange-500"  bg="bg-orange-50 dark:bg-orange-950/50"  label="Melhor sequência"   value={`${bestStreak}d`}                               href="/habitos" />
        </div>

        {/* ── Main grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Today's schedule */}
          <div className="lg:col-span-3 bg-[var(--card)] dark:bg-[#27272A] rounded-3xl border border-[var(--border)] shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <p className="text-[13px] font-semibold text-[var(--foreground)]">Agenda de hoje</p>
              <Link href="/calendario" className="flex items-center gap-1 text-[12px] text-indigo-500 hover:text-indigo-600 font-medium transition-colors">
                Ver calendário <ArrowRight size={12} />
              </Link>
            </div>

            {todayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-10 h-10 rounded-2xl bg-[var(--secondary)] flex items-center justify-center mb-3">
                  <Calendar size={16} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] font-medium text-[var(--foreground)]">Nenhum evento hoje</p>
                <p className="text-[12px] text-[var(--muted-foreground)] mt-1">Clique no calendário para adicionar</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {todayEvents.map((event) => {
                  const cat = CATEGORY_MAP[event.categoryId];
                  if (!cat) return null;
                  return (
                    <div key={event.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-[var(--secondary)] dark:hover:bg-[#3F3F46]/40 transition-colors duration-150">
                      <div className="text-right w-12 shrink-0">
                        <p className="text-[13px] font-semibold text-[var(--foreground)]">{event.startTime}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)]">{event.endTime}</p>
                      </div>
                      <div className="w-[3px] h-9 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--foreground)] truncate">{event.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-[11px] text-[var(--muted-foreground)]">{cat.name}</span>
                          {!event.confirmed && (
                            <span className="text-[10px] text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-lg">A confirmar</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming events */}
          <div className="lg:col-span-2 bg-[var(--card)] dark:bg-[#27272A] rounded-3xl border border-[var(--border)] shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <p className="text-[13px] font-semibold text-[var(--foreground)]">Próximos eventos</p>
              <Link href="/calendario" className="flex items-center gap-1 text-[12px] text-indigo-500 hover:text-indigo-600 font-medium transition-colors">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {upcomingEvents.length === 0 ? (
                <p className="text-[13px] text-[var(--muted-foreground)] text-center py-10">Sem eventos próximos</p>
              ) : upcomingEvents.map((event) => {
                const cat = CATEGORY_MAP[event.categoryId];
                if (!cat) return null;
                const eventDate = parseISO(event.date);
                const isEventToday = isToday(eventDate);
                return (
                  <div key={event.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--secondary)] dark:hover:bg-[#3F3F46]/40 transition-colors duration-150">
                    <div className="w-9 h-9 rounded-2xl bg-[var(--secondary)] dark:bg-[#3F3F46] flex flex-col items-center justify-center shrink-0">
                      <p className="text-[9px] text-[var(--muted-foreground)] uppercase leading-none">{format(eventDate, "MMM", { locale: ptBR })}</p>
                      <p className={`text-[13px] font-bold leading-none mt-0.5 ${isEventToday ? "text-indigo-500" : "text-[var(--foreground)]"}`}>{format(eventDate, "d")}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[var(--foreground)] truncate">{event.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-[var(--muted-foreground)]" strokeWidth={1.75} />
                        <p className="text-[11px] text-[var(--muted-foreground)]">{event.startTime}</p>
                        {isEventToday && <span className="ml-1 text-[10px] text-indigo-500 font-semibold">Hoje</span>}
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Priority tasks ───────────────────────────────────────────── */}
        {highPriorityTasks.length > 0 && (
          <div className="bg-[var(--card)] dark:bg-[#27272A] rounded-3xl border border-[var(--border)] shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-[var(--foreground)]">Tarefas urgentes</p>
                <span className="text-[11px] font-semibold text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-lg">{highPriorityTasks.length}</span>
              </div>
              <Link href="/tarefas" className="flex items-center gap-1 text-[12px] text-indigo-500 hover:text-indigo-600 font-medium transition-colors">
                Ver todas <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {highPriorityTasks.slice(0, 5).map((task) => {
                const cat = CATEGORY_MAP[task.categoryId];
                return (
                  <div key={task.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-[var(--secondary)] dark:hover:bg-[#3F3F46]/40 transition-colors duration-150">
                    {statusIcon[task.status]}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[var(--foreground)] truncate">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                          Prazo: {format(parseISO(task.dueDate), "d/MM/yyyy")}
                        </p>
                      )}
                    </div>
                    {cat && (
                      <span className="text-[11px] px-2 py-0.5 rounded-lg shrink-0 font-medium" style={{ color: cat.color, backgroundColor: `${cat.color}15` }}>
                        {cat.name}
                      </span>
                    )}
                    <span className={`text-[11px] px-2 py-0.5 rounded-lg font-medium shrink-0 ${priorityStyle[task.priority]}`}>
                      {priorityLabel[task.priority]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <EventForm open={showEventForm} onClose={() => setShowEventForm(false)} initialDate={today} />
    </div>
  );
}
