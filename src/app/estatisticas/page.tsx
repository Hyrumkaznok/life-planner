"use client";

import { useAppStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/constants";
import { useCategoryMap } from "@/lib/useCategories";
import { PageHeader } from "@/components/layout/PageHeader";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Flame, CheckSquare, Calendar, Target, Clock, TrendingUp, Trophy, BarChart2 } from "lucide-react";

// ── Helpers de duração ────────────────────────────────────────────────────────

function calcDurationMins(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
}

function formatDuration(mins: number): string {
  if (mins === 0) return "0min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

export default function EstatisticasPage() {
  const { events, tasks, habits } = useAppStore();
  const CATEGORY_MAP = useCategoryMap();

  const today = format(new Date(), "yyyy-MM-dd");
  const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const thisWeekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const totalTasks = tasks.length;

  const last7DaysDates = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), "yyyy-MM-dd"));
  const last7DaysCompletions = habits.reduce(
    (sum, h) => sum + h.completedDates.filter((d) => last7DaysDates.includes(d)).length, 0
  );
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const todayEvents = events.filter((e) => e.date === today).length;
  const thisWeekEvents = events.filter((e) => e.date >= thisWeekStart && e.date <= thisWeekEnd).length;

  const habitWeekData = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const date = format(d, "yyyy-MM-dd");
    const dayLabel = format(d, "EEE", { locale: ptBR });
    const dayOfWeek = d.getDay();
    const scheduled = habits.filter((h) => h.targetDays.includes(dayOfWeek)).length;
    const completed = habits.filter((h) => h.completedDates.includes(date)).length;
    return { date, dayLabel, scheduled, completed, pct: scheduled > 0 ? (completed / scheduled) * 100 : 0 };
  });

  const eventsByCategory = CATEGORIES.map((cat) => ({
    ...cat, count: events.filter((e) => e.categoryId === cat.id).length,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  // ── Estatísticas de tempo semanal ─────────────────────────────────────────
  const weekEvents     = events.filter((e) => e.date >= thisWeekStart && e.date <= thisWeekEnd);
  const weekCompleted  = weekEvents.filter((e) =>
    (e.completedDates ?? []).some((d) => d >= thisWeekStart && d <= thisWeekEnd)
  );

  const totalPlannedMins   = weekEvents.reduce((s, e) => s + calcDurationMins(e.startTime, e.endTime), 0);
  const totalCompletedMins = weekCompleted.reduce((s, e) => s + calcDurationMins(e.startTime, e.endTime), 0);
  const completionPct      = totalPlannedMins > 0 ? Math.round((totalCompletedMins / totalPlannedMins) * 100) : 0;

  const hoursByCategory = CATEGORIES.map((cat) => {
    const planned   = weekEvents.filter((e) => e.categoryId === cat.id);
    const completed = planned.filter((e) =>
      (e.completedDates ?? []).some((d) => d >= thisWeekStart && d <= thisWeekEnd)
    );
    const plannedMins   = planned.reduce((s, e) => s + calcDurationMins(e.startTime, e.endTime), 0);
    const completedMins = completed.reduce((s, e) => s + calcDurationMins(e.startTime, e.endTime), 0);
    return { ...cat, plannedMins, completedMins, count: completed.length };
  }).filter((c) => c.plannedMins > 0).sort((a, b) => b.completedMins - a.completedMins);

  const topCategory = hoursByCategory[0] ?? null;

  const tasksByStatus = [
    { label: "Concluídas", count: completedTasks, color: "#22C55E", bg: "#22C55E15" },
    { label: "Em andamento", count: inProgressTasks, color: "#F59E0B", bg: "#F59E0B15" },
    { label: "Pendentes", count: pendingTasks, color: "#94A3B8", bg: "#94A3B815" },
  ];

  return (
    <div className="min-h-full">
      <PageHeader title="Estatísticas" subtitle="Acompanhe seu progresso e evolução" />

      <div className="p-7 space-y-6">

        {/* ── Cards: horas semanais ─────────────────────────────────────────── */}
        <div>
          <h2 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest mb-3">Esta semana</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Clock,     label: "Horas planejadas",   value: formatDuration(totalPlannedMins),   sub: `${weekEvents.length} evento${weekEvents.length !== 1 ? "s" : ""}`, gradient: "from-slate-700 to-slate-900" },
              { icon: CheckSquare, label: "Horas concluídas", value: formatDuration(totalCompletedMins), sub: `${weekCompleted.length} concluído${weekCompleted.length !== 1 ? "s" : ""}`, gradient: "from-green-600 to-green-800" },
              { icon: TrendingUp, label: "Taxa de conclusão", value: `${completionPct}%`,               sub: completionPct >= 70 ? "Ótimo ritmo!" : completionPct >= 40 ? "Em progresso" : "Continue firme", gradient: completionPct >= 70 ? "from-teal-600 to-teal-800" : completionPct >= 40 ? "from-amber-600 to-amber-800" : "from-zinc-600 to-zinc-800" },
              { icon: Trophy,    label: "Categoria top",      value: topCategory?.name ?? "—",          sub: topCategory ? formatDuration(topCategory.completedMins) + " concluídas" : "Nenhum evento", gradient: "from-violet-600 to-violet-800" },
            ].map(({ icon: Icon, label, value, sub, gradient }) => (
              <div key={label} className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-elevated`}>
                <Icon className="w-5 h-5 mb-3 opacity-80" />
                <p className="text-2xl font-bold leading-tight">{value}</p>
                <p className="text-sm font-medium mt-0.5 opacity-90">{label}</p>
                <p className="text-[11px] mt-1 opacity-60">{sub}</p>
              </div>
            ))}
          </div>

          {/* Barra de progresso geral */}
          {totalPlannedMins > 0 && (
            <div className="mt-4 bg-[var(--card)] rounded-2xl p-5 card-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-[var(--foreground)]">Planejado × Concluído</p>
                <span className="text-xs font-semibold text-slate-500">
                  {formatDuration(totalCompletedMins)} de {formatDuration(totalPlannedMins)}
                </span>
              </div>
              <div className="h-3 bg-[var(--secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${completionPct}%`, background: "linear-gradient(to right, #22C55E, #16A34A)" }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 text-right">{completionPct}% concluído</p>
            </div>
          )}
        </div>

        {/* ── Tempo por categoria ───────────────────────────────────────────── */}
        {hoursByCategory.length > 0 && (
          <div className="bg-[var(--card)] rounded-2xl p-6 card-shadow">
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">
              Tempo por Categoria — Esta Semana
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-5">
              Apenas eventos marcados como concluídos · planejado vs realizado
            </p>
            <div className="space-y-4">
              {hoursByCategory.map((cat) => {
                const pct = cat.plannedMins > 0 ? Math.round((cat.completedMins / cat.plannedMins) * 100) : 0;
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}18` }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        </div>
                        <span className="text-sm font-medium text-[var(--foreground)]">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold" style={{ color: cat.color }}>{formatDuration(cat.completedMins)}</span>
                        <span className="text-xs text-[var(--muted-foreground)] ml-1">/ {formatDuration(cat.plannedMins)}</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                      {/* Barra de fundo = planejado */}
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: cat.color, opacity: 0.85 }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{pct}% concluído · {cat.count} evento{cat.count !== 1 ? "s" : ""}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div>
          <h2 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest mb-3">Resumo geral</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: "Total de Eventos", value: events.length, sub: `${todayEvents} hoje · ${thisWeekEvents} esta semana`, gradient: "from-green-700 to-green-900" },
            { icon: CheckSquare, label: "Tarefas Concluídas", value: completedTasks, sub: `de ${totalTasks} no total`, gradient: "from-teal-500 to-teal-700" },
            { icon: Target, label: "Conclusões (7 dias)", value: last7DaysCompletions, sub: `${habits.length} hábitos ativos`, gradient: "from-zinc-600 to-zinc-800" },
            { icon: Flame, label: "Melhor Sequência", value: `${bestStreak}d`, sub: "sequência ativa", gradient: "from-slate-500 to-slate-700" },
          ].map(({ icon: Icon, label, value, sub, gradient }) => (
            <div key={label} className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-elevated`}>
              <Icon className="w-5 h-5 mb-3 opacity-80" />
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm font-medium mt-0.5 opacity-90">{label}</p>
              <p className="text-[11px] mt-1 opacity-60">{sub}</p>
            </div>
          ))}
        </div>
        </div>{/* fim resumo geral */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Habit bar chart */}
          <div className="bg-[var(--card)] rounded-2xl p-6 card-shadow">
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Hábitos — Últimos 7 Dias</h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-5">Concluídos vs programados por dia</p>
            <div className="flex items-end justify-between gap-2 h-36">
              {habitWeekData.map(({ dayLabel, scheduled, completed, pct }) => (
                <div key={dayLabel} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full flex flex-col justify-end rounded-xl overflow-hidden bg-[var(--secondary)] relative" style={{ height: "100px" }}>
                    <div className="w-full rounded-xl transition-all duration-500"
                      style={{ height: `${pct}%`, background: "linear-gradient(to top, #8B5CF6, #A78BFA)", minHeight: pct > 0 ? 6 : 0 }} />
                  </div>
                  <span className="text-[9px] text-slate-400 capitalize font-medium">{dayLabel}</span>
                  <span className="text-[10px] font-bold text-slate-600">{completed}/{scheduled}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Task donut + breakdown */}
          <div className="bg-[var(--card)] rounded-2xl p-6 card-shadow">
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Distribuição de Tarefas</h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-5">Por status e prioridade</p>
            <div className="space-y-3">
              {tasksByStatus.map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[var(--foreground)] font-medium">{label}</span>
                    </div>
                    <span className="font-bold text-slate-700">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--secondary)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${totalTasks > 0 ? (count / totalTasks) * 100 : 0}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}

              <div className="border-t border-[var(--border)] pt-3 mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Alta", count: tasks.filter((t) => t.priority === "high").length, color: "#EF4444" },
                  { label: "Média", count: tasks.filter((t) => t.priority === "medium").length, color: "#F59E0B" },
                  { label: "Baixa", count: tasks.filter((t) => t.priority === "low").length, color: "#22C55E" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="text-center rounded-xl py-2.5 px-2" style={{ backgroundColor: `${color}12` }}>
                    <p className="text-lg font-bold" style={{ color }}>{count}</p>
                    <p className="text-[10px] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Events by category */}
        <div className="bg-[var(--card)] rounded-2xl p-6 card-shadow">
          <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Eventos por Categoria</h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-5">{events.length} eventos registrados no total</p>
          {eventsByCategory.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Nenhum evento cadastrado</p>
          ) : (
            <div className="space-y-3">
              {eventsByCategory.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}18` }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  </div>
                  <span className="text-sm text-slate-700 font-medium w-32 shrink-0">{cat.name}</span>
                  <div className="flex-1 h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(cat.count / events.length) * 100}%`, backgroundColor: cat.color }} />
                  </div>
                  <span className="text-sm font-bold w-6 text-right" style={{ color: cat.color }}>{cat.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Habit streaks */}
        <div className="bg-[var(--card)] rounded-2xl p-6 card-shadow">
          <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Sequências dos Hábitos</h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-5">Dias consecutivos de cada hábito</p>
          <div className="space-y-3">
            {habits.sort((a, b) => b.streak - a.streak).map((habit) => {
              const cat = CATEGORY_MAP[habit.categoryId];
              return (
                <div key={habit.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}18` }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  </div>
                  <span className="text-sm text-slate-700 font-medium flex-1 truncate">{habit.name}</span>
                  <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-full">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-sm font-bold text-orange-600">{habit.streak}</span>
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] w-24 text-right">
                    {habit.completedDates.length} concluídos
                  </span>
                </div>
              );
            })}
            {habits.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">Nenhum hábito cadastrado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
