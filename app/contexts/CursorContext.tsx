"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type CursorStyle = "default" | "pointer" | "cursor";

interface CursorContextType {
  cursorStyle: CursorStyle;
  setCursorStyle: (style: CursorStyle) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

const defaultCursorContext: CursorContextType = {
  cursorStyle: "default",
  setCursorStyle: () => {},
};

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [cursorStyle, setCursorStyleState] = useState<CursorStyle>("default");
  const [isInitialized, setIsInitialized] = useState(false);

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

  if (context === undefined) {
    return defaultCursorContext;
  }
  return context;
}
