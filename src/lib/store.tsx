"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Event, Task, Habit, AppSettings, Category, UserProfile } from "./types";
import { MOCK_EVENTS, MOCK_TASKS, MOCK_HABITS } from "./mock-data";
import { format } from "date-fns";

// ── Streak helper ─────────────────────────────────────────────────────────────

function recalcStreak(completedDates: string[], targetDays: number[], today: string): number {
  let streak = 0;
  const base = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const dow = d.getDay();
    if (!targetDays.includes(dow)) continue;
    const dateStr = format(d, "yyyy-MM-dd");
    if (completedDates.includes(dateStr)) {
      streak++;
    } else if (dateStr < today) {
      break;
    }
    // today not yet completed → skip without breaking
  }
  return streak;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — fail silently
  }
}

// ── Migração de dados antigos (en → pt) ───────────────────────────────────────

const CAT_MAP: Record<string, string> = {
  work: "trabalho", study: "estudos", gym: "academia", health: "saude",
  personal: "pessoal", finance: "financas", family: "familia", food: "alimentacao",
  travel: "viagem", leisure: "lazer", task: "tarefa", other: "outros",
};
const REC_MAP: Record<string, string> = {
  none: "nenhuma", daily: "diaria", weekly: "semanal", monthly: "mensal", custom: "personalizada",
};
const FREQ_MAP: Record<string, string> = { daily: "diaria", weekly: "semanal" };
const VIEW_MAP: Record<string, string> = { day: "dia", week: "semana", month: "mes" };

function migrateEvents(events: Event[]): Event[] {
  return events.map((e) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legacy = e as any;
    const completedDates: string[] =
      e.completedDates ?? (legacy.completed === true ? [e.date] : []);
    return {
      ...e,
      categoryId: CAT_MAP[e.categoryId] ?? e.categoryId,
      recurrence: (REC_MAP[e.recurrence as string] ?? e.recurrence) as Event["recurrence"],
      completedDates,
    };
  });
}
function migrateHabits(habits: Habit[]): Habit[] {
  return habits.map((h) => ({
    ...h,
    categoryId: CAT_MAP[h.categoryId] ?? h.categoryId,
    frequency: (FREQ_MAP[h.frequency as string] ?? h.frequency) as Habit["frequency"],
  }));
}
function migrateTasks(tasks: Task[]): Task[] {
  return tasks.map((t) => ({ ...t, categoryId: CAT_MAP[t.categoryId] ?? t.categoryId }));
}
function migrateSettings(s: AppSettings): AppSettings {
  return { ...s, defaultView: (VIEW_MAP[s.defaultView as string] ?? s.defaultView) as AppSettings["defaultView"] };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface AppStore {
  events: Event[];
  tasks: Task[];
  habits: Habit[];
  settings: AppSettings;
  customCategories: Category[];
  userProfile: UserProfile;
  selectedDate: string;
  calendarView: "dia" | "semana" | "mes";
  setSelectedDate: (date: string) => void;
  setCalendarView: (view: "dia" | "semana" | "mes") => void;
  addEvent: (event: Omit<Event, "id">) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  toggleEventComplete: (id: string, date: string) => void;
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "streak" | "completedDates">) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitComplete: (id: string, date: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addCustomCategory: (category: Omit<Category, "id" | "bgColor" | "textColor" | "custom">) => void;
  deleteCustomCategory: (id: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

const DEFAULT_SETTINGS: AppSettings = { theme: "light", weekStartsOnMonday: true, defaultView: "semana" };
const DEFAULT_PROFILE: UserProfile = { name: "", role: "", email: "", initials: "U", avatarColor: "#E11D48" };

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents]                   = useState<Event[]>(() => migrateEvents(load("lp_events", MOCK_EVENTS)));
  const [tasks, setTasks]                     = useState<Task[]>(() => migrateTasks(load("lp_tasks", MOCK_TASKS)));
  const [habits, setHabits]                   = useState<Habit[]>(() => migrateHabits(load("lp_habits", MOCK_HABITS)));
  const [customCategories, setCustomCategories] = useState<Category[]>(() => load("lp_categories", []));
  const [userProfile, setUserProfile]         = useState<UserProfile>(() => load("lp_profile", DEFAULT_PROFILE));
  const [settings, setSettings]               = useState<AppSettings>(() => migrateSettings(load("lp_settings", DEFAULT_SETTINGS)));
  const [selectedDate, setSelectedDate]       = useState(format(new Date(), "yyyy-MM-dd"));
  const [calendarView, setCalendarView]       = useState<"dia" | "semana" | "mes">(() => migrateSettings(load<AppSettings>("lp_settings", DEFAULT_SETTINGS)).defaultView);

  // Persist to localStorage whenever state changes
  useEffect(() => { save("lp_events", events); }, [events]);
  useEffect(() => { save("lp_tasks", tasks); }, [tasks]);
  useEffect(() => { save("lp_habits", habits); }, [habits]);
  useEffect(() => { save("lp_categories", customCategories); }, [customCategories]);
  useEffect(() => { save("lp_profile", userProfile); }, [userProfile]);
  useEffect(() => { save("lp_settings", settings); }, [settings]);

  const addEvent = useCallback((event: Omit<Event, "id">) => {
    setEvents((prev) => [...prev, { ...event, id: `e${Date.now()}` }]);
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const toggleEventComplete = useCallback((id: string, date: string) => {
    setEvents((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      const dates = e.completedDates ?? [];
      const completedDates = dates.includes(date)
        ? dates.filter((d) => d !== date)
        : [...dates, date];
      return { ...e, completedDates };
    }));
  }, []);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    setTasks((prev) => [...prev, { ...task, id: `t${Date.now()}`, createdAt: format(new Date(), "yyyy-MM-dd") }]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, "id" | "createdAt" | "streak" | "completedDates">) => {
    setHabits((prev) => [...prev, { ...habit, id: `h${Date.now()}`, streak: 0, completedDates: [], createdAt: format(new Date(), "yyyy-MM-dd") }]);
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleHabitComplete = useCallback((id: string, date: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const isCompleted = h.completedDates.includes(date);
        const newDates = isCompleted
          ? h.completedDates.filter((d) => d !== date)
          : [...h.completedDates, date];
        const today = format(new Date(), "yyyy-MM-dd");
        return { ...h, completedDates: newDates, streak: recalcStreak(newDates, h.targetDays, today) };
      })
    );
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const addCustomCategory = useCallback((cat: Omit<Category, "id" | "bgColor" | "textColor" | "custom">) => {
    setCustomCategories((prev) => [...prev, { ...cat, id: `custom-${Date.now()}`, bgColor: "", textColor: "", custom: true }]);
  }, []);

  const deleteCustomCategory = useCallback((id: string) => {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AppContext.Provider value={{
      events, tasks, habits, settings, customCategories, userProfile,
      selectedDate, calendarView,
      setSelectedDate, setCalendarView,
      addEvent, updateEvent, deleteEvent, toggleEventComplete,
      addTask, updateTask, deleteTask,
      addHabit, updateHabit, deleteHabit, toggleHabitComplete,
      updateSettings, addCustomCategory, deleteCustomCategory, updateUserProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppProvider");
  return ctx;
}
