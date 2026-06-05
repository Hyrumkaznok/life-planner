"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useCategories, useCategoryMap } from "@/lib/useCategories";
import { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle2, Circle, AlertCircle, Trash2, Pencil, Filter, ClipboardList } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dot: string; badge: string }> = {
  high:   { label: "Alta",  dot: "bg-red-500",   badge: "text-red-600 bg-red-50 border border-red-100" },
  medium: { label: "Média", dot: "bg-amber-400",  badge: "text-amber-600 bg-amber-50 border border-amber-100" },
  low:    { label: "Baixa", dot: "bg-emerald-400",badge: "text-emerald-600 bg-emerald-50 border border-emerald-100" },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ReactNode }> = {
  pending:     { label: "Pendente",     icon: <Circle className="w-4 h-4 text-slate-300" /> },
  in_progress: { label: "Em andamento", icon: <AlertCircle className="w-4 h-4 text-amber-400" /> },
  completed:   { label: "Concluída",    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
};

function TaskFormDialog({ open, onClose, editTask }: { open: boolean; onClose: () => void; editTask?: Task }) {
  const { addTask, updateTask } = useAppStore();
  const allCategories = useCategories();
  const [title, setTitle] = useState(editTask?.title ?? "");
  const [description, setDescription] = useState(editTask?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(editTask?.priority ?? "medium");
  const [status, setStatus] = useState<TaskStatus>(editTask?.status ?? "pending");
  const [categoryId, setCategoryId] = useState(editTask?.categoryId ?? "trabalho");
  const [dueDate, setDueDate] = useState(editTask?.dueDate ?? "");

  const handleSave = () => {
    if (!title.trim()) { toast.error("Informe o título da tarefa."); return; }
    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority, status,
      categoryId: categoryId as Task["categoryId"],
      dueDate: dueDate || undefined,
    };
    if (editTask) { updateTask(editTask.id, data); toast.success("Tarefa atualizada!"); }
    else          { addTask(data); toast.success("Tarefa criada!"); }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-800">{editTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Título *</Label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Descrição da tarefa"
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 bg-slate-50/50" />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v as Task["categoryId"])}>
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
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v as TaskStatus)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Prazo</Label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 bg-slate-50/50" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais..." rows={3} className="mt-1 resize-none bg-slate-50/50" />
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

interface TaskCardProps {
  task: Task; today: string; categoryMap: ReturnType<typeof useCategoryMap>;
  onToggle: (t: Task) => void; onEdit: (t: Task) => void; onDelete: (id: string) => void;
}

function TaskCard({ task, today, categoryMap, onToggle, onEdit, onDelete }: TaskCardProps) {
  const cat = categoryMap[task.categoryId] ?? { name: "—", color: "#94A3B8" };
  const p = PRIORITY_CONFIG[task.priority];
  const s = STATUS_CONFIG[task.status];
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== "completed";

  return (
    <div className={cn(
      "group bg-white rounded-2xl border border-slate-100 p-4 card-shadow card-shadow-hover transition-all duration-200",
      task.status === "completed" && "opacity-55"
    )}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggle(task)} className="mt-0.5 shrink-0 transition-transform hover:scale-110">
          {s.icon}
        </button>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold text-slate-800",
            task.status === "completed" && "line-through text-slate-400")}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ color: cat.color, backgroundColor: `${cat.color}15` }}>
              {cat.name}
            </span>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", p.badge)}>
              {p.label}
            </span>
            {task.dueDate && (
              <span className={cn("text-[10px] font-medium",
                isOverdue ? "text-red-500" : "text-slate-400")}>
                {isOverdue ? "⚠ Atrasada · " : ""}
                {format(parseISO(task.dueDate), "d/MM/yyyy")}
              </span>
            )}
          </div>
        </div>
        {/* md:opacity-0 → oculto no desktop até hover; sempre visível no mobile */}
        <div className="flex gap-0.5 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface TaskGroupProps {
  title: string; items: Task[]; color: string; today: string; categoryMap: ReturnType<typeof useCategoryMap>;
  onToggle: (t: Task) => void; onEdit: (t: Task) => void; onDelete: (id: string) => void;
}

