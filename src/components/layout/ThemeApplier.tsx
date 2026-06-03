"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function ThemeApplier() {
  const { settings } = useAppStore();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);
  return null;
}
