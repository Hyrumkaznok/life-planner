"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import { useCategories } from "@/lib/useCategories";
import { Event, RecurrenceType } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
  editEvent?: Event;
}

function addOneHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + 60;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${nh.toString().padStart(2, "0")}:${nm.toString().padStart(2, "0")}`;
}

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: "none", label: "Não se repete" },
  { value: "daily", label: "Diariamente" },
  { value: "weekly", label: "Semanalmente" },
  { value: "monthly", label: "Mensalmente" },
];

export function EventForm({ open, onClose, initialDate, initialTime, editEvent }: EventFormProps) {
  const { addEvent, updateEvent, deleteEvent } = useAppStore();
  const allCategories = useCategories();

  const defaultStart = editEvent?.startTime ?? initialTime ?? "09:00";
  const defaultEnd   = editEvent?.endTime   ?? (initialTime ? addOneHour(initialTime) : "10:00");

  const [title, setTitle]           = useState(editEvent?.title ?? "");
  const [categoryId, setCategoryId] = useState(editEvent?.categoryId ?? "work");
  const [date, setDate]             = useState(editEvent?.date ?? initialDate ?? "");
  const [startTime, setStartTime]   = useState(defaultStart);
  const [endTime, setEndTime]       = useState(defaultEnd);
  const [description, setDescription] = useState(editEvent?.description ?? "");
  const [location, setLocation]     = useState(editEvent?.location ?? "");
  const [recurrence, setRecurrence] = useState<RecurrenceType>(editEvent?.recurrence ?? "none");
  const [confirmed, setConfirmed]   = useState(editEvent?.confirmed ?? true);
  const [completed, setCompleted]   = useState(editEvent?.completed ?? false);

  // When start changes, push end forward if needed
  const handleStartChange = (t: string) => {
    setStartTime(t);
    const [sh, sm] = t.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (sh * 60 + sm >= eh * 60 + em) {
      const newEnd = sh * 60 + sm + 15;
      const h = Math.floor(newEnd / 60) % 24;
      const m = newEnd % 60;
      setEndTime(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !date) {
      toast.error("Preencha o título e a data do evento.");
      return;
    }
    const data = {
      title: title.trim(),
      categoryId: categoryId as Event["categoryId"],
      date,
      startTime,
      endTime,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      recurrence,
      confirmed,
      completed,
    };
    if (editEvent) {
      updateEvent(editEvent.id, data);
      toast.success("Evento atualizado com sucesso!");
    } else {
      addEvent(data);
      toast.success("Evento criado com sucesso!");
    }
    onClose();
  };

  const handleDelete = () => {
    if (editEvent) {
      deleteEvent(editEvent.id);
      toast.success("Evento excluído.");
      onClose();
    }
  };

  const cat = allCategories.find((c) => c.id === categoryId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-800">
            {editEvent ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Título */}
          <div>
            <Label htmlFor="title" className="text-xs font-semibold text-slate-500">Título *</Label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do evento"
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-700 bg-slate-50/50 placeholder:text-slate-300"
            />
          </div>

          {/* Categoria */}
          <div>
            <Label className="text-xs font-semibold text-slate-500">Categoria</Label>
            <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v as Event["categoryId"])}>
              <SelectTrigger className="mt-1 bg-slate-50/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cor da categoria selecionada (visual feedback) */}
          {cat && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
              style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              Categoria: {cat.name}
            </div>
          )}

          {/* Data */}
          <div>
            <Label htmlFor="date" className="text-xs font-semibold text-slate-500">Data *</Label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-700 bg-slate-50/50"
            />
          </div>

          {/* Horários — TimePicker premium */}
          <div>
            <Label className="text-xs font-semibold text-slate-500">Horário</Label>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <TimePicker
                label="Início"
                value={startTime}
                onChange={handleStartChange}
              />
              <TimePicker
                label="Fim"
                value={endTime}
                onChange={setEndTime}
                minTime={startTime}
              />
            </div>
            {/* Duration chip */}
            {(() => {
              const [sh, sm] = startTime.split(":").map(Number);
              const [eh, em] = endTime.split(":").map(Number);
              const diff = (eh * 60 + em) - (sh * 60 + sm);
              if (diff <= 0) return null;
              const h = Math.floor(diff / 60);
              const m = diff % 60;
              const label = h > 0 && m > 0 ? `${h}h ${m}min` : h > 0 ? `${h}h` : `${m}min`;
              return (
                <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                  Duração: <span className="font-semibold text-slate-600">{label}</span>
                </p>
              );
            })()}
          </div>

          {/* Repetição */}
          <div>
            <Label className="text-xs font-semibold text-slate-500">Repetição</Label>
            <Select value={recurrence} onValueChange={(v) => v && setRecurrence(v as RecurrenceType)}>
              <SelectTrigger className="mt-1 bg-slate-50/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Localização */}
          <div>
            <Label htmlFor="location" className="text-xs font-semibold text-slate-500">Localização</Label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Endereço ou link da reunião"
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 bg-slate-50/50 placeholder:text-slate-300"
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="desc" className="text-xs font-semibold text-slate-500">Descrição</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais..."
              rows={3}
              className="mt-1 resize-none bg-slate-50/50"
            />
          </div>

          {/* Confirmado */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-slate-700">Compromisso confirmado</p>
              <p className="text-xs text-slate-400 mt-0.5">Marque quando o horário estiver definido</p>
            </div>
            <Switch id="confirmed" checked={confirmed} onCheckedChange={setConfirmed} />
          </div>

          {/* Concluído */}
          <div className={`flex items-center justify-between py-2 px-3 rounded-xl transition-colors ${completed ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/40" : "border border-transparent"}`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${completed ? "text-green-500" : "text-slate-300"}`} />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {completed ? "Evento concluído" : "Marcar como concluído"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {completed ? "Contabilizado nas estatísticas semanais" : "Contabiliza nas estatísticas semanais"}
                </p>
              </div>
            </div>
            <Switch id="completed" checked={completed} onCheckedChange={setCompleted} />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          {editEvent && (
            <Button variant="destructive" onClick={handleDelete} className="sm:mr-auto">
              Excluir
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleSave}
            className="bg-zinc-900 hover:bg-zinc-800 text-white border-0"
          >
            {completed ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Salvar concluído</> : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
