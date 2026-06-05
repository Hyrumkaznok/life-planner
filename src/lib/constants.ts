import { Category } from "./types";

export const CATEGORIES: Category[] = [
  { id: "trabalho",    name: "Trabalho",        color: "#3B82F6", bgColor: "bg-blue-500",   textColor: "text-blue-600"   },
  { id: "estudos",     name: "Estudos",          color: "#8B5CF6", bgColor: "bg-violet-500", textColor: "text-violet-600" },
  { id: "academia",    name: "Academia",         color: "#F97316", bgColor: "bg-orange-500", textColor: "text-orange-600" },
  { id: "saude",       name: "Saúde",            color: "#22C55E", bgColor: "bg-green-500",  textColor: "text-green-600"  },
  { id: "pessoal",     name: "Projeto Pessoal",  color: "#06B6D4", bgColor: "bg-cyan-500",   textColor: "text-cyan-600"   },
  { id: "financas",    name: "Finanças",         color: "#EAB308", bgColor: "bg-yellow-500", textColor: "text-yellow-600" },
  { id: "familia",     name: "Família",          color: "#EC4899", bgColor: "bg-pink-500",   textColor: "text-pink-600"   },
  { id: "alimentacao", name: "Alimentação",      color: "#EF4444", bgColor: "bg-red-500",    textColor: "text-red-600"    },
  { id: "viagem",      name: "Viagem",           color: "#9F1239", bgColor: "bg-rose-900",   textColor: "text-rose-900"   },
  { id: "lazer",       name: "Lazer",            color: "#84CC16", bgColor: "bg-lime-500",   textColor: "text-lime-600"   },
  { id: "tarefa",      name: "Tarefa",           color: "#CA8A04", bgColor: "bg-amber-600",  textColor: "text-amber-700"  },
  { id: "outros",      name: "Outros",           color: "#9CA3AF", bgColor: "bg-gray-400",   textColor: "text-gray-500"   },
];

// Typed as Record<string, Category> to support custom categories with string IDs
export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);
