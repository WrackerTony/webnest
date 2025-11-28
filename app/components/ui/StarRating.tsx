"use client";

import React from "react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

export function StarRating({
  rating,
  maxRating = 5,
  onChange,
  size = "md",
  readonly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  const containerSizes = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2",
  };

  const handleClick = (star: number) => {
    if (!readonly && onChange) {
      onChange(star);
    }
  };

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="group"
      aria-label="Star rating"
    >
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => {
        const isFilled = star <= (hoverRating || rating);

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClick(star);
            }}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            aria-label={`Rate ${star} out of ${maxRating}${star <= rating ? ", selected" : ""}`}
            className={`
              ${containerSizes[size]}
              ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"} 
              transition-all duration-150 rounded-sm
              ${!readonly && "hover:bg-violet-100 dark:hover:bg-violet-500/20"}
              focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
            `}
          >
            <svg
              className={`${sizes[size]} ${
                isFilled
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300 dark:text-gray-600 fill-transparent"
              } transition-colors duration-150`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
