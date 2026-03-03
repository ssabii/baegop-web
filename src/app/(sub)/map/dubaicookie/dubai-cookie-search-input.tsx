"use client";

import { useRef, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DubaiCookieSearchInputProps {
  onBack: () => void;
  onSearch: (query: string) => void;
  onClear: () => void;
  initialQuery?: string;
}

export function DubaiCookieSearchInput({
  onBack,
  onSearch,
  onClear,
  initialQuery = "",
}: DubaiCookieSearchInputProps) {
  const [active, setActive] = useState(!!initialQuery);
  const [value, setValue] = useState(initialQuery);
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync URL → state when initialQuery changes externally (browser back/forward)
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setValue(initialQuery);
    setActive(!!initialQuery);
  }

  const handleActivate = () => {
    setActive(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleClear = () => {
    setValue("");
    setActive(false);
    onClear();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSearch(trimmed);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-43 bg-transparent px-4 py-3">
      <div className="mx-auto flex h-11 max-w-4xl items-center rounded-full border bg-background shadow-sm">
        {/* Back button — idle: 페이지 이탈, active: 검색 해제 */}
        <button
          type="button"
          onClick={active ? handleClear : onBack}
          className="shrink-0 cursor-pointer pl-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-5" />
        </button>

        {!active ? (
          <button
            type="button"
            onClick={handleActivate}
            className="min-w-0 flex-1 cursor-pointer py-2 pl-3 pr-4 text-left"
          >
            <span className="truncate text-muted-foreground">
              두쫀쿠 매장을 검색해보세요
            </span>
          </button>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="min-w-0 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="매장 이름 검색"
                className={cn(
                  "h-full w-full bg-transparent pl-3 pr-2 text-sm outline-none",
                  "placeholder:text-muted-foreground",
                )}
              />
            </form>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="shrink-0 cursor-pointer pr-4 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
