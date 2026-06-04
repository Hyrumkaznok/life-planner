"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Event, Task, Habit, AppSettings, Category, UserProfile } from "./types";
import { MOCK_EVENTS, MOCK_TASKS, MOCK_HABITS } from "./mock-data";
import { format } from "date-fns";

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

// ── Types ─────────────────────────────────────────────────────────────────────

interface AppStore {
  events: Event[];
  tasks: Task[];
  habits: Habit[];
  settings: AppSettings;
  customCategories: Category[];
  userProfile: UserProfile;
  selectedDate: string;
  calendarView: "day" | "week" | "month";
  setSelectedDate: (date: string) => void;
  setCalendarView: (view: "day" | "week" | "month") => void;
  addEvent: (event: Omit<Event, "id">) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
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

const DEFAULT_SETTINGS: AppSettings = { theme: "light", weekStartsOnMonday: true, defaultView: "week" };
const DEFAULT_PROFILE: UserProfile = { name: "", role: "", email: "", initials: "U", avatarColor: "#E11D48" };

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents]                   = useState<Event[]>(() => load("lp_events", MOCK_EVENTS));
  const [tasks, setTasks]                     = useState<Task[]>(() => load("lp_tasks", MOCK_TASKS));
  const [habits, setHabits]                   = useState<Habit[]>(() => load("lp_habits", MOCK_HABITS));
  const [customCategories, setCustomCategories] = useState<Category[]>(() => load("lp_categories", []));
  const [userProfile, setUserProfile]         = useState<UserProfile>(() => load("lp_profile", DEFAULT_PROFILE));
  const [settings, setSettings]               = useState<AppSettings>(() => load("lp_settings", DEFAULT_SETTINGS));
  const [selectedDate, setSelectedDate]       = useState(format(new Date(), "yyyy-MM-dd"));
  const [calendarView, setCalendarView]       = useState<"day" | "week" | "month">("week");

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
        return { ...h, completedDates: isCompleted ? h.completedDates.filter((d) => d !== date) : [...h.completedDates, date] };
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
      addEvent, updateEvent, deleteEvent,
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
