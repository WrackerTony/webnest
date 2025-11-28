"use client";

import React from "react";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className = "" }: SidebarProps) {
  return (
    <aside className={`w-64 shrink-0 ${className}`}>
      <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
        {children}
      </div>
    </aside>
  );
}

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="py-4">
      {title && (
        <h3 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#6D6C70]">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
