export type CategoryId =
  | "trabalho" | "estudos" | "academia" | "saude" | "pessoal"
  | "financas" | "familia" | "alimentacao" | "viagem" | "lazer"
  | "tarefa" | "outros";

export interface Category {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  custom?: boolean;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  initials: string;
  avatarColor: string;
}

export type RecurrenceType = "nenhuma" | "diaria" | "semanal" | "mensal" | "personalizada";

export interface Event {
  id: string;
  title: string;
  categoryId: string; // string to support custom categories
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  recurrence: RecurrenceType;
  recurrenceDays?: number[]; // 0=Dom, 1=Seg, ..., 6=Sáb — usado quando recurrence === "personalizada"
  confirmed: boolean;
  completedDates?: string[]; // datas (yyyy-MM-dd) em que este evento foi concluído
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  categoryId: string;
  dueDate?: string;
  createdAt: string;
}

export type HabitFrequency = "diaria" | "semanal";

export interface Habit {
  id: string;
  name: string;
  categoryId: string;
  frequency: HabitFrequency;
  targetDays: number[];
  streak: number;
  completedDates: string[];
  createdAt: string;
}

export type ThemeMode = "light" | "dark";

export interface AppSettings {
  theme: ThemeMode;
  weekStartsOnMonday: boolean;
  defaultView: "dia" | "semana" | "mes";
}
