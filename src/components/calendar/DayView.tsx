"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useCategoryMap } from "@/lib/useCategories";
import { Event } from "@/lib/types";
import { format, addDays, subDays, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, CheckSquare, Target, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 64;

function minsToTime(mins: number) {
  const clamped = Math.max(0, Math.min(1439, mins));
  return `${Math.floor(clamped / 60).toString().padStart(2, "0")}:${(clamped % 60).toString().padStart(2, "0")}`;
}

function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

interface SlotMenuProps {
  x: number; y: number; date: string; time: string;
  onCreateEvent: (date: string, time: string) => void;
  onCreateTask: () => void; onCreateHabit: () => void; onClose: () => void;
}

function SlotMenu({ x, y, date, time, onCreateEvent, onCreateTask, onCreateHabit, onClose }: SlotMenuProps) {
  const dateLabel = format(parseISO(date), "d 'de' MMMM", { locale: ptBR });
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white rounded-2xl shadow-elevated border border-slate-100 p-2 w-56 animate-in fade-in zoom-in-95 duration-150"
        style={{ left: Math.min(x, window.innerWidth - 230), top: Math.min(y, window.innerHeight - 180) }}
      >
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5">
          {dateLabel} · {time}
        </p>
        <button onClick={() => { onCreateEvent(date, time); onClose(); }}
          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-rose-50 text-left transition-colors">
          <div className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Novo Evento</p>
            <p className="text-[10px] text-slate-400">Adicionar ao calendário</p>
          </div>
        </button>
        <button onClick={() => { onCreateTask(); onClose(); }}
          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-blue-50 text-left transition-colors">
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Nova Tarefa</p>
            <p className="text-[10px] text-slate-400">Criar uma tarefa</p>
          </div>
        </button>
        <button onClick={() => { onCreateHabit(); onClose(); }}
          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-zinc-100 text-left transition-colors">
          <div className="w-7 h-7 bg-zinc-200 rounded-lg flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-zinc-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Novo Hábito</p>
            <p className="text-[10px] text-slate-400">Registrar hábito</p>
          </div>
        </button>
      </div>
    </>
  );
}

interface DayViewProps {
  onEventClick: (event: Event) => void;
  onCreateEvent: (date: string, time: string) => void;
  onCreateTask: () => void;
  onCreateHabit: () => void;
}

interface DragState {
  eventId: string;
  durationMins: number;
  grabOffsetMins: number;
}

