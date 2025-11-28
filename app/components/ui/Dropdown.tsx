"use client";

import React from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}

const DropdownContext = React.createContext<{ close: () => void } | null>(null);

export function Dropdown({ trigger, children, align = "left" }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: align === "right" ? rect.right : rect.left,
      });
    }
    setIsOpen(!isOpen);
  };

  const close = () => setIsOpen(false);

  return (
    <div className="relative inline-block">
      <div ref={triggerRef} onClick={handleToggle}>
        {trigger}
      </div>
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <DropdownContext.Provider value={{ close }}>
            <div
              ref={dropdownRef}
              className="fixed z-9999 min-w-48 py-2 bg-[#2C2B2D] border border-[#3C3B3D] rounded-xl shadow-2xl shadow-black/50"
              style={{
                top: position.top,
                left: align === "right" ? "auto" : position.left,
                right:
                  align === "right"
                    ? window.innerWidth - position.left
                    : "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </DropdownContext.Provider>,
          document.body
        )}
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
  icon?: React.ReactNode;
}

export function DropdownItem({
  children,
  onClick,
  variant = "default",
  icon,
}: DropdownItemProps) {
  const context = React.useContext(DropdownContext);

  const handleClick = () => {
    if (onClick) onClick();
    if (context) context.close();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all duration-200
        ${
          variant === "danger"
            ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
            : "text-[#CBC9CF] hover:bg-[#3C3B3D] hover:text-white"
        }
      `}
    >
      {icon}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-2 border-t border-[#3C3B3D]" />;
}
