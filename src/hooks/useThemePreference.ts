"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark";

const STORAGE_KEY = "scopeops-theme";

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function getInitialTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useThemePreference() {
  const [theme, setTheme] = useState<ThemePreference>(getInitialTheme);
  const ready = true;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setThemePreference = useCallback((nextTheme: ThemePreference) => {
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePreference(theme === "dark" ? "light" : "dark");
  }, [theme, setThemePreference]);

  return { theme, ready, setThemePreference, toggleTheme };
}
