"use client";

import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-[#CBC9CF] mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-xl border transition-all duration-300
          bg-white dark:bg-[#3C3B3D]/50 backdrop-blur-sm
          text-gray-900 dark:text-[#CBC9CF]
          border-gray-300 dark:border-[#6D6C70]/30
          placeholder-gray-400 dark:placeholder-[#6D6C70]
          focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:bg-gray-50 dark:focus:bg-[#3C3B3D]
          hover:border-gray-400 dark:hover:border-[#6D6C70]/50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-500/50 focus:ring-red-500/50" : ""}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500 dark:text-[#6D6C70]">
          {helperText}
        </p>
      )}
    </div>
  );
}
