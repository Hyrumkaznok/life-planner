import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO } from "date-fns"
import type { Event } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isEventCompleted(event: Event, dateStr: string): boolean {
  return (event.completedDates ?? []).includes(dateStr);
}

export function eventAppliesToDate(event: Event, dateStr: string): boolean {
  if (event.recurrence === "nenhuma") return event.date === dateStr;
  if (event.date > dateStr) return false;
  const dow = parseISO(dateStr).getDay();
  if (event.recurrence === "diaria") return true;
  if (event.recurrence === "semanal") return parseISO(event.date).getDay() === dow;
  if (event.recurrence === "mensal") return parseISO(event.date).getDate() === parseISO(dateStr).getDate();
  if (event.recurrence === "personalizada") return (event.recurrenceDays ?? []).includes(dow);
  return false;
}
