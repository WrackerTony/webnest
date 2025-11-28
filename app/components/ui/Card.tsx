"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({
  children,
  className = "",
  onClick,
  hover = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-white/50 dark:bg-[#3C3B3D]/30 backdrop-blur-sm
        rounded-2xl 
        border border-gray-200 dark:border-[#6D6C70]/20
        ${hover ? "hover:bg-white/80 dark:hover:bg-[#3C3B3D]/50 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer transition-all duration-300" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 dark:border-[#6D6C70]/20 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-200 dark:border-[#6D6C70]/20 ${className}`}
    >
      {children}
    </div>
  );
}
