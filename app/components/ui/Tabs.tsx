"use client";

import React from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div
      className={`border-b border-gray-200 dark:border-[#3C3B3D] ${className}`}
    >
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === tab.id
                  ? "border-violet-500 text-violet-600 dark:text-violet-400"
                  : "border-transparent text-gray-500 dark:text-[#6D6C70] hover:text-gray-700 dark:hover:text-[#CBC9CF] hover:border-gray-300 dark:hover:border-[#6D6C70]"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

interface TabPanelProps {
  children: React.ReactNode;
  tabId: string;
  activeTab: string;
}

export function TabPanel({ children, tabId, activeTab }: TabPanelProps) {
  if (tabId !== activeTab) return null;
  return <div className="py-4 animate-in fade-in duration-200">{children}</div>;
}
