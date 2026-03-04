"use client";

import { ChevronLeft, X } from "lucide-react";

interface DubaiCookieSearchInputProps {
  query: string;
  onTap: () => void;
  onClear: () => void;
  onBack?: () => void;
}

export function DubaiCookieSearchInput({
  query,
  onTap,
  onClear,
  onBack,
}: DubaiCookieSearchInputProps) {
  const isIdle = !query;

  return (
    <div className="fixed inset-x-0 top-0 z-43 bg-transparent px-4 py-3">
      <div className="mx-auto flex h-11 max-w-4xl items-center rounded-full border bg-background shadow-sm">
        {/* Back button (always visible) */}
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 cursor-pointer pl-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Idle: placeholder */}
        {isIdle && (
          <button
            type="button"
            onClick={onTap}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-1 py-2 pl-3"
          >
            <span className="truncate text-muted-foreground">
              두쫀쿠 매장을 검색해보세요
            </span>
          </button>
        )}

        {/* Active: query text */}
        {!isIdle && (
          <button
            type="button"
            onClick={onTap}
            className="h-full min-w-0 flex-1 cursor-pointer rounded-full pl-3 text-left"
          >
            <span className="block truncate">{query}</span>
          </button>
        )}

        {/* Active: clear */}
        {!isIdle && (
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
