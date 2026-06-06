"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { DiaryMood } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const MOODS: { id: DiaryMood; emoji: string; label: string; color: string }[] = [
  { id: "otimo",   emoji: "😄", label: "Ótimo",   color: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400" },
  { id: "bem",     emoji: "🙂", label: "Bem",     color: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400" },
  { id: "neutro",  emoji: "😐", label: "Neutro",  color: "bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/30 text-slate-600 dark:text-slate-400" },
  { id: "mal",     emoji: "😔", label: "Mal",     color: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400" },
  { id: "pessimo", emoji: "😢", label: "Péssimo", color: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400" },
];

const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.id, m]));

function formatEntryDate(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  return format(d, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export default function DiarioPage() {
  const { diaryEntries, saveDiaryEntry, deleteDiaryEntry } = useAppStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntry = diaryEntries.find((e) => e.date === today);

  const [mood, setMood] = useState<DiaryMood>(todayEntry?.mood ?? "bem");
  const [content, setContent] = useState(todayEntry?.content ?? "");
  const [saved, setSaved] = useState(false);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync se a entrada de hoje mudar externamente
  useEffect(() => {
    setMood(todayEntry?.mood ?? "bem");
    setContent(todayEntry?.content ?? "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  // Auto-save com debounce
  useEffect(() => {
    if (!content.trim() && !todayEntry) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaved(false);
    saveTimer.current = setTimeout(() => {
      if (content.trim() || todayEntry) {
        saveDiaryEntry(today, mood, content);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, mood]);

  const pastEntries = diaryEntries
    .filter((e) => e.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleDelete = (date: string) => setDeletingDate(date);
  const confirmDelete = () => {
    if (deletingDate) {
      deleteDiaryEntry(deletingDate);
      toast.success("Entrada excluída.");
    }
    setDeletingDate(null);
  };

  return (
    <div className="min-h-full">
      <PageHeader title="Diário" subtitle="Seus pensamentos e sentimentos do dia">
        <span className={cn(
          "text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-300",
          saved ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-transparent"
        )}>
          Salvo
        </span>
      </PageHeader>

      <div className="p-4 sm:p-7 max-w-2xl mx-auto space-y-8">

        {/* Entrada de hoje */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
          </div>

          {/* Mood picker */}
          <div className="flex gap-2 flex-wrap">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                  mood === m.id
                    ? m.color + " shadow-sm scale-105"
                    : "border-slate-200 dark:border-[var(--border)] text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                <span className="text-base leading-none">{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Como foi o seu dia? Escreva livremente..."
              rows={8}
              className="w-full bg-white dark:bg-[var(--card)] border border-slate-200 dark:border-[var(--border)] rounded-2xl px-4 py-3.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400/40 dark:focus:ring-violet-500/30 resize-none leading-relaxed transition-colors"
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-slate-300 dark:text-slate-600 select-none">
              {content.length} chars
            </div>
          </div>
        </div>

        {/* Entradas anteriores */}
        {pastEntries.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Entradas anteriores
              </h2>
              <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                {pastEntries.length}
              </span>
            </div>

            <div className="space-y-2">
              {pastEntries.map((entry) => {
                const m = MOOD_MAP[entry.mood];
                return (
                  <div
                    key={entry.date}
                    className="group bg-white dark:bg-[var(--card)] border border-slate-100 dark:border-[var(--border)] rounded-2xl p-4 card-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl leading-none mt-0.5 shrink-0">{m?.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                            {formatEntryDate(entry.date)}
                          </span>
                          {m && (
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border", m.color)}>
                              {m.label}
                            </span>
                          )}
                        </div>
                        {entry.content ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                            {entry.content}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-300 dark:text-slate-600 italic">Sem texto registrado</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(entry.date)}
                        className="shrink-0 p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors md:opacity-0 md:group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Estado vazio (sem entradas anteriores e sem conteúdo hoje) */}
        {pastEntries.length === 0 && !todayEntry && (
          <div className="text-center py-12 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">Comece a escrever acima</p>
            <p className="text-xs mt-1">Suas entradas aparecem aqui</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deletingDate !== null}
        title="Excluir entrada"
        description="Tem certeza que deseja excluir esta entrada do diário? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setDeletingDate(null)}
      />
    </div>
  );
}
