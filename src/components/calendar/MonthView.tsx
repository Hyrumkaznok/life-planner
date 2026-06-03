"use client";

import { useAppStore } from "@/lib/store";
import { useCategoryMap } from "@/lib/useCategories";
import { Event } from "@/lib/types";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isToday, parseISO, addMonths, subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface MonthViewProps {
  onEventClick: (event: Event) => void;
}

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function MonthView({ onEventClick }: MonthViewProps) {
  const { events, selectedDate, setSelectedDate } = useAppStore();
  const CATEGORY_MAP = useCategoryMap();
  const [currentMonth, setCurrentMonth] = useState(() => parseISO(selectedDate));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsForDay = (day: Date) => events.filter((e) => e.date === format(day, "yyyy-MM-dd"));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-700 min-w-36 text-center capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => { setCurrentMonth(new Date()); setSelectedDate(format(new Date(), "yyyy-MM-dd")); }}
          className="text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors">
          Hoje
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-slate-100 shrink-0 bg-slate-50/50">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="flex-1 grid grid-cols-7 overflow-y-auto">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const todayFlag = isToday(day);
          const isSelected = format(day, "yyyy-MM-dd") === selectedDate;
          const dayEvents = eventsForDay(day);

          return (
            <div
              key={day.toISOString()}
              className={`border-b border-r border-slate-100 min-h-24 p-1.5 cursor-pointer transition-colors hover:bg-slate-50/60 ${
                !isCurrentMonth ? "bg-slate-50/40" : ""
              } ${isSelected && !todayFlag ? "bg-rose-50/30" : ""}`}
              onClick={() => setSelectedDate(format(day, "yyyy-MM-dd"))}
            >
              <div className="flex justify-end mb-1">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  todayFlag
                    ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm"
                    : isCurrentMonth ? "text-slate-700 hover:bg-slate-100" : "text-slate-300"
                }`}>
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => {
                  const cat = CATEGORY_MAP[event.categoryId];
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold truncate cursor-pointer hover:brightness-90 transition-all"
                      style={{ backgroundColor: `${cat.color}18`, color: cat.color, borderLeft: `2px solid ${cat.color}` }}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                    >
                      <span className="truncate">{event.title}</span>
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-slate-400 px-1 font-medium">+{dayEvents.length - 3} mais</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
