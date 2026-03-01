"use client";

import { ChevronLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapSearchInputProps {
  query: string;
  onTap: () => void;
  onClear: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export function MapSearchInput({
  query,
  onTap,
  onClear,
  showBack,
  onBack,
}: MapSearchInputProps) {
  return (
    <div className="absolute inset-x-0 top-0 z-50 px-4 py-3">
      <div className="relative mx-auto h-11 max-w-4xl rounded-full border bg-background shadow-sm">
        {/* Left icon: Back or Search */}
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : (
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        )}

        {/* Tappable area */}
        <button
          type="button"
          onClick={onTap}
          className={cn(
            "h-full w-full cursor-pointer rounded-full pl-12 text-left",
            { "pr-12": query },
          )}
        >
          {query ? (
            <span className="block truncate">{query}</span>
          ) : (
            <span className="text-muted-foreground">장소 검색</span>
          )}
        </button>

        {/* Right icon: Clear */}
        {query && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
