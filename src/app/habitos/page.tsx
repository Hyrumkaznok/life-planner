"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useCategories, useCategoryMap } from "@/lib/useCategories";
import { Habit, HabitFrequency } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Flame, CheckCircle2, Circle, Trash2, Pencil, Target } from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const WEEK_DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function HabitFormDialog({ open, onClose, editHabit }: { open: boolean; onClose: () => void; editHabit?: Habit }) {
  const { addHabit, updateHabit } = useAppStore();
  const allCategories = useCategories();
  const [name, setName] = useState(editHabit?.name ?? "");
  const [categoryId, setCategoryId] = useState(editHabit?.categoryId ?? "saude");
  const [frequency, setFrequency] = useState<HabitFrequency>(editHabit?.frequency ?? "diaria");
  const [targetDays, setTargetDays] = useState<number[]>(editHabit?.targetDays ?? [0, 1, 2, 3, 4, 5, 6]);

  const toggleDay = (d: number) =>
    setTargetDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort());

  const handleSave = () => {
    if (!name.trim()) { toast.error("Informe o nome."); return; }
    if (targetDays.length === 0) { toast.error("Selecione ao menos um dia."); return; }
    const data = { name: name.trim(), categoryId: categoryId as Habit["categoryId"], frequency, targetDays };
    if (editHabit) { updateHabit(editHabit.id, data); toast.success("Hábito atualizado!"); }
    else           { addHabit(data); toast.success("Hábito criado!"); }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-800">{editHabit ? "Editar Hábito" : "Novo Hábito"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Nome *</Label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Meditação, Leitura..."
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 bg-slate-50/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v as Habit["categoryId"])}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />{cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frequência</Label>
              <Select value={frequency} onValueChange={(v) => v && setFrequency(v as HabitFrequency)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="diaria">Diária</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Dias da semana</Label>
            <div className="flex gap-1.5">
              {WEEK_DAY_LABELS.map((label, i) => (
                <button key={i} onClick={() => toggleDay(i)}
                  className={cn("flex-1 h-9 rounded-xl text-xs font-semibold border transition-all",
                    targetDays.includes(i)
                      ? "bg-zinc-800 text-white border-zinc-800 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-rose-300")}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-zinc-900 hover:bg-zinc-800 text-white border-0">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function HabitosPage() {
  const { habits, toggleHabitComplete, deleteHabit } = useAppStore();
  const CATEGORY_MAP = useCategoryMap();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayDOW = new Date().getDay();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return { date: format(d, "yyyy-MM-dd"), label: format(d, "EEE", { locale: ptBR }), dow: d.getDay() };
  });

  const todayHabits = habits.filter((h) => h.targetDays.includes(todayDOW));
  const completedToday = todayHabits.filter((h) => h.completedDates.includes(today));
  const progress = todayHabits.length > 0 ? Math.round((completedToday.length / todayHabits.length) * 100) : 0;

  return (
    <div className="min-h-full">
      <PageHeader title="Hábitos" subtitle="Construa rotinas consistentes dia após dia">
        <Button onClick={() => { setEditingHabit(undefined); setShowForm(true); }}
          className="bg-zinc-900 hover:bg-zinc-800 text-white border-0 shadow-sm"
          size="sm">
          <Plus className="w-4 h-4 mr-1" /> Novo Hábito
        </Button>
      </PageHeader>

      <div className="p-4 sm:p-7 space-y-4 sm:space-y-6">
        {/* Daily progress hero — responsivo */}
        <div className="relative overflow-hidden bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-2xl p-5 sm:p-6 text-white shadow-elevated">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative flex items-center gap-4 justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-zinc-300 text-xs sm:text-sm mb-1 capitalize truncate">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
              <p className="text-3xl sm:text-4xl font-bold">{progress}%</p>
              <p className="text-zinc-300 text-xs sm:text-sm mt-1">
                {completedToday.length} de {todayHabits.length} hábitos realizados
              </p>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="3"
                  strokeDasharray={`${progress} ${100 - progress}`} strokeLinecap="round" />
              </svg>
              <Target className="absolute w-5 h-5 sm:w-6 sm:h-6 text-white/90" />
            </div>
          </div>
          <div className="relative mt-3 sm:mt-4">
            <Progress value={progress} className="h-1.5 bg-white/20 [&>div]:bg-white" />
          </div>
        </div>

        {/* Habits list */}
        {habits.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">Nenhum hábito criado ainda</p>
            <Button onClick={() => setShowForm(true)} variant="outline" size="sm" className="mt-3">
              Criar meu primeiro hábito
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const cat = CATEGORY_MAP[habit.categoryId] ?? { name: "—", color: "#94A3B8" };
              const isCompletedToday = habit.completedDates.includes(today);
              const isScheduledToday = habit.targetDays.includes(todayDOW);

              return (
                <div key={habit.id}
                  className={cn(
                    "group bg-white dark:bg-[var(--card)] rounded-2xl border border-slate-100 dark:border-[var(--border)] p-5 card-shadow card-shadow-hover animate-enter",
                    isCompletedToday && "border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-[var(--card)]"
                  )}
                  style={{ animationDelay: `${habits.indexOf(habit) * 50}ms` }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${cat.color}28, 0 2px 8px ${cat.color}14`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                >
                  <div className="flex items-start gap-4">
                    {/* Check button */}
                    <button
                      onClick={() => isScheduledToday && toggleHabitComplete(habit.id, today)}
                      disabled={!isScheduledToday}
                      className={cn("mt-0.5 shrink-0 transition-all",
                        isScheduledToday ? "hover:scale-110 cursor-pointer" : "opacity-30 cursor-not-allowed"
                      )}>
                      {isCompletedToday
                        ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        : <Circle className="w-6 h-6 text-slate-200" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn("text-sm font-semibold text-slate-800",
                          isCompletedToday && "text-emerald-700")}>
                          {habit.name}
                        </p>
                        {!isScheduledToday && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                            Não programado hoje
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ color: cat.color, backgroundColor: `${cat.color}15` }}>
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {habit.frequency === "diaria" ? "Diário" : "Semanal"}
                        </span>
                        {habit.streak > 0 && (
                          <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-full">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span className="text-[10px] font-bold text-orange-600">{habit.streak} dias</span>
                          </div>
                        )}
                      </div>

                      {/* 7-day mini calendar */}
                      <div className="flex items-center gap-1 mt-3">
                        {last7Days.map(({ date, label, dow }) => {
                          const done = habit.completedDates.includes(date);
                          const scheduled = habit.targetDays.includes(dow);
                          const isDateToday = date === today;
                          return (
                            <div key={date} className="flex flex-col items-center gap-1">
                              <span className="text-[9px] text-slate-400 capitalize">{label}</span>
                              <div className={cn("w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
                                done
                                  ? "bg-emerald-500 border-emerald-500"
                                  : scheduled && isDateToday
                                  ? "border-rose-400 bg-rose-50"
                                  : scheduled
                                  ? "border-slate-200 bg-white"
                                  : "border-transparent")}>
                                {done && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* md:opacity-0 → oculto no desktop até hover; sempre visível no mobile */}
                    <div className="flex gap-0.5 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingHabit(habit); setShowForm(true); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingHabitId(habit.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <HabitFormDialog key={editingHabit?.id ?? "new"} open={showForm}
        onClose={() => { setShowForm(false); setEditingHabit(undefined); }}
        editHabit={editingHabit} />

      <ConfirmDialog
        open={deletingHabitId !== null}
        title="Excluir hábito"
        description={`Tem certeza que deseja excluir "${habits.find(h => h.id === deletingHabitId)?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => {
          if (deletingHabitId) { deleteHabit(deletingHabitId); toast.success("Hábito excluído."); }
          setDeletingHabitId(null);
        }}
        onCancel={() => setDeletingHabitId(null)}
      />
    </div>
  );
}
