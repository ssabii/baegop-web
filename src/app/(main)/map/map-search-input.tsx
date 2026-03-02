"use client";

import { ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBarAvatar } from "@/components/search-bar-avatar";

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
  const isIdle = !showBack && !query;

  return (
    <div className="fixed inset-x-0 top-0 z-43 px-4 py-3 bg-transparent">
      <div className="mx-auto flex h-11 max-w-4xl items-center rounded-full border bg-background shadow-sm">
        {/* Idle: baegop icon + placeholder */}
        {isIdle && (
          <button
            type="button"
            onClick={onTap}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-2"
          >
            <img
              src="/baegop.svg"
              alt="배곱"
              width={20}
              height={20}
              className="shrink-0"
            />
            <span className="truncate text-muted-foreground">
              찾고 싶은 장소가 있나요?
            </span>
          </button>
        )}

        {/* Active: back button */}
        {!isIdle && showBack && (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 cursor-pointer pl-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}

        {/* Active: query text */}
        {!isIdle && (
          <button
            type="button"
            onClick={onTap}
            className={cn(
              "h-full min-w-0 flex-1 cursor-pointer rounded-full text-left",
              showBack ? "pl-3" : "pl-4",
            )}
          >
            <span className="block truncate">{query}</span>
          </button>
        )}

        {/* Idle: avatar */}
        {isIdle && (
          <div className="flex shrink-0 items-center pr-4">
            <SearchBarAvatar />
          </div>
        )}

        {/* Active: clear */}
        {!isIdle && query && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="shrink-0 cursor-pointer pr-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
