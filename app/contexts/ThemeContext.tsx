"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";

interface ThemeContextType {
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark: true }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
