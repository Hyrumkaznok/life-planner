"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useCategories } from "@/lib/useCategories";
import { PageHeader } from "@/components/layout/PageHeader";
import { WeekView } from "@/components/calendar/WeekView";
import { DayView } from "@/components/calendar/DayView";
import { MonthView } from "@/components/calendar/MonthView";
import { EventForm } from "@/components/events/EventForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Event, Task, TaskPriority, Habit } from "@/lib/types";
import { toast } from "sonner";

const WEEK_DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function QuickTaskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTask } = useAppStore();
  const allCategories = useCategories();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [categoryId, setCategoryId] = useState("work");

  const handleSave = () => {
    if (!title.trim()) { toast.error("Informe o título."); return; }
    addTask({ title: title.trim(), priority, status: "pending", categoryId: categoryId as Task["categoryId"] });
    toast.success("Tarefa criada!");
    setTitle(""); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label>Título *</Label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="O que precisa ser feito?"
              className="mt-1 w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => v && setPriority(v as TaskPriority)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-zinc-900 hover:bg-zinc-800 text-white">Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuickHabitDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addHabit } = useAppStore();
  const allCategories = useCategories();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("health");
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const toggleDay = (d: number) =>
    setTargetDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort());

  const handleSave = () => {
    if (!name.trim()) { toast.error("Informe o nome."); return; }
    if (targetDays.length === 0) { toast.error("Selecione ao menos um dia."); return; }
    addHabit({ name: name.trim(), categoryId: categoryId as Habit["categoryId"], frequency: "daily", targetDays });
    toast.success("Hábito criado!");
    setName(""); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Novo Hábito</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label>Nome *</Label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Meditação, Leitura..."
              className="mt-1 w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700"
            />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {allCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Dias</Label>
            <div className="flex gap-1.5 flex-wrap">
              {WEEK_DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`w-9 h-9 rounded-full text-xs font-medium border transition-colors ${
                    targetDays.includes(i)
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-white text-[var(--foreground)] border-[var(--border)] hover:border-zinc-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-zinc-900 hover:bg-zinc-800 text-white">Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CalendarioPage() {
  const { calendarView, setCalendarView, selectedDate } = useAppStore();
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  // Armazena data/hora clicada para pré-preencher o formulário
  const [newEventDate, setNewEventDate] = useState<string | undefined>();
  const [newEventTime, setNewEventTime] = useState<string | undefined>();
  const [newEventKey, setNewEventKey] = useState(0);

  const handleEventClick = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleCreateEvent = (date?: string, time?: string) => {
    setEditingEvent(undefined);
    setNewEventDate(date ?? selectedDate);
    setNewEventTime(time);
    setNewEventKey((k) => k + 1);
    setShowEventForm(true);
  };

  const sharedProps = {
    onEventClick: handleEventClick,
    onCreateEvent: handleCreateEvent,
    onCreateTask: () => setShowTaskForm(true),
    onCreateHabit: () => setShowHabitForm(true),
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <PageHeader title="Calendário" subtitle="Clique em um horário para adicionar evento, tarefa ou hábito">
        <Tabs value={calendarView} onValueChange={(v) => setCalendarView(v as typeof calendarView)}>
          <TabsList className="h-8">
            <TabsTrigger value="day" className="text-xs px-3">Dia</TabsTrigger>
            <TabsTrigger value="week" className="text-xs px-3">Semana</TabsTrigger>
            <TabsTrigger value="month" className="text-xs px-3">Mês</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          onClick={() => handleCreateEvent()}
          className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm border-0"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Novo Evento
        </Button>
      </PageHeader>

      <div className="flex-1 overflow-hidden">
        {calendarView === "day" && <DayView {...sharedProps} />}
        {calendarView === "week" && <WeekView {...sharedProps} />}
        {calendarView === "month" && <MonthView onEventClick={handleEventClick} />}
      </div>

      <EventForm
        key={editingEvent?.id ?? `new-${newEventKey}`}
        open={showEventForm}
        onClose={() => { setShowEventForm(false); setEditingEvent(undefined); }}
        initialDate={newEventDate ?? selectedDate}
        initialTime={newEventTime}
        editEvent={editingEvent}
      />
      <QuickTaskDialog open={showTaskForm} onClose={() => setShowTaskForm(false)} />
      <QuickHabitDialog open={showHabitForm} onClose={() => setShowHabitForm(false)} />
    </div>
  );
}
