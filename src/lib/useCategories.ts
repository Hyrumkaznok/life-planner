import { useMemo } from "react";
import { CATEGORIES } from "./constants";
import { useAppStore } from "./store";
import { Category } from "./types";

export function useCategories(): Category[] {
  const { customCategories } = useAppStore();
  return useMemo(() => [...CATEGORIES, ...customCategories], [customCategories]);
}

export function useCategoryMap(): Record<string, Category> {
  const all = useCategories();
  return useMemo(() => Object.fromEntries(all.map((c) => [c.id, c])), [all]);
}
