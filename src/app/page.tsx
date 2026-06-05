"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useCategoryMap } from "@/lib/useCategories";
import { EventForm } from "@/components/events/EventForm";
import { Button } from "@/components/ui/button";
import {
  Calendar, CheckSquare, Target, Flame,
  Plus, ArrowRight, CheckCircle2, Circle, AlertCircle,
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
  pending:     <Circle size={14} className="text-[var(--muted-foreground)] shrink-0" strokeWidth={1.5} />,
  in_progress: <AlertCircle size={14} className="text-amber-400 shrink-0" strokeWidth={1.5} />,
  completed:   <CheckCircle2 size={14} className="text-emerald-500 shrink-0" strokeWidth={1.5} />,
};

export default function DashboardPage() {
  const { events, tasks, habits, updateEvent } = useAppStore();
  const CATEGORY_MAP = useCategoryMap();
  const [showEventForm, setShowEventForm] = useState(false);

  const today        = format(new Date(), "yyyy-MM-dd");
  const dateLabel    = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const dateCapital  = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  const todayEvents  = events.filter((e) => e.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const upcomingEvents = events
    .filter((e) => e.date > today)
    .sort((a, b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.startTime.localeCompare(b.startTime))
    .slice(0, 6);

  const pendingTasks    = tasks.filter((t) => t.status !== "completed");
  const completedCount  = tasks.filter((t) => t.status === "completed").length;
  const todayHabits     = habits.filter((h) => h.targetDays.includes(new Date().getDay()));
  const completedHabits = todayHabits.filter((h) => h.completedDates.includes(today));
  const bestStreak      = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const highPriTasks    = pendingTasks.filter((t) => t.priority === "high");

  const stats = [
    { icon: Calendar,     color: "text-zinc-600",   label: "Eventos hoje",    value: todayEvents.length,                                 href: "/calendario" },
    { icon: CheckSquare,  color: "text-blue-500",   label: "Pendentes",       value: pendingTasks.length,                                href: "/tarefas"    },
    { icon: CheckCircle2, color: "text-emerald-500",label: "Concluídas",      value: `${completedCount}/${tasks.length}`,                href: "/tarefas"    },
    { icon: Target,       color: "text-zinc-500",   label: "Hábitos hoje",    value: `${completedHabits.length}/${todayHabits.length}`,  href: "/habitos"    },
    { icon: Flame,        color: "text-orange-400", label: "Maior sequência", value: `${bestStreak}d`,                                  href: "/habitos"    },
  ];

  return (
    <div className="min-h-full bg-[var(--background)]">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3.5 sm:px-8 sm:py-5 bg-[var(--card)] dark:bg-[var(--secondary)] border-b border-[var(--border)]">
        <div>
          <p className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-widest mb-0.5">
            {dateCapital}
          </p>
          <h1 className="text-[22px] font-semibold text-[var(--foreground)] tracking-tight leading-none">
            Início
          </h1>
        </div>
        <Button
          onClick={() => setShowEventForm(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white border-0 rounded-lg h-8 px-3 text-[12px] font-medium shadow-none transition-colors duration-150"
        >
          <Plus size={13} className="mr-1.5" strokeWidth={2} />
          Novo evento
        </Button>
      </div>

      {/* ── Stats strip — scroll horizontal em mobile ─────────────────── */}
      <div className="flex overflow-x-auto scrollbar-none bg-[var(--card)] dark:bg-[var(--secondary)] border-b border-[var(--border)]">
        {stats.map(({ icon: Icon, color, label, value, href }, i) => (
          <Link key={href} href={href} className="flex-none min-w-[90px] group">
            <div className={`flex flex-col px-4 sm:px-6 py-3 sm:py-4 ${i !== 0 ? "border-l border-[var(--border)]" : ""} hover:bg-[var(--secondary)] dark:hover:bg-[var(--card)] transition-colors duration-150`}>
              <Icon size={14} className={`${color} mb-2`} strokeWidth={1.5} />
              <span className="text-[17px] sm:text-[19px] font-semibold text-[var(--foreground)] leading-none">{value}</span>
              <span className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-1 font-normal">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="px-4 py-4 sm:px-8 sm:py-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Today */}
          <div className="lg:col-span-3 bg-[var(--card)] dark:bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-card">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
              <span className="text-[12px] font-semibold text-[var(--foreground)]">Agenda de hoje</span>
              <Link href="/calendario" className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-900 transition-colors font-medium">
                Ver calendário <ArrowRight size={11} strokeWidth={2} />
              </Link>
            </div>
            {todayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-[13px] font-medium text-[var(--foreground)]">Nenhum evento hoje</p>
                <p className="text-[12px] text-[var(--muted-foreground)] mt-0.5">Clique em um horário no calendário</p>
              </div>
            ) : (
              <div>
                {todayEvents.map((event, i) => {
                  const cat = CATEGORY_MAP[event.categoryId];
                  if (!cat) return null;
                  const isCompleted = !!event.completed;
                  return (
                    <div key={event.id}
                      className={`flex items-center gap-3.5 px-5 py-3 hover:bg-[var(--secondary)] dark:hover:bg-[var(--accent)]/40 transition-colors duration-100 ${i !== todayEvents.length - 1 ? "border-b border-[var(--border)]" : ""} ${isCompleted ? "opacity-60" : ""}`}>
                      <button
                        onClick={() => updateEvent(event.id, { completed: !isCompleted })}
                        className="shrink-0 transition-transform hover:scale-110"
                        aria-label={isCompleted ? "Marcar como pendente" : "Marcar como concluído"}
                      >
                        {isCompleted
                          ? <CheckCircle2 size={16} className="text-emerald-500" strokeWidth={1.5} />
                          : <Circle size={16} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                        }
                      </button>
                      <div className="text-right w-11 shrink-0">
                        <p className={`text-[12px] font-semibold tabular-nums ${isCompleted ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>{event.startTime}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)] tabular-nums">{event.endTime}</p>
                      </div>
                      <div className="w-[2px] h-7 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-medium truncate ${isCompleted ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>{event.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-[10px] text-[var(--muted-foreground)]">{cat.name}</span>
                          {!event.confirmed && (
                            <span className="text-[10px] text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-px rounded-md">A confirmar</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div className="lg:col-span-2 bg-[var(--card)] dark:bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-card">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
              <span className="text-[12px] font-semibold text-[var(--foreground)]">Próximos eventos</span>
              <Link href="/calendario" className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-900 transition-colors font-medium">
                Ver todos <ArrowRight size={11} strokeWidth={2} />
              </Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-[12px] text-[var(--muted-foreground)] text-center py-10">Sem eventos próximos</p>
            ) : upcomingEvents.map((event, i) => {
              const cat = CATEGORY_MAP[event.categoryId];
              if (!cat) return null;
              const eventDate = parseISO(event.date);
              const isEventToday = isToday(eventDate);
              return (
                <div key={event.id}
                  className={`flex items-center gap-3 px-5 py-2.5 hover:bg-[var(--secondary)] dark:hover:bg-[var(--accent)]/40 transition-colors duration-100 ${i !== upcomingEvents.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
                  <div className="w-8 h-8 rounded-xl bg-[var(--secondary)] dark:bg-[#3F3F46] flex flex-col items-center justify-center shrink-0">
                    <p className="text-[8px] text-[var(--muted-foreground)] uppercase leading-none">{format(eventDate, "MMM", { locale: ptBR })}</p>
                    <p className={`text-[12px] font-bold leading-none mt-0.5 ${isEventToday ? "text-zinc-900 dark:text-white font-bold" : "text-[var(--foreground)]"}`}>{format(eventDate, "d")}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[var(--foreground)] truncate">{event.title}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] tabular-nums">{event.startTime}{isEventToday ? " · Hoje" : ""}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority tasks */}
        {highPriTasks.length > 0 && (
          <div className="bg-[var(--card)] dark:bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-card">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-[var(--foreground)]">Tarefas urgentes</span>
                <span className="text-[10px] font-semibold text-red-500 bg-red-50 dark:bg-red-950/40 px-1.5 py-px rounded-md">{highPriTasks.length}</span>
              </div>
              <Link href="/tarefas" className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-900 transition-colors font-medium">
                Ver todas <ArrowRight size={11} strokeWidth={2} />
              </Link>
            </div>
            {highPriTasks.slice(0, 5).map((task, i) => {
              const cat = CATEGORY_MAP[task.categoryId];
              return (
                <div key={task.id}
                  className={`flex items-center gap-3 px-5 py-2.5 hover:bg-[var(--secondary)] dark:hover:bg-[var(--accent)]/40 transition-colors duration-100 ${i !== Math.min(highPriTasks.length, 5) - 1 ? "border-b border-[var(--border)]" : ""}`}>
                  {statusIcon[task.status]}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--foreground)] truncate">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-[10px] text-[var(--muted-foreground)]">
                        Prazo: {format(parseISO(task.dueDate), "d/MM/yyyy")}
                      </p>
                    )}
                  </div>
                  {cat && (
                    <span className="text-[10px] px-1.5 py-px rounded-md font-medium shrink-0" style={{ color: cat.color, backgroundColor: `${cat.color}15` }}>
                      {cat.name}
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-px rounded-md font-medium shrink-0 ${priorityStyle[task.priority]}`}>
                    {priorityLabel[task.priority]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EventForm open={showEventForm} onClose={() => setShowEventForm(false)} initialDate={today} />
    </div>
  );
}
