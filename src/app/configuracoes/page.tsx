"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/constants";
import { PageHeader } from "@/components/layout/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Calendar, Tag, Sparkles, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COLOR_PALETTE = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
  "#14B8A6", "#F43F5E", "#84CC16", "#6366F1",
  "#D946EF", "#0EA5E9", "#10B981", "#A855F7",
];

function CategoryManager() {
  const { customCategories, addCustomCategory, deleteCustomCategory } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_PALETTE[0]);

  const handleAdd = () => {
    if (!name.trim()) { toast.error("Informe o nome da categoria."); return; }
    addCustomCategory({ name: name.trim(), color });
    toast.success("Categoria criada!");
    setName("");
    setColor(COLOR_PALETTE[0]);
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Built-in categories */}
      <div>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Categorias padrão ({CATEGORIES.length})
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Custom categories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Personalizadas ({customCategories.length})
          </p>
          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Nova categoria
            </button>
          )}
        </div>

        {/* Create form */}
        {adding && (
          <div className="border border-rose-200 dark:border-rose-800 rounded-2xl p-4 mb-3 bg-rose-50/30 dark:bg-rose-900/10 space-y-3">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Nova categoria</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da categoria"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-300"
            />
            {/* Color grid */}
            <div>
              <p className="text-[10px] text-slate-400 mb-1.5">Escolha uma cor</p>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-7 h-7 rounded-lg transition-all border-2",
                      color === c
                        ? "border-slate-800 dark:border-white scale-110 shadow-md"
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3 h-3 text-white mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-fit" style={{ backgroundColor: `${color}18` }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs font-semibold" style={{ color }}>{name || "Prévia"}</span>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm" className="bg-gradient-to-r bg-indigo-500 text-white border-0 text-xs">
                Criar categoria
              </Button>
              <Button onClick={() => { setAdding(false); setName(""); }} variant="outline" size="sm" className="text-xs">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {customCategories.length === 0 && !adding ? (
          <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            <Tag className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500">Nenhuma categoria personalizada ainda</p>
            <button onClick={() => setAdding(true)} className="mt-2 text-xs text-rose-500 hover:text-rose-600 font-semibold">
              Criar minha primeira categoria
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {customCategories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 group">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1 truncate">{cat.name}</span>
                <span className="text-[9px] text-slate-400 bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded-full">Personalizada</span>
                <button
                  onClick={() => { deleteCustomCategory(cat.id); toast.success("Categoria removida."); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfiguracoesPage() {
  const { settings, updateSettings } = useAppStore();

  return (
    <div className="min-h-full">
      <PageHeader title="Configurações" subtitle="Personalize sua experiência" />

      <div className="p-7 max-w-2xl space-y-5">
        {/* Aparência */}
        <Section icon={<Sun className="w-4 h-4 text-amber-500" />} title="Aparência">
          <Row label="Tema escuro" description="Alterna entre tema claro e escuro"
            action={
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <Switch checked={settings.theme === "dark"} onCheckedChange={(v) => updateSettings({ theme: v ? "dark" : "light" })} />
                <Moon className="w-3.5 h-3.5 text-violet-400" />
              </div>
            }
          />
          <Separator className="my-2 opacity-50" />
          <Row label="Semana começa na segunda" description="Padrão brasileiro de calendário"
            action={<Switch checked={settings.weekStartsOnMonday} onCheckedChange={(v) => updateSettings({ weekStartsOnMonday: v })} />}
          />
          <Separator className="my-2 opacity-50" />
          <Row label="Vista padrão do calendário" description="Como o calendário abre por padrão"
            action={
              <Select value={settings.defaultView} onValueChange={(v) => v && updateSettings({ defaultView: v as typeof settings.defaultView })}>
                <SelectTrigger className="w-28 h-8 text-xs border-slate-200 dark:border-slate-600"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </Section>

        {/* Categorias */}
        <Section icon={<Tag className="w-4 h-4 text-violet-500" />} title="Categorias">
          <CategoryManager />
        </Section>

        {/* Sobre */}
        <Section icon={<Sparkles className="w-4 h-4 text-rose-500" />} title="Sobre o App">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br bg-indigo-500 flex items-center justify-center shadow-lg shadow-rose-200">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Life Planner</p>
              <p className="text-xs text-slate-400">Versão 1.0.0 MVP</p>
            </div>
          </div>
          <Separator className="mb-4 opacity-50" />
          <div className="space-y-2.5">
            {[
              ["Framework", "Next.js 15 + TypeScript"],
              ["Interface", "Tailwind CSS + shadcn/ui"],
              ["Ícones", "Lucide React"],
              ["Estado", "React Context (sem banco de dados)"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">{k}</span>
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{v}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl card-shadow overflow-hidden border border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        {icon}
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Row({ label, description, action }: { label: string; description: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
      </div>
      {action}
    </div>
  );
}
