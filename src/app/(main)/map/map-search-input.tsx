"use client";

import { ArrowLeft, Search, X } from "lucide-react";

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
      <div className="mx-auto flex h-11 max-w-4xl items-center rounded-full border bg-background shadow-sm">
        {/* Left icon: Back or Search */}
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 cursor-pointer items-center pl-3 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
        ) : (
          <div className="flex shrink-0 items-center pl-4">
            <Search className="size-4 text-muted-foreground" />
          </div>
        )}

        {/* Tappable area */}
        <button
          type="button"
          onClick={onTap}
          className="h-full min-w-0 flex-1 cursor-pointer px-2 text-left"
        >
          {query ? (
            <span className="truncate text-sm">{query}</span>
          ) : (
            <span className="text-sm text-muted-foreground">장소 검색</span>
          )}
        </button>

        {/* Right icon: Clear */}
        {query && (
          <button
            type="button"
            onClick={onClear}
            className="flex shrink-0 cursor-pointer items-center pr-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
