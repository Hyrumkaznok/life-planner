"use client";

import { useState, useRef, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { useCategoryMap } from "@/lib/useCategories";
import { Event } from "@/lib/types";
import {
  startOfWeek, endOfWeek, eachDayOfInterval,
  format, parseISO, addWeeks, subWeeks, isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, CheckSquare, Target } from "lucide-react";
import { toast } from "sonner";

// columnRefs is declared below inside the component

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 56; // px — matches h-14

function minsToTime(mins: number) {
  const clamped = Math.max(0, Math.min(1439, mins));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// ── Slot context menu ────────────────────────────────────────────────────────

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
        {[
          { label: "Novo Evento", sub: "Adicionar ao calendário", Icon: Calendar, color: "rose", action: () => onCreateEvent(date, time) },
          { label: "Nova Tarefa", sub: "Criar uma tarefa", Icon: CheckSquare, color: "blue", action: onCreateTask },
          { label: "Novo Hábito", sub: "Registrar hábito", Icon: Target, color: "violet", action: onCreateHabit },
        ].map(({ label, sub, Icon, color, action }) => (
          <button key={label} onClick={() => { action(); onClose(); }}
            className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-${color}-50 text-left group transition-colors`}>
            <div className={`w-7 h-7 bg-${color}-100 rounded-lg flex items-center justify-center`}>
              <Icon className={`w-3.5 h-3.5 text-${color}-600`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{label}</p>
              <p className="text-[10px] text-slate-400">{sub}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface WeekViewProps {
  onEventClick: (event: Event) => void;
  onCreateEvent: (date: string, time: string) => void;
  onCreateTask: () => void;
  onCreateHabit: () => void;
}

interface DragState {
  eventId: string;
  durationMins: number;
  grabOffsetMins: number; // how far into the event the user grabbed
}

interface DropPreview {
  date: string;
  startMins: number;
}

export function WeekView({ onEventClick, onCreateEvent, onCreateTask, onCreateHabit }: WeekViewProps) {
  const { events, selectedDate, setSelectedDate, updateEvent } = useAppStore();
  const CATEGORY_MAP = useCategoryMap();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 })
  );
  const [slotMenu, setSlotMenu] = useState<{ x: number; y: number; date: string; time: string } | null>(null);

  // Drag state
  const [drag, setDrag] = useState<DragState | null>(null);
  const [preview, setPreview] = useState<DropPreview | null>(null);
  const columnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });

  const goToToday = () => {
    const t = new Date();
    setWeekStart(startOfWeek(t, { weekStartsOn: 1 }));
    setSelectedDate(format(t, "yyyy-MM-dd"));
  };

  const eventsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return events.filter((e) => e.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getEventTop = (event: Event) => (timeToMins(event.startTime) / 60) * HOUR_HEIGHT;
  const getEventHeight = (event: Event) =>
    Math.max(((timeToMins(event.endTime) - timeToMins(event.startTime)) / 60) * HOUR_HEIGHT, 28);

  // ── Drag handlers ──

  const handleDragStart = useCallback((e: React.DragEvent, event: Event) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const grabOffsetPx = e.clientY - rect.top;
    const grabOffsetMins = Math.round((grabOffsetPx / HOUR_HEIGHT) * 60);
    const durationMins = timeToMins(event.endTime) - timeToMins(event.startTime);

    setDrag({ eventId: event.id, durationMins, grabOffsetMins });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", event.id);

    // Delay opacity so the drag ghost looks normal
    requestAnimationFrame(() => {
      (e.currentTarget as HTMLElement).style.opacity = "0.35";
    });
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    setDrag(null);
    setPreview(null);
  }, []);

  const handleColumnDragOver = useCallback((e: React.DragEvent, date: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!drag) return;

    const col = columnRefs.current.get(date);
    if (!col) return;

    const rect = col.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const rawMins = (relY / HOUR_HEIGHT) * 60 - drag.grabOffsetMins;
    const snapped = Math.round(rawMins / 15) * 15; // snap to 15 min
    const startMins = Math.max(0, Math.min(23 * 60, snapped));

    setPreview({ date, startMins });
  }, [drag]);

  const handleColumnDrop = useCallback((e: React.DragEvent, dropDate: string) => {
    e.preventDefault();
    if (!drag || !preview) return;

    const event = events.find((ev) => ev.id === drag.eventId);
    if (!event) return;

    const newStartMins = preview.startMins;
    const newEndMins = Math.min(1439, newStartMins + drag.durationMins);

    updateEvent(event.id, {
      date: dropDate,
      startTime: minsToTime(newStartMins),
      endTime: minsToTime(newEndMins),
    });

    toast.success("Evento movido!");
    setDrag(null);
    setPreview(null);
  }, [drag, preview, events, updateEvent]);

  const handleSlotClick = (e: React.MouseEvent, day: Date, hour: number) => {
    if (drag) return; // don't open menu while dragging
    const time = `${hour.toString().padStart(2, "0")}:00`;
    const date = format(day, "yyyy-MM-dd");
    setSelectedDate(date);
    setSlotMenu({ x: e.clientX, y: e.clientY, date, time });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setWeekStart(subWeeks(weekStart, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700 min-w-44 text-center">
            {format(weekStart, "d MMM", { locale: ptBR })} –{" "}
            {format(endOfWeek(weekStart, { weekStartsOn: 1 }), "d MMM yyyy", { locale: ptBR })}
          </span>
          <button onClick={() => setWeekStart(addWeeks(weekStart, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button onClick={goToToday}
          className="text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors">
          Hoje
        </button>
      </div>

      {/* Day headers */}
      <div className="flex shrink-0 border-b border-slate-100">
        <div className="w-14 shrink-0" />
        {days.map((day) => {
          const todayFlag = isToday(day);
          return (
            <div key={day.toISOString()} className="flex-1 text-center py-2.5 cursor-pointer hover:bg-slate-50/60 transition-colors"
              onClick={() => setSelectedDate(format(day, "yyyy-MM-dd"))}>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                {format(day, "EEE", { locale: ptBR })}
              </p>
              <div className={`mx-auto mt-1 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
                todayFlag
                  ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}>
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex flex-1 overflow-y-auto">
        {/* Hour labels */}
        <div className="w-14 shrink-0 border-r border-slate-50">
          {HOURS.map((hour) => (
            <div key={hour} className="h-14 flex items-start justify-end pr-2.5 pt-1">
              <span className="text-[10px] text-slate-300 font-medium">
                {hour.toString().padStart(2, "0")}h
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayEvents = eventsForDay(day);
          const isDropTarget = preview?.date === dateStr;

          return (
            <div
              key={day.toISOString()}
              className={`flex-1 relative border-r border-slate-50 last:border-r-0 transition-colors ${
                isDropTarget && drag ? "bg-rose-50/30" : ""
              }`}
              ref={(el) => { if (el) columnRefs.current.set(dateStr, el); }}
              onDragOver={(e) => handleColumnDragOver(e, dateStr)}
              onDrop={(e) => handleColumnDrop(e, dateStr)}
            >
              {/* Hour slot cells */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-14 border-b border-slate-50 hover:bg-rose-50/20 cursor-pointer transition-colors"
                  onClick={(e) => handleSlotClick(e, day, hour)}
                />
              ))}

              {/* Event blocks */}
              {dayEvents.map((event) => {
                const cat = CATEGORY_MAP[event.categoryId];
                const isDragging = drag?.eventId === event.id;
                return (
                  <div
                    key={event.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event)}
                    onDragEnd={handleDragEnd}
                    className="absolute left-0.5 right-0.5 rounded-lg px-2 py-1 overflow-hidden select-none transition-shadow"
                    style={{
                      top: `${getEventTop(event)}px`,
                      height: `${getEventHeight(event)}px`,
                      backgroundColor: `${cat.color}18`,
                      borderLeft: `3px solid ${cat.color}`,
                      cursor: isDragging ? "grabbing" : "grab",
                      zIndex: isDragging ? 10 : 1,
                    }}
                    onClick={(e) => { e.stopPropagation(); if (!isDragging) onEventClick(event); }}
                  >
                    <p className="text-[11px] font-bold truncate leading-tight" style={{ color: cat.color }}>
                      {event.title}
                    </p>
                    {getEventHeight(event) >= 40 && (
                      <p className="text-[10px] truncate mt-0.5" style={{ color: cat.color, opacity: 0.7 }}>
                        {event.startTime} – {event.endTime}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Drop preview ghost */}
              {isDropTarget && drag && (() => {
                const draggedEvent = events.find((ev) => ev.id === drag.eventId);
                if (!draggedEvent) return null;
                const cat = CATEGORY_MAP[draggedEvent.categoryId];
                const ghostTop = (preview.startMins / 60) * HOUR_HEIGHT;
                const ghostHeight = Math.max((drag.durationMins / 60) * HOUR_HEIGHT, 28);
                return (
                  <div
                    className="absolute left-0.5 right-0.5 rounded-lg px-2 py-1 pointer-events-none z-20 border-2 border-dashed"
                    style={{
                      top: `${ghostTop}px`,
                      height: `${ghostHeight}px`,
                      backgroundColor: `${cat.color}30`,
                      borderColor: cat.color,
                    }}
                  >
                    <p className="text-[11px] font-bold truncate" style={{ color: cat.color }}>
                      {draggedEvent.title}
                    </p>
                    {ghostHeight >= 36 && (
                      <p className="text-[10px]" style={{ color: cat.color, opacity: 0.8 }}>
                        {minsToTime(preview.startMins)} – {minsToTime(preview.startMins + drag.durationMins)}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {slotMenu && (
        <SlotMenu
          {...slotMenu}
          onCreateEvent={onCreateEvent}
          onCreateTask={onCreateTask}
          onCreateHabit={onCreateHabit}
          onClose={() => setSlotMenu(null)}
        />
      )}
    </div>
  );
}
