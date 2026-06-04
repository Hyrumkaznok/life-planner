export type CategoryId =
  | "work" | "study" | "gym" | "health" | "personal"
  | "finance" | "family" | "food" | "travel" | "leisure"
  | "task" | "other";

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

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

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
  confirmed: boolean;
  completed?: boolean;
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

export type HabitFrequency = "daily" | "weekly";

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
  defaultView: "day" | "week" | "month";
}
