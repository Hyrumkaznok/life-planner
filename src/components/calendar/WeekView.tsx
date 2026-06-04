"use client";

import { useState, useRef, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { useCategoryMap } from "@/lib/useCategories";
import { Event } from "@/lib/types";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, parseISO, addWeeks, subWeeks, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, CheckSquare, Target } from "lucide-react";
import { toast } from "sonner";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 56;

function minsToTime(mins: number) {
  const c = Math.max(0, Math.min(1439, mins));
  return `${Math.floor(c / 60).toString().padStart(2, "0")}:${(c % 60).toString().padStart(2, "0")}`;
}
function timeToMins(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

function SlotMenu({ x, y, date, time, onCreateEvent, onCreateTask, onCreateHabit, onClose }: {
  x: number; y: number; date: string; time: string;
  onCreateEvent: (d: string, t: string) => void; onCreateTask: () => void; onCreateHabit: () => void; onClose: () => void;
}) {
  const label = format(parseISO(date), "d 'de' MMMM", { locale: ptBR });
  const items = [
    { label: "Novo Evento", Icon: Calendar,    action: () => onCreateEvent(date, time) },
    { label: "Nova Tarefa",  Icon: CheckSquare, action: onCreateTask },
    { label: "Novo Hábito",  Icon: Target,      action: onCreateHabit },
  ];
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed z-50 bg-[var(--card)] dark:bg-[#27272A] rounded-2xl shadow-float border border-[var(--border)] p-1.5 w-52 animate-in fade-in zoom-in-95 duration-150"
        style={{ left: Math.min(x, window.innerWidth - 220), top: Math.min(y, window.innerHeight - 180) }}>
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-widest px-2 py-1.5">{label} · {time}</p>
        {items.map(({ label: l, Icon, action }) => (
          <button key={l} onClick={() => { action(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[var(--secondary)] dark:hover:bg-[#3F3F46] transition-colors text-left">
            <div className="w-7 h-7 bg-[var(--secondary)] dark:bg-[#3F3F46] rounded-xl flex items-center justify-center">
              <Icon size={13} className="text-[var(--muted-foreground)]" strokeWidth={1.75} />
            </div>
            <p className="text-[12px] font-medium text-[var(--foreground)]">{l}</p>
          </button>
        ))}
      </div>
    </>
  );
}

interface WeekViewProps {
  onEventClick: (e: Event) => void;
  onCreateEvent: (d: string, t: string) => void;
  onCreateTask: () => void;
  onCreateHabit: () => void;
}

export function WeekView({ onEventClick, onCreateEvent, onCreateTask, onCreateHabit }: WeekViewProps) {
  const { events, selectedDate, setSelectedDate, updateEvent } = useAppStore();
  const CATEGORY_MAP = useCategoryMap();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 }));
  const [slotMenu, setSlotMenu] = useState<{ x: number; y: number; date: string; time: string } | null>(null);
  const [drag, setDrag]         = useState<{ eventId: string; durationMins: number; grabOffsetMins: number } | null>(null);
  const [preview, setPreview]   = useState<{ date: string; startMins: number } | null>(null);
  const columnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const days        = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });
  const eventsForDay = (day: Date) => events.filter((e) => e.date === format(day, "yyyy-MM-dd")).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const getTop      = (e: Event) => (timeToMins(e.startTime) / 60) * HOUR_HEIGHT;
  const getHeight   = (e: Event) => Math.max(((timeToMins(e.endTime) - timeToMins(e.startTime)) / 60) * HOUR_HEIGHT, 28);

  const handleDragStart = useCallback((e: React.DragEvent, event: Event) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDrag({ eventId: event.id, durationMins: timeToMins(event.endTime) - timeToMins(event.startTime), grabOffsetMins: Math.round(((e.clientY - rect.top) / HOUR_HEIGHT) * 60) });
    e.dataTransfer.effectAllowed = "move";
    requestAnimationFrame(() => { (e.currentTarget as HTMLElement).style.opacity = "0.3"; });
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    setDrag(null); setPreview(null);
  }, []);

  const handleColumnDragOver = useCallback((e: React.DragEvent, date: string) => {
    e.preventDefault();
    if (!drag) return;
    const col = columnRefs.current.get(date);
    if (!col) return;
    const snapped = Math.round(((((e.clientY - col.getBoundingClientRect().top) / HOUR_HEIGHT) * 60) - drag.grabOffsetMins) / 15) * 15;
    setPreview({ date, startMins: Math.max(0, Math.min(23 * 60, snapped)) });
  }, [drag]);

  const handleColumnDrop = useCallback((e: React.DragEvent, dropDate: string) => {
    e.preventDefault();
    if (!drag || !preview) return;
    const event = events.find((ev) => ev.id === drag.eventId);
    if (!event) return;
    updateEvent(event.id, { date: dropDate, startTime: minsToTime(preview.startMins), endTime: minsToTime(Math.min(1439, preview.startMins + drag.durationMins)) });
    toast.success("Evento movido!");
    setDrag(null); setPreview(null);
  }, [drag, preview, events, updateEvent]);

  return (
    <div className="flex flex-col h-full bg-[var(--card)] dark:bg-[#18181B]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={() => setWeekStart(subWeeks(weekStart, 1))} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--secondary)] dark:hover:bg-[#3F3F46] transition-colors text-[var(--muted-foreground)]"><ChevronLeft size={15} strokeWidth={2} /></button>
          <span className="text-[13px] font-semibold text-[var(--foreground)] min-w-48 text-center">{format(weekStart, "d MMM", { locale: ptBR })} – {format(endOfWeek(weekStart, { weekStartsOn: 1 }), "d MMM yyyy", { locale: ptBR })}</span>
          <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--secondary)] dark:hover:bg-[#3F3F46] transition-colors text-[var(--muted-foreground)]"><ChevronRight size={15} strokeWidth={2} /></button>
        </div>
        <button onClick={() => { const t = new Date(); setWeekStart(startOfWeek(t, { weekStartsOn: 1 })); setSelectedDate(format(t, "yyyy-MM-dd")); }}
          className="text-[12px] font-medium text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 px-3 py-1.5 rounded-xl transition-colors">Hoje</button>
      </div>

      <div className="flex shrink-0 border-b border-[var(--border)]">
        <div className="w-14 shrink-0" />
        {days.map((day) => {
          const tf = isToday(day);
          return (
            <div key={day.toISOString()} className="flex-1 text-center py-3 cursor-pointer hover:bg-[var(--secondary)] dark:hover:bg-[#3F3F46]/30 transition-colors" onClick={() => setSelectedDate(format(day, "yyyy-MM-dd"))}>
              <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-widest">{format(day, "EEE", { locale: ptBR })}</p>
              <div className={`mx-auto mt-1.5 w-7 h-7 flex items-center justify-center rounded-full text-[13px] font-semibold ${tf ? "bg-indigo-500 text-white" : "text-[var(--foreground)]"}`}>{format(day, "d")}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-1 overflow-y-auto">
        <div className="w-14 shrink-0 border-r border-[var(--border)]">
          {HOURS.map((h) => (
            <div key={h} className="h-14 flex items-start justify-end pr-3 pt-1.5">
              <span className="text-[10px] text-[var(--muted-foreground)] font-medium tabular-nums">{h.toString().padStart(2, "0")}:00</span>
            </div>
          ))}
        </div>
        {days.map((day) => {
          const dateStr   = format(day, "yyyy-MM-dd");
          const dayEvents = eventsForDay(day);
          const isDropTarget = preview?.date === dateStr;
          return (
            <div key={day.toISOString()}
              className={`flex-1 relative border-r border-[var(--border)] last:border-r-0 ${isDropTarget && drag ? "bg-indigo-50/30 dark:bg-indigo-950/10" : ""}`}
              ref={(el) => { if (el) columnRefs.current.set(dateStr, el); }}
              onDragOver={(e) => handleColumnDragOver(e, dateStr)}
              onDrop={(e) => handleColumnDrop(e, dateStr)}>
              {HOURS.map((hour) => (
                <div key={hour} className="h-14 border-b border-[var(--border)]/40 hover:bg-[var(--secondary)]/40 dark:hover:bg-[#3F3F46]/20 cursor-pointer transition-colors duration-100"
                  onClick={(e) => { if (!drag) { const t = `${hour.toString().padStart(2, "0")}:00`; setSelectedDate(dateStr); setSlotMenu({ x: e.clientX, y: e.clientY, date: dateStr, time: t }); }}} />
              ))}
              {dayEvents.map((event) => {
                const cat = CATEGORY_MAP[event.categoryId];
                if (!cat) return null;
                const isDragging = drag?.eventId === event.id;
                return (
                  <div key={event.id} draggable onDragStart={(e) => handleDragStart(e, event)} onDragEnd={handleDragEnd}
                    className="absolute left-1 right-1 rounded-xl px-2 py-1.5 overflow-hidden select-none cursor-grab active:cursor-grabbing"
                    style={{ top: `${getTop(event)}px`, height: `${getHeight(event)}px`, backgroundColor: `${cat.color}12`, borderLeft: `2.5px solid ${cat.color}`, opacity: isDragging ? 0.3 : 1, transition: "background-color 0.15s, opacity 0.15s" }}
                    onMouseEnter={(e) => { if (!isDragging) (e.currentTarget as HTMLElement).style.backgroundColor = `${cat.color}22`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = `${cat.color}12`; }}
                    onClick={(e) => { e.stopPropagation(); if (!isDragging) onEventClick(event); }}>
                    <p className="text-[11px] font-semibold truncate leading-tight" style={{ color: cat.color }}>{event.title}</p>
                    {getHeight(event) >= 42 && <p className="text-[10px] mt-0.5 truncate" style={{ color: cat.color, opacity: 0.6 }}>{event.startTime} – {event.endTime}</p>}
                  </div>
                );
              })}
              {isDropTarget && drag && preview && (() => {
                const ev = events.find((e) => e.id === drag.eventId);
                const cat = ev ? CATEGORY_MAP[ev.categoryId] : null;
                if (!ev || !cat) return null;
                return (
                  <div className="absolute left-1 right-1 rounded-xl px-2 py-1.5 pointer-events-none z-20 border-2 border-dashed"
                    style={{ top: `${(preview.startMins / 60) * HOUR_HEIGHT}px`, height: `${Math.max((drag.durationMins / 60) * HOUR_HEIGHT, 28)}px`, backgroundColor: `${cat.color}20`, borderColor: cat.color }}>
                    <p className="text-[11px] font-semibold" style={{ color: cat.color }}>{ev.title}</p>
                    <p className="text-[10px]" style={{ color: cat.color, opacity: 0.7 }}>{minsToTime(preview.startMins)} – {minsToTime(preview.startMins + drag.durationMins)}</p>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
      {slotMenu && <SlotMenu {...slotMenu} onCreateEvent={onCreateEvent} onCreateTask={onCreateTask} onCreateHabit={onCreateHabit} onClose={() => setSlotMenu(null)} />}
    </div>
  );
}
