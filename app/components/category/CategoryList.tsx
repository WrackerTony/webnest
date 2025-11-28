"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Id } from "../../../convex/_generated/dataModel";
import { Dropdown, DropdownItem, DropdownDivider } from "../ui";

interface Category {
  _id: Id<"categories">;
  name: string;
  color: string;
  icon: string;
  order: number;
  websiteCount?: number;
}

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId?: Id<"categories">;
  onSelectCategory: (categoryId?: Id<"categories">) => void;
  onCreateCategory?: () => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (category: Category) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactElement> = {
  folder: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  ),
  ai: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  ),
  tools: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
  ),
  social: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  ),
  dev: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  ),
  news: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
    />
  ),
  shopping: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  ),
  entertainment: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
    />
  ),
  education: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  ),
  star: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  ),
};

export function CategoryList({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoryListProps) {
  return (
    <div className="py-2 space-y-1">
      {/* All Websites option */}
      <button
        onClick={() => onSelectCategory(undefined)}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
          ${
            selectedCategoryId === undefined
              ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
              : "text-[#CBC9CF] hover:bg-[#3C3B3D]/50"
          }
        `}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        <span className="text-sm font-medium flex-1 text-left">
          All Websites
        </span>
      </button>

      {/* Categories */}
      {categories.map((category) => (
        <CategoryItem
          key={category._id}
          category={category}
          isSelected={selectedCategoryId === category._id}
          onSelect={() => onSelectCategory(category._id)}
          onEdit={onEditCategory}
          onDelete={onDeleteCategory}
        />
      ))}

      {/* Add category button */}
      {onCreateCategory && (
        <button
          onClick={onCreateCategory}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#6D6C70] hover:text-violet-400 hover:bg-[#3C3B3D]/50 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add category
        </button>
      )}
    </div>
  );
}

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

function CategoryItem({
  category,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: CategoryItemProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [mounted, setMounted] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit || onDelete) {
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setShowContextMenu(false);
      }
    };
    if (showContextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showContextMenu]);

  // Get inline style for category color (needed for dynamic colors)
  const iconStyle = { color: category.color } as React.CSSProperties;

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className={`
          group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
          ${
            isSelected
              ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
              : "text-[#CBC9CF] hover:bg-[#3C3B3D]/50"
          }
        `}
      >
        {/* Category icon with color - using inline style for dynamic color */}
        <svg
          className="w-5 h-5 shrink-0"
          style={iconStyle}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {CATEGORY_ICONS[category.icon] || CATEGORY_ICONS.folder}
        </svg>

        {/* Category name */}
        <button
          onClick={onSelect}
          className="flex-1 text-left text-sm font-medium truncate"
        >
          {category.name}
        </button>

        {/* Website count */}
        {category.websiteCount !== undefined && category.websiteCount > 0 && (
          <span className="text-xs text-[#6D6C70] bg-[#3C3B3D] px-1.5 py-0.5 rounded">
            {category.websiteCount}
          </span>
        )}

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Dropdown
              align="right"
              trigger={
                <button
                  className="p-1 rounded hover:bg-[#1E1E1F]"
                  aria-label="Category actions"
                >
                  <svg
                    className="w-4 h-4 text-[#6D6C70]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              }
            >
              {onEdit && (
                <DropdownItem
                  onClick={() => onEdit(category)}
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  }
                >
                  Edit
                </DropdownItem>
              )}
              {onDelete && (
                <>
                  <DropdownDivider />
                  <DropdownItem
                    variant="danger"
                    onClick={() => onDelete(category)}
                    icon={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    }
                  >
                    Delete
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          </div>
        )}
      </div>

      {/* Right-click context menu - rendered via portal */}
      {showContextMenu &&
        mounted &&
        createPortal(
          <div
            ref={contextMenuRef}
            className="context-menu"
            style={{
              position: "fixed",
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(category);
                  setShowContextMenu(false);
                }}
                className="context-menu-item"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  onDelete(category);
                  setShowContextMenu(false);
                }}
                className="context-menu-item context-menu-item-danger"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export const CATEGORY_COLORS = [
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
];

export const CATEGORY_ICON_OPTIONS = [
  { value: "folder", label: "Folder" },
  { value: "ai", label: "AI" },
  { value: "tools", label: "Tools" },
  { value: "social", label: "Social" },
  { value: "dev", label: "Development" },
  { value: "news", label: "News" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Entertainment" },
  { value: "education", label: "Education" },
  { value: "star", label: "Favorites" },
];