export function DayView({ onEventClick, onCreateEvent, onCreateTask, onCreateHabit }: DayViewProps) {
  const { events, selectedDate, setSelectedDate, updateEvent } = useAppStore();
  const CATEGORY_MAP = useCategoryMap();
  const [slotMenu, setSlotMenu] = useState<{ x: number; y: number; date: string; time: string } | null>(null);

  const [drag, setDrag] = useState<DragState | null>(null);
  const [previewMins, setPreviewMins] = useState<number | null>(null);
  const columnRef   = useRef<HTMLDivElement>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);

  // Scroll para 07:00 ao montar
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, []);

  const currentDate = parseISO(selectedDate);
  const dayEvents = events
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const todayFlag = isToday(currentDate);

  const getTop    = (e: Event) => (timeToMins(e.startTime) / 60) * HOUR_HEIGHT;
  const getHeight = (e: Event) => Math.max(((timeToMins(e.endTime) - timeToMins(e.startTime)) / 60) * HOUR_HEIGHT, 32);

  const handleDragStart = useCallback((e: React.DragEvent, event: Event) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const grabOffsetMins = Math.round(((e.clientY - rect.top) / HOUR_HEIGHT) * 60);
    const durationMins = timeToMins(event.endTime) - timeToMins(event.startTime);
    setDrag({ eventId: event.id, durationMins, grabOffsetMins });
    e.dataTransfer.effectAllowed = "move";
    requestAnimationFrame(() => {
      (e.currentTarget as HTMLElement).style.opacity = "0.35";
    });
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    setDrag(null);
    setPreviewMins(null);
  }, []);

  const handleColumnDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!drag || !columnRef.current) return;
    const rect = columnRef.current.getBoundingClientRect();
    const rawMins = ((e.clientY - rect.top) / HOUR_HEIGHT) * 60 - drag.grabOffsetMins;
    const snapped = Math.round(rawMins / 15) * 15;
    setPreviewMins(Math.max(0, Math.min(23 * 60, snapped)));
  }, [drag]);

  const handleColumnDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!drag || previewMins === null) return;
    const event = events.find((ev) => ev.id === drag.eventId);
    if (!event) return;
    updateEvent(event.id, {
      startTime: minsToTime(previewMins),
      endTime: minsToTime(Math.min(1439, previewMins + drag.durationMins)),
    });
    toast.success("Evento movido!");
    setDrag(null);
    setPreviewMins(null);
  }, [drag, previewMins, events, updateEvent]);

  const handleSlotClick = (e: React.MouseEvent, hour: number) => {
    if (drag) return;
    const time = `${hour.toString().padStart(2, "0")}:00`;
    setSlotMenu({ x: e.clientX, y: e.clientY, date: selectedDate, time });
  };

  const draggedEvent = drag ? events.find((ev) => ev.id === drag.eventId) : null;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setSelectedDate(format(subDays(currentDate, 1), "yyyy-MM-dd"))}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center min-w-48">
            <p className="text-sm font-semibold text-slate-700 capitalize">
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            {todayFlag && <p className="text-xs text-rose-500 font-medium">Hoje</p>}
          </div>
          <button onClick={() => setSelectedDate(format(addDays(currentDate, 1), "yyyy-MM-dd"))}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {!todayFlag && (
          <button onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
            className="text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors">
            Hoje
          </button>
        )}
      </div>

      <div className="shrink-0 px-5 py-2 bg-slate-50/60 border-b border-slate-100">
        <p className="text-xs text-slate-400">
          {drag
            ? "Arraste para reposicionar o evento"
            : dayEvents.length === 0
            ? "Nenhum evento — clique em um horário para adicionar"
            : `${dayEvents.length} evento${dayEvents.length !== 1 ? "s" : ""} · arraste para mover · clique no horário para adicionar`}
        </p>
      </div>

      <div className="flex flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="w-16 shrink-0 border-r border-slate-50">
          {HOURS.map((hour) => (
            <div key={hour} className="h-16 flex items-start justify-end pr-2.5 pt-1">
              <span className="text-[10px] text-slate-300 font-medium">{hour.toString().padStart(2, "0")}h</span>
            </div>
          ))}
        </div>

        <div
          className={`flex-1 relative transition-colors ${drag ? "bg-rose-50/20" : ""}`}
          ref={columnRef}
          onDragOver={handleColumnDragOver}
          onDrop={handleColumnDrop}
        >
          {HOURS.map((hour) => (
            <div key={hour}
              className="h-16 border-b border-slate-50 hover:bg-rose-50/20 cursor-pointer transition-colors"
              onClick={(e) => handleSlotClick(e, hour)} />
          ))}

          {dayEvents.map((event) => {
            const cat = CATEGORY_MAP[event.categoryId];
            const isDragging  = drag?.eventId === event.id;
            const isCompleted = !!event.completed;
            return (
              <div
                key={event.id}
                draggable
                onDragStart={(e) => handleDragStart(e, event)}
                onDragEnd={handleDragEnd}
                className="absolute left-3 right-3 rounded-xl px-3 py-2 overflow-hidden select-none transition-shadow"
                style={{
                  top: `${getTop(event)}px`,
                  height: `${getHeight(event)}px`,
                  backgroundColor: `${cat.color}${isCompleted ? "0e" : "18"}`,
                  borderLeft: `4px solid ${cat.color}`,
                  cursor: isDragging ? "grabbing" : "grab",
                  zIndex: isDragging ? 10 : 1,
                  opacity: isDragging ? 0.35 : isCompleted ? 0.6 : 1,
                }}
                onClick={(e) => { e.stopPropagation(); if (!isDragging) onEventClick(event); }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); updateEvent(event.id, { completed: !isCompleted }); }}
                    className="shrink-0 hover:scale-110 transition-transform"
                    aria-label={isCompleted ? "Marcar como pendente" : "Marcar como concluído"}
                  >
                    <CheckCircle2
                      size={12}
                      style={{ color: cat.color, opacity: isCompleted ? 0.9 : 0.35, flexShrink: 0 }}
                    />
                  </button>
                  <p className={`text-sm font-bold truncate ${isCompleted ? "line-through" : ""}`} style={{ color: cat.color }}>
                    {event.title}
                  </p>
                </div>
                {getHeight(event) >= 48 && (
                  <p className="text-xs mt-0.5" style={{ color: cat.color, opacity: 0.6 }}>
                    {event.startTime} – {event.endTime}
                  </p>
                )}
              </div>
            );
          })}

          {drag && draggedEvent && previewMins !== null && (
            <div
              className="absolute left-3 right-3 rounded-xl px-3 py-2 pointer-events-none z-20 border-2 border-dashed"
              style={{
                top: `${(previewMins / 60) * HOUR_HEIGHT}px`,
                height: `${Math.max((drag.durationMins / 60) * HOUR_HEIGHT, 32)}px`,
                backgroundColor: `${CATEGORY_MAP[draggedEvent.categoryId].color}28`,
                borderColor: CATEGORY_MAP[draggedEvent.categoryId].color,
              }}
            >
              <p className="text-sm font-bold truncate" style={{ color: CATEGORY_MAP[draggedEvent.categoryId].color }}>
                {draggedEvent.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: CATEGORY_MAP[draggedEvent.categoryId].color, opacity: 0.8 }}>
                {minsToTime(previewMins)} – {minsToTime(previewMins + drag.durationMins)}
              </p>
            </div>
          )}
        </div>
      </div>

      {slotMenu && (
        <SlotMenu {...slotMenu}
          onCreateEvent={onCreateEvent}
          onCreateTask={onCreateTask}
          onCreateHabit={onCreateHabit}
          onClose={() => setSlotMenu(null)} />
      )}
    </div>
  );
}