function TaskGroup({ title, items, color, today, categoryMap, onToggle, onEdit, onDelete }: TaskGroupProps) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((task) => (
          <TaskCard key={task.id} task={task} today={today} categoryMap={categoryMap}
            onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

export default function TarefasPage() {
  const { tasks, updateTask, deleteTask } = useAppStore();
  const CATEGORY_MAP = useCategoryMap();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "todos">("todos");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "todos">("todos");

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "todos" && t.status !== filterStatus) return false;
    if (filterPriority !== "todos" && t.priority !== filterPriority) return false;
    return true;
  });

  const grouped = {
    high:      filtered.filter((t) => t.priority === "high"   && t.status !== "completed"),
    medium:    filtered.filter((t) => t.priority === "medium" && t.status !== "completed"),
    low:       filtered.filter((t) => t.priority === "low"    && t.status !== "completed"),
    completed: filtered.filter((t) => t.status === "completed"),
  };

  const today = format(new Date(), "yyyy-MM-dd");

  const handleToggle = (task: Task) => {
    const next: TaskStatus =
      task.status === "pending" ? "in_progress" : task.status === "in_progress" ? "completed" : "pending";
    updateTask(task.id, { status: next });
  };

  const handleEdit = (task: Task) => { setEditingTask(task); setShowForm(true); };
  const handleDelete = (id: string) => { setDeletingTaskId(id); };
  const confirmDelete = () => {
    if (deletingTaskId) { deleteTask(deletingTaskId); toast.success("Tarefa excluída."); }
    setDeletingTaskId(null);
  };

  const shared = { today, categoryMap: CATEGORY_MAP, onToggle: handleToggle, onEdit: handleEdit, onDelete: handleDelete };

  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="min-h-full">
      <PageHeader title="Tarefas" subtitle="Gerencie e acompanhe suas tarefas">
        <Button onClick={() => { setEditingTask(undefined); setShowForm(true); }}
          className="bg-zinc-900 hover:bg-zinc-800 text-white border-0 shadow-sm"
          size="sm">
          <Plus className="w-4 h-4 mr-1" /> Nova Tarefa
        </Button>
      </PageHeader>

      {/* Stats + Filtros — responsivo */}
      <div className="bg-white dark:bg-[#18181B] border-b border-slate-100 dark:border-[var(--border)]">
        {/* Stats scroll horizontal no mobile */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none px-4 sm:px-7 py-3">
          {[
            { label: "Total",        value: tasks.length,                                          color: "text-slate-700 dark:text-slate-300" },
            { label: "Pendentes",    value: tasks.filter((t) => t.status === "pending").length,     color: "text-amber-600" },
            { label: "Andamento",    value: tasks.filter((t) => t.status === "in_progress").length, color: "text-blue-600" },
            { label: "Concluídas",   value: completedCount,                                        color: "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-1.5 shrink-0">
              <span className={cn("text-base sm:text-lg font-bold", color)}>{value}</span>
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
        {/* Filtros numa linha própria */}
        <div className="flex items-center gap-2 px-4 sm:px-7 pb-3">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v as typeof filterStatus)}>
            <SelectTrigger className="h-7 flex-1 sm:flex-none sm:w-36 text-xs border-slate-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={(v) => v && setFilterPriority(v as typeof filterPriority)}>
            <SelectTrigger className="h-7 flex-1 sm:flex-none sm:w-36 text-xs border-slate-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as prio.</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4 sm:p-7 space-y-6 sm:space-y-8">
        <TaskGroup title="Alta Prioridade" items={grouped.high} color="#EF4444" {...shared} />
        <TaskGroup title="Média Prioridade" items={grouped.medium} color="#F59E0B" {...shared} />
        <TaskGroup title="Baixa Prioridade" items={grouped.low} color="#22C55E" {...shared} />
        <TaskGroup title="Concluídas" items={grouped.completed} color="#94A3B8" {...shared} />

        {filtered.length === 0 && (
          <div className="text-center py-24 text-slate-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">Nenhuma tarefa encontrada</p>
            <p className="text-xs mt-1">Ajuste os filtros ou crie uma nova tarefa</p>
          </div>
        )}
      </div>

      <TaskFormDialog key={editingTask?.id ?? "new"} open={showForm}
        onClose={() => { setShowForm(false); setEditingTask(undefined); }}
        editTask={editingTask} />

      <ConfirmDialog
        open={deletingTaskId !== null}
        title="Excluir tarefa"
        description={`Tem certeza que deseja excluir "${tasks.find(t => t.id === deletingTaskId)?.title}"? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingTaskId(null)}
      />
    </div>
  );
}
