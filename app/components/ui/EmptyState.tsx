"use client";

import React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-[#6D6C70]">{icon}</div>
      )}
      <h3 className="text-lg font-medium text-gray-900 dark:text-[#CBC9CF] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-[#6D6C70] max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
