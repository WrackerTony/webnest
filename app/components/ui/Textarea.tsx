"use client";

import React, { useId } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 dark:text-[#CBC9CF] mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full px-4 py-2 rounded-lg border transition-all duration-200
          bg-white dark:bg-[#1E1E1F]
          text-gray-900 dark:text-[#CBC9CF]
          border-gray-300 dark:border-[#3C3B3D]
          placeholder-gray-400 dark:placeholder-[#6D6C70]
          focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-none
          ${error ? "border-red-500 focus:ring-red-500" : ""}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-[#6D6C70]">
          {helperText}
        </p>
      )}
    </div>
  );
}
