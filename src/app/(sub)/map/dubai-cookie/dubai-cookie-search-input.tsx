"use client";

import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";

interface DubaiCookieSearchInputProps {
  onBack: () => void;
  onClear: () => void;
  initialQuery?: string;
}

export function DubaiCookieSearchInput({
  onBack,
  onClear,
  initialQuery = "",
}: DubaiCookieSearchInputProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-43 bg-transparent px-4 py-3">
      <div className="relative mx-auto flex h-11 max-w-4xl items-center rounded-full border bg-background shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-5" />
        </button>
        <Link
          href={
            initialQuery
              ? `/search/dubai-cookie?query=${encodeURIComponent(initialQuery)}`
              : "/search/dubai-cookie"
          }
          className="flex h-full flex-1 items-center pl-12 pr-12"
        >
          {initialQuery ? (
            <span className="truncate text-base">{initialQuery}</span>
          ) : (
            <span className="truncate text-base text-muted-foreground">
              두쫀쿠 매장을 검색해보세요
            </span>
          )}
        </Link>
        {initialQuery && (
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
