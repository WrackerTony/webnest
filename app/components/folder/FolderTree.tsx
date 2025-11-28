"use client";

import React, { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { Dropdown, DropdownItem, DropdownDivider } from "../ui";

interface Folder {
  _id: Id<"folders">;
  name: string;
  parentId?: Id<"folders">;
  isPublic: boolean;
  order: number;
  children?: Folder[];
}

interface FolderTreeProps {
  folders: Folder[];
  selectedFolderId?: Id<"folders">;
  onSelectFolder: (folderId: Id<"folders">) => void;
  onCreateFolder?: (parentId?: Id<"folders">) => void;
  onEditFolder?: (folder: Folder) => void;
  onDeleteFolder?: (folder: Folder) => void;
  onTogglePublic?: (folder: Folder) => void;
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onTogglePublic,
}: FolderTreeProps) {
  return (
    <div className="py-2">
      {folders.map((folder) => (
        <FolderItem
          key={folder._id}
          folder={folder}
          level={0}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          onCreateFolder={onCreateFolder}
          onEditFolder={onEditFolder}
          onDeleteFolder={onDeleteFolder}
          onTogglePublic={onTogglePublic}
        />
      ))}

      {/* Add root folder button */}
      {onCreateFolder && (
        <button
          onClick={() => onCreateFolder()}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 dark:text-[#6D6C70] hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-[#3C3B3D]/50 rounded-lg transition-colors"
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
          Add folder
        </button>
      )}
    </div>
  );
}

interface FolderItemProps {
  folder: Folder;
  level: number;
  selectedFolderId?: Id<"folders">;
  onSelectFolder: (folderId: Id<"folders">) => void;
  onCreateFolder?: (parentId?: Id<"folders">) => void;
  onEditFolder?: (folder: Folder) => void;
  onDeleteFolder?: (folder: Folder) => void;
  onTogglePublic?: (folder: Folder) => void;
}

function FolderItem({
  folder,
  level,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onTogglePublic,
}: FolderItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolderId === folder._id;

  return (
    <div>
      <div
        className={`
          group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-colors
          ${
            isSelected
              ? "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-300 dark:border-violet-500/30"
              : "hover:bg-gray-100 dark:hover:bg-[#3C3B3D]/50 text-gray-900 dark:text-[#CBC9CF]"
          }
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* Expand/collapse button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-[#3C3B3D] transition-colors ${
            hasChildren ? "visible" : "invisible"
          }`}
          aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Folder icon */}
        <svg
          className={`w-5 h-5 ${
            isSelected
              ? "text-violet-600 dark:text-violet-400"
              : "text-gray-400 dark:text-[#6D6C70]"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isExpanded ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          )}
        </svg>

        {/* Folder name */}
        <button
          onClick={() => onSelectFolder(folder._id)}
          className="flex-1 text-left text-sm font-medium truncate"
        >
          {folder.name}
        </button>

        {/* Public indicator */}
        {folder.isPublic && (
          <svg
            className="w-4 h-4 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="Public folder"
            role="img"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Dropdown
            align="right"
            trigger={
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#1E1E1F]"
                aria-label="Folder actions"
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
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            }
          >
            {onCreateFolder && (
              <DropdownItem onClick={() => onCreateFolder(folder._id)}>
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
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                Add subfolder
              </DropdownItem>
            )}
            {onEditFolder && (
              <DropdownItem onClick={() => onEditFolder(folder)}>
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
                Rename
              </DropdownItem>
            )}
            {onTogglePublic && (
              <DropdownItem onClick={() => onTogglePublic(folder)}>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {folder.isPublic ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  )}
                </svg>
                {folder.isPublic ? "Make private" : "Make public"}
              </DropdownItem>
            )}
            {onDeleteFolder && (
              <>
                <DropdownDivider />
                <DropdownItem
                  variant="danger"
                  onClick={() => onDeleteFolder(folder)}
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
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="animate-in slide-in-from-top-1 duration-150">
          {folder.children!.map((child) => (
            <FolderItem
              key={child._id}
              folder={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onCreateFolder={onCreateFolder}
              onEditFolder={onEditFolder}
              onDeleteFolder={onDeleteFolder}
              onTogglePublic={onTogglePublic}
            />
          ))}
        </div>
      )}
    </div>
  );
}
