"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Clock, PackageOpen, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  DUBAI_COOKIE_STORES,
  type DubaiCookieStore,
} from "@/data/dubai-cookie-stores";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { optimizeNaverImageUrl } from "@/lib/image";
import { Building2 } from "lucide-react";

export function DubaiCookieSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(initialQuery);

  const { searches, addSearch, removeSearch, clearAll } = useRecentSearches(
    "dubai-cookie-recent-searches",
  );

  const suggestions = useMemo(() => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed.length < 1) return [];
    return DUBAI_COOKIE_STORES.filter(
      (store) =>
        store.name.toLowerCase().includes(trimmed) ||
        store.address.toLowerCase().includes(trimmed) ||
        store.roadAddress.toLowerCase().includes(trimmed),
    ).slice(0, 10);
  }, [input]);

  const showSuggestions = input.trim().length >= 1 && suggestions.length > 0;
  const noResults = input.trim().length >= 1 && suggestions.length === 0;
  const showRecent = !input.trim() && searches.length > 0;
  const showEmpty = !input.trim() && searches.length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    inputRef.current?.blur();
    addSearch(trimmed);
    router.push(`/map/dubai-cookie?query=${encodeURIComponent(trimmed)}`);
  }

  function handleSelectStore(store: DubaiCookieStore) {
    addSearch(store.name);
    router.push(
      `/map/dubai-cookie?query=${encodeURIComponent(store.name)}&place=${store.placeId}`,
    );
  }

  function handleRecentClick(term: string) {
    addSearch(term);
    router.push(`/map/dubai-cookie?query=${encodeURIComponent(term)}`);
  }

  function handleClear() {
    setInput("");
    inputRef.current?.focus();
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Search header */}
      <div className="pointer-events-auto fixed inset-x-0 top-0 z-50 px-4 py-3">
        <form
          role="search"
          onSubmit={handleSubmit}
          className="relative mx-auto max-w-4xl"
        >
          <div className="relative flex h-11 items-center rounded-full border bg-background shadow-sm">
            <button
              type="button"
              onClick={() => router.back()}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </button>
            <Input
              ref={inputRef}
              placeholder="두쫀쿠 매장을 검색해보세요"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              className={cn(
                "h-11 rounded-xl border-none bg-transparent pl-12 text-base placeholder:text-base focus-visible:ring-0 dark:bg-transparent",
                { "pr-12": input },
              )}
            />
            {input && (
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-[68px]">
        {/* Empty state */}
        {showEmpty && (
          <div className="flex h-full flex-col items-center justify-center">
            <Empty className="border-none">
              <EmptyHeader className="gap-1">
                <EmptyMedia
                  variant="icon"
                  className="size-12 rounded-none bg-transparent"
                >
                  <Search className="size-12 text-primary" />
                </EmptyMedia>
                <EmptyTitle className="font-bold">
                  매장을 검색해보세요
                </EmptyTitle>
                <EmptyDescription>
                  매장명이나 주소로 검색할 수 있어요
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}

        {/* Recent searches */}
        {showRecent && (
          <div className="mx-auto w-full max-w-4xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">최근 검색어</h2>
              <button
                type="button"
                onClick={clearAll}
                className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                전체 삭제
              </button>
            </div>
            <ul className="mt-2">
              {searches.map((term) => (
                <li key={term} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleRecentClick(term)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-2.5 text-left transition-colors hover:bg-accent"
                  >
                    <Clock className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm">{term}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSearch(term)}
                    className="shrink-0 cursor-pointer p-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && (
          <ul className="mx-auto max-w-4xl divide-y">
            {suggestions.map((store) => (
              <li key={store.placeId}>
                <button
                  type="button"
                  onClick={() => handleSelectStore(store)}
                  className="flex w-full cursor-pointer items-center gap-3 py-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg">
                    {store.imageUrl ? (
                      <img
                        src={optimizeNaverImageUrl(store.imageUrl)}
                        alt={store.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-muted">
                        <Building2 className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{store.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {store.roadAddress}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* No results */}
        {noResults && (
          <div className="flex h-full flex-col items-center justify-center">
            <Empty className="border-none">
              <EmptyHeader className="gap-1">
                <EmptyMedia
                  variant="icon"
                  className="size-12 rounded-none bg-transparent"
                >
                  <PackageOpen className="size-12 text-primary" />
                </EmptyMedia>
                <EmptyTitle className="font-bold">
                  검색 결과가 없어요
                </EmptyTitle>
                <EmptyDescription>
                  다른 검색어로 검색해보세요
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </div>
    </div>
  );
}
