"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Card,
  Badge,
  StarRating,
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "../ui";
import { Id } from "../../../convex/_generated/dataModel";

interface Website {
  _id: Id<"websites">;
  url: string;
  title: string;
  description?: string;
  faviconUrl?: string;
  tags: string[];
  clickCount: number;
  rating?: number;
  usefulness?: number;
  createdAt: number;
}

interface WebsiteCardProps {
  website: Website;
  view?: "grid" | "list";
  onEdit?: (website: Website) => void;
  onMove?: (website: Website) => void;
  onDelete?: (website: Website) => void;
}

export function WebsiteCard({
  website,
  view = "grid",
  onEdit,
  onMove,
  onDelete,
}: WebsiteCardProps) {
  const { token } = useAuth();
  const [isRating, setIsRating] = useState(false);

  const clickMutation = useMutation(api.websites.click);
  const rateMutation = useMutation(api.websites.rate);

  const handleClick = async () => {
    if (!token) return;
    await clickMutation({ token, websiteId: website._id });
    window.open(website.url, "_blank");
  };

  const handleRate = async (rating: number) => {
    if (!token) return;
    await rateMutation({ token, websiteId: website._id, rating });
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (view === "list") {
    return (
      <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-[#3C3B3D]/50 rounded-lg border border-gray-200 dark:border-[#3C3B3D] hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-200 group backdrop-blur-sm">
        {/* Favicon */}
        <div className="shrink-0">
          <img
            src={
              website.faviconUrl || getFaviconUrl(website.url) || "/favicon.ico"
            }
            alt=""
            className="w-10 h-10 rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/favicon.ico";
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <button onClick={handleClick} className="text-left w-full">
            <h3 className="font-semibold text-gray-900 dark:text-[#CBC9CF] truncate hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              {website.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-[#6D6C70] truncate">
              {new URL(website.url).hostname}
            </p>
          </button>
        </div>

        {/* Tags */}
        <div className="hidden lg:flex items-center gap-1">
          {website.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} size="sm">
              {tag}
            </Badge>
          ))}
          {website.tags.length > 3 && (
            <Badge size="sm">+{website.tags.length - 3}</Badge>
          )}
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500 dark:text-[#6D6C70]">
          <div className="flex items-center gap-1">
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {website.clickCount}
          </div>
          <span className="hidden md:inline">
            {formatDate(website.createdAt)}
          </span>
          {isRating ? (
            <StarRating
              rating={website.rating || 0}
              onChange={handleRate}
              size="sm"
            />
          ) : (
            <StarRating rating={website.rating || 0} size="sm" readonly />
          )}
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Dropdown
            align="right"
            trigger={
              <button
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E1E1F]"
                aria-label="Website actions"
              >
                <svg
                  className="w-5 h-5 text-gray-400 dark:text-[#6D6C70]"
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
            <DropdownItem onClick={() => setIsRating(!isRating)}>
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
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              Rate
            </DropdownItem>
            <DropdownItem onClick={() => onEdit?.(website)}>
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
            </DropdownItem>
            <DropdownItem onClick={() => onMove?.(website)}>
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
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              Move
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem variant="danger" onClick={() => onDelete?.(website)}>
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
          </Dropdown>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <Card hover className="overflow-hidden group">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={
                website.faviconUrl ||
                getFaviconUrl(website.url) ||
                "/favicon.ico"
              }
              alt=""
              className="w-10 h-10 rounded-lg shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/favicon.ico";
              }}
            />
            <div className="min-w-0">
              <button onClick={handleClick} className="text-left w-full">
                <h3 className="font-semibold text-gray-900 dark:text-[#CBC9CF] truncate hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  {website.title}
                </h3>
              </button>
              <p className="text-sm text-gray-500 dark:text-[#6D6C70] truncate">
                {new URL(website.url).hostname}
              </p>
            </div>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Dropdown
              align="right"
              trigger={
                <button
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E1E1F]"
                  aria-label="Website actions"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-[#6D6C70]"
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
              <DropdownItem onClick={() => setIsRating(!isRating)}>
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                Rate
              </DropdownItem>
              <DropdownItem onClick={() => onEdit?.(website)}>
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
              </DropdownItem>
              <DropdownItem onClick={() => onMove?.(website)}>
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
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                Move
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem
                variant="danger"
                onClick={() => onDelete?.(website)}
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
            </Dropdown>
          </div>
        </div>

        {/* Description */}
        {website.description && (
          <p className="text-sm text-gray-500 dark:text-[#6D6C70] line-clamp-2 mb-3">
            {website.description}
          </p>
        )}

        {/* Tags */}
        {website.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {website.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} size="sm">
                {tag}
              </Badge>
            ))}
            {website.tags.length > 3 && (
              <Badge size="sm">+{website.tags.length - 3}</Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-[#3C3B3D]">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-[#6D6C70]">
            <div className="flex items-center gap-1">
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {website.clickCount}
            </div>
            <span>{formatDate(website.createdAt)}</span>
          </div>

          {isRating ? (
            <StarRating
              rating={website.rating || 0}
              onChange={handleRate}
              size="sm"
            />
          ) : (
            <StarRating rating={website.rating || 0} size="sm" readonly />
          )}
        </div>
      </div>
    </Card>
  );
}
