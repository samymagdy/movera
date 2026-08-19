"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { ThemeMode } from "@company/contracts";

type ThemeContextValue = { theme: ThemeMode; setTheme: (theme: ThemeMode) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
const lightTheme: ThemeContextValue = { theme: "light", setTheme: () => undefined };

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = "light";
  }, []);

  return <ThemeContext.Provider value={lightTheme}>{children}</ThemeContext.Provider>;
}

export function useAdminTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useAdminTheme must be used inside AdminThemeProvider");
  return context;
}
