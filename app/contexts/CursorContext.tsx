"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type CursorStyle = "default" | "pointer" | "cursor";

interface CursorContextType {
  cursorStyle: CursorStyle;
  setCursorStyle: (style: CursorStyle) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

// Default cursor context for SSR/static generation
const defaultCursorContext: CursorContextType = {
  cursorStyle: "default",
  setCursorStyle: () => {},
};

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [cursorStyle, setCursorStyleState] = useState<CursorStyle>("default");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cursor preference from localStorage on mount
  useEffect(() => {
    const savedCursor = localStorage.getItem(
      "cursorStyle"
    ) as CursorStyle | null;
    if (savedCursor && ["default", "pointer", "cursor"].includes(savedCursor)) {
      setCursorStyleState(savedCursor);
      document.documentElement.setAttribute("data-cursor", savedCursor);
    }
    setIsInitialized(true);
  }, []);

  const setCursorStyle = (style: CursorStyle) => {
    setCursorStyleState(style);
    localStorage.setItem("cursorStyle", style);
    document.documentElement.setAttribute("data-cursor", style);
  };

  // Prevent flash of wrong cursor by not rendering until initialized
  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <CursorContext.Provider value={{ cursorStyle, setCursorStyle }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);
  // Return default context during SSR/static generation
  if (context === undefined) {
    return defaultCursorContext;
  }
  return context;
}
