"use client";

import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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
  const [value, setValue] = useState(initialQuery);
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);

  // Sync URL → state when initialQuery changes externally (browser back/forward)
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setValue(initialQuery);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  const handleClear = () => {
    setValue("");
    onClear();
  };

  return (
    <div className="fixed inset-x-0 top-0 z-43 bg-transparent px-4 py-3">
      <form
        role="search"
        onSubmit={handleSubmit}
        className="relative mx-auto max-w-4xl"
      >
        <div className="relative flex h-11 items-center rounded-full border bg-background shadow-sm">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>
          <Input
            placeholder="두쫀쿠 매장을 검색해보세요"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={cn(
              "h-11 rounded-xl border-none bg-transparent pl-12 text-base placeholder:text-base focus-visible:ring-0 dark:bg-transparent",
              { "pr-12": value },
            )}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
