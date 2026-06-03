"use client";

import { useAppStore } from "@/lib/store";
import { useCategoryMap } from "@/lib/useCategories";
import { EventForm } from "@/components/events/EventForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar, CheckSquare, Target, TrendingUp,
  Plus, Clock, AlertCircle, CheckCircle2, Circle, Flame, ArrowRight,
} from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import Link from "next/link";

const priorityLabels = { high: "Alta", medium: "Média", low: "Baixa" };
const priorityStyle = {
  high: "text-red-600 bg-red-50 border border-red-100",
  medium: "text-amber-600 bg-amber-50 border border-amber-100",
  low: "text-emerald-600 bg-emerald-50 border border-emerald-100",
};
const statusIcons = {
  pending: <Circle className="w-4 h-4 text-slate-300" />,
  in_progress: <AlertCircle className="w-4 h-4 text-amber-400" />,
  completed: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
};

export default function DashboardPage() {
  const { events, tasks, habits } = useAppStore();
  const CATEGORY_MAP = useCategoryMap();
  const [showEventForm, setShowEventForm] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const todayEvents = events
    .filter((e) => e.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const upcomingEvents = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.startTime.localeCompare(b.startTime))
    .slice(0, 5);

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const taskProgress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const todayHabits = habits.filter((h) => h.targetDays.includes(new Date().getDay()));
  const completedHabits = todayHabits.filter((h) => h.completedDates.includes(today));
  const habitProgress = todayHabits.length > 0
    ? Math.round((completedHabits.length / todayHabits.length) * 100) : 0;

  const highPriorityTasks = pendingTasks.filter((t) => t.priority === "high");
  const bestStreak = Math.max(...habits.map((h) => h.streak), 0);
  const dateLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  const card = "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700";
  const cardDivider = "border-b border-slate-50 dark:border-slate-700/60";
  const textPrimary = "text-slate-800 dark:text-slate-100";
  const textSecondary = "text-slate-400 dark:text-slate-500";
  const hoverRow = "hover:bg-slate-50/80 dark:hover:bg-slate-700/40";

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-7 py-8">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-pink-500/5 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1 capitalize">{dateLabel}</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">{greeting} 👋</h1>
            <p className="text-slate-400 text-sm mt-1.5">
              Você tem <span className="text-white font-semibold">{todayEvents.length} eventos</span> e{" "}
              <span className="text-white font-semibold">{pendingTasks.length} tarefas</span> hoje.
            </p>
          </div>
          <Button
            onClick={() => setShowEventForm(true)}
            className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25 border-0 font-medium"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo Evento
          </Button>
        </div>

        <div className="relative grid grid-cols-4 gap-3 mt-6">
          {[
            { icon: Calendar, label: "Eventos hoje", value: todayEvents.length, href: "/calendario", color: "text-rose-400" },
            { icon: CheckSquare, label: "Pendentes", value: pendingTasks.length, href: "/tarefas", color: "text-blue-400" },
            { icon: Target, label: "Hábitos", value: `${completedHabits.length}/${todayHabits.length}`, href: "/habitos", color: "text-violet-400" },
            { icon: TrendingUp, label: "Melhor streak", value: `${bestStreak}d`, href: "/habitos", color: "text-amber-400" },
          ].map(({ icon: Icon, label, value, href, color }) => (
            <Link key={href} href={href}>
              <div className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/8 rounded-2xl p-4 transition-all duration-200 cursor-pointer group">
                <Icon className={`w-4 h-4 ${color} mb-2`} />
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-7 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agenda de hoje */}
          <div className={`lg:col-span-2 rounded-2xl overflow-hidden card-shadow ${card}`}>
            <div className={`flex items-center justify-between px-6 py-4 ${cardDivider}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full" />
                <h2 className={`font-semibold text-sm ${textPrimary}`}>Agenda de Hoje</h2>
              </div>
              <Link href="/calendario" className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors">
                Ver tudo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              {todayEvents.length === 0 ? (
                <div className="py-14 text-center">
                  <Calendar className={`w-10 h-10 mx-auto mb-3 ${textSecondary} opacity-30`} />
                  <p className={`text-sm ${textSecondary}`}>Nenhum evento para hoje</p>
                  <button onClick={() => setShowEventForm(true)} className="mt-3 text-xs text-rose-500 hover:text-rose-600 font-medium">
                    + Adicionar evento
                  </button>
                </div>
              ) : (
                todayEvents.map((event, i) => {
                  const cat = CATEGORY_MAP[event.categoryId];
                  return (
                    <div key={event.id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${hoverRow} ${i !== todayEvents.length - 1 ? cardDivider : ""}`}>
                      <div className="text-center w-14 shrink-0">
                        <p className={`text-lg font-bold ${textPrimary}`}>{event.startTime}</p>
                        <p className={`text-[10px] mt-0.5 ${textSecondary}`}>{event.endTime}</p>
                      </div>
                      <div className="w-0.5 h-10 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${textPrimary}`}>{event.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ color: cat.color, backgroundColor: `${cat.color}15` }}>{cat.name}</span>
                          {!event.confirmed && <span className="text-[10px] text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100">A confirmar</span>}
                        </div>
                      </div>
                      <Clock className={`w-3.5 h-3.5 shrink-0 ${textSecondary} opacity-50`} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Progress cards */}
          <div className="space-y-4">
            <div className={`rounded-2xl p-5 card-shadow ${card}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <span className={`text-sm font-semibold ${textPrimary}`}>Tarefas</span>
                </div>
                <span className={`text-2xl font-bold ${textPrimary}`}>{taskProgress}%</span>
              </div>
              <Progress value={taskProgress} className="h-1.5 bg-slate-100 dark:bg-slate-700" />
              <p className={`text-xs mt-2 ${textSecondary}`}>{completedCount} de {tasks.length} concluídas</p>
            </div>

            <div className={`rounded-2xl p-5 card-shadow ${card}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-violet-500" />
                  </div>
                  <span className={`text-sm font-semibold ${textPrimary}`}>Hábitos</span>
                </div>
                <span className={`text-2xl font-bold ${textPrimary}`}>{habitProgress}%</span>
              </div>
              <Progress value={habitProgress} className="h-1.5 bg-slate-100 dark:bg-slate-700" />
              <p className={`text-xs mt-2 ${textSecondary}`}>{completedHabits.length} de {todayHabits.length} realizados</p>
            </div>

            <div className={`rounded-2xl p-5 card-shadow ${card}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <span className={`text-sm font-semibold ${textPrimary}`}>Sequências</span>
              </div>
              <div className="space-y-2.5">
                {habits.filter((h) => h.streak > 0).sort((a, b) => b.streak - a.streak).slice(0, 4).map((h) => (
                  <div key={h.id} className="flex items-center justify-between">
                    <span className={`text-xs truncate flex-1 mr-2 ${textPrimary}`}>{h.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-xs font-bold text-orange-500">{h.streak}</span>
                    </div>
                  </div>
                ))}
                {habits.filter((h) => h.streak > 0).length === 0 && (
                  <p className={`text-xs ${textSecondary}`}>Nenhuma sequência ainda</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tarefas urgentes */}
        {highPriorityTasks.length > 0 && (
          <div className={`rounded-2xl overflow-hidden card-shadow ${card}`}>
            <div className={`flex items-center justify-between px-6 py-4 ${cardDivider}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <h2 className={`font-semibold text-sm ${textPrimary}`}>Tarefas Urgentes</h2>
                <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded-full">{highPriorityTasks.length}</span>
              </div>
              <Link href="/tarefas" className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors">
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              {highPriorityTasks.slice(0, 4).map((task, i) => {
                const cat = CATEGORY_MAP[task.categoryId];
                return (
                  <div key={task.id} className={`flex items-center gap-3 px-6 py-3.5 transition-colors ${hoverRow} ${i !== Math.min(highPriorityTasks.length, 4) - 1 ? cardDivider : ""}`}>
                    {statusIcons[task.status]}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${textPrimary}`}>{task.title}</p>
                      {task.dueDate && <p className={`text-xs mt-0.5 ${textSecondary}`}>Prazo: {format(parseISO(task.dueDate), "d/MM/yyyy")}</p>}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0" style={{ color: cat.color, backgroundColor: `${cat.color}15` }}>{cat.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${priorityStyle[task.priority]}`}>{priorityLabels[task.priority]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Próximos eventos */}
        <div className={`rounded-2xl overflow-hidden card-shadow ${card}`}>
          <div className={`flex items-center justify-between px-6 py-4 ${cardDivider}`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-violet-500 rounded-full" />
              <h2 className={`font-semibold text-sm ${textPrimary}`}>Próximos Eventos</h2>
            </div>
            <Link href="/calendario" className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors">
              Calendário <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {upcomingEvents.length === 0 ? (
              <div className={`py-12 text-center text-sm ${textSecondary}`}>Nenhum evento próximo</div>
            ) : (
              upcomingEvents.map((event, i) => {
                const cat = CATEGORY_MAP[event.categoryId];
                const eventDate = parseISO(event.date);
                const isEventToday = isToday(eventDate);
                return (
                  <div key={event.id} className={`flex items-center gap-4 px-6 py-3.5 transition-colors ${hoverRow} ${i !== upcomingEvents.length - 1 ? cardDivider : ""}`}>
                    <div className="text-center w-10 shrink-0">
                      <p className={`text-[10px] uppercase ${textSecondary}`}>{format(eventDate, "EEE", { locale: ptBR })}</p>
                      <p className={`text-lg font-bold ${isEventToday ? "text-rose-500" : textPrimary}`}>{format(eventDate, "d")}</p>
                    </div>
                    <div className="w-0.5 h-8 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${textPrimary}`}>{event.title}</p>
                      <p className={`text-xs mt-0.5 ${textSecondary}`}>{event.startTime} – {event.endTime}</p>
                    </div>
                    {isEventToday && <Badge className="bg-rose-50 text-rose-600 border-rose-100 text-[10px] px-2 py-0.5 font-medium">Hoje</Badge>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <EventForm open={showEventForm} onClose={() => setShowEventForm(false)} initialDate={today} />
    </div>
  );
}
