"use client";

import { ArrowLeft, Search, X } from "lucide-react";
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
      <div
        className={cn(
          "relative mx-auto flex h-11 max-w-4xl items-center rounded-full border bg-background shadow-sm",
        )}
      >
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
        ) : (
          <Search className="absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        )}

        {/* Tappable area */}
        <button
          type="button"
          onClick={onTap}
          className="h-full flex-1 cursor-pointer pl-11 pr-4 text-left"
        >
          {query ? (
            <span className="text-sm">{query}</span>
          ) : (
            <span className="text-sm text-muted-foreground">장소 검색</span>
          )}
        </button>

        {query && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
