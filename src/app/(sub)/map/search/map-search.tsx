"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { SearchBarAvatar } from "@/components/search-bar-avatar";
import { PlaceItem } from "@/components/place-search/place-item";
import { usePlaceSuggestions } from "@/components/place-search/use-place-suggestions";
import { useSearchPlaces } from "@/components/place-search/use-search-places";
import { SearchEmpty } from "@/components/place-search/search-empty";
import { SearchNoResults } from "@/components/place-search/search-no-results";
import { useRecentSearches } from "@/hooks/use-recent-searches";

export function MapSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "";

  const [input, setInput] = useState(initialQuery);
  const [pendingSearch, setPendingSearch] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { searches, addSearch, removeSearch, clearAll } = useRecentSearches(
    "map-recent-searches",
  );

  const isTyping = pendingSearch ? false : input.length > 0;

  const {
    suggestions,
    popoverOpen,
    setPopoverOpen,
    highlightedIndex,
    isSearching,
    listRef,
    handleKeyDown,
    handleClear: suggestionsClear,
    handleFocus,
    dismissSuggestions,
  } = usePlaceSuggestions({
    inputRef,
    input,
    setInput,
    isTyping,
    onSelect: (item) => {
      addSearch(item.name);
      router.push(
        `/map?query=${encodeURIComponent(item.name)}&place=${item.id}`,
      );
    },
  });

  const { results, isLoading } = useSearchPlaces(pendingSearch ?? "");

  // 결과가 있으면 지도 페이지로 이동
  useEffect(() => {
    if (pendingSearch && !isLoading && results.length > 0) {
      router.replace(`/map?query=${encodeURIComponent(pendingSearch)}`);
    }
  }, [pendingSearch, isLoading, results.length, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length < 2) return;
    dismissSuggestions();
    addSearch(trimmed);
    setPendingSearch(trimmed);
  }

  function handleClear() {
    suggestionsClear();
    setPendingSearch(null);
  }

  function handleRecentClick(term: string) {
    dismissSuggestions();
    setInput(term);
    addSearch(term);
    setPendingSearch(term);
  }

  const handleBack = () => {
    dismissSuggestions();
    router.back();
  };

  const noResults = pendingSearch && !isLoading && results.length === 0;
  const showRecent = !pendingSearch && searches.length > 0;

  return (
    <div className="flex h-dvh flex-col">
      <div className="pointer-events-auto fixed inset-x-0 top-0 z-50 px-4 py-3">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal>
          <form
            role="search"
            onSubmit={handleSubmit}
            className="relative mx-auto max-w-4xl"
          >
            <PopoverAnchor
              asChild
              className={cn("bg-background shadow-sm rounded-full", {
                "rounded-t-3xl rounded-b-none border-t border-x border-b-0":
                  popoverOpen,
                border: !popoverOpen,
              })}
            >
              <div className="relative flex h-11 items-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <Input
                  ref={inputRef}
                  placeholder="찾고 싶은 장소가 있나요?"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleFocus}
                  autoFocus={!initialQuery}
                  className={cn(
                    "h-11 bg-transparent dark:bg-transparent border-none rounded-xl pl-12 focus-visible:ring-0",
                    { "pr-12": input },
                  )}
                />
                {input && (
                  <button
                    type="button"
                    onClick={() => handleClear()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {isSearching ? (
                      <Spinner className="size-5" />
                    ) : (
                      <X className="size-5" />
                    )}
                  </button>
                )}
              </div>
            </PopoverAnchor>
          </form>
          <PopoverContent
            align="start"
            sideOffset={0}
            className="w-(--radix-popper-anchor-width) overflow-hidden rounded-t-none rounded-b-3xl border-x border-b bg-background p-0 shadow-sm"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <ul ref={listRef} className="max-h-dvh overflow-y-auto">
              {suggestions.map((item, index) => (
                <li key={item.id}>
                  <PlaceItem
                    item={item}
                    thumbnailSize="sm"
                    highlighted={index === highlightedIndex}
                    onClick={() => {
                      addSearch(item.name);
                      router.push(
                        `/map?query=${encodeURIComponent(item.name)}&place=${item.id}`,
                      );
                    }}
                  />
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </div>

      {/* Empty state */}
      {!pendingSearch && !showRecent && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <SearchEmpty />
        </div>
      )}

      {/* Recent searches */}
      {showRecent && (
        <div className="mx-auto w-full max-w-4xl px-4 pt-[68px]">
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

      {/* Loading */}
      {pendingSearch && isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-8 text-primary" />
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <SearchNoResults />
        </div>
      )}
    </div>
  );
}
