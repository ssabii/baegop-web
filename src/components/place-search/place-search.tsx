"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { PlaceItem } from "./place-item";
import { usePlaceSuggestions } from "./use-place-suggestions";
import { useSearchPlaces } from "./use-search-places";
import { SearchEmpty } from "./search-empty";
import { SearchNoResults } from "./search-no-results";
import type { NaverSearchResult } from "@/types";

export function PlaceSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") ?? "";

  const [input, setInput] = useState(queryParam);
  const inputRef = useRef<HTMLInputElement>(null);

  const isTyping = input !== queryParam;

  const {
    suggestions,
    popoverOpen,
    setPopoverOpen,
    highlightedIndex,
    isSearching,
    listRef,
    handleKeyDown,
    handleClear,
    handleFocus,
    dismissSuggestions,
  } = usePlaceSuggestions({
    inputRef,
    input,
    setInput,
    isTyping,
    onSelect: (item) => {
      router.push(`/places/${item.id}`);
    },
  });

  const { results, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useSearchPlaces(queryParam);

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  useEffect(() => {
    setInput(queryParam);
  }, [queryParam]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length < 2) return;
    dismissSuggestions();
    router.replace(`/search?query=${encodeURIComponent(trimmed)}`);
  }

  function handleSelect(item: NaverSearchResult) {
    dismissSuggestions();
    router.push(`/places/${item.id}`);
  }

  const hasResults = queryParam && !isLoading && results.length > 0;

  return (
    <div className={cn(!hasResults && "flex h-dvh flex-col")}>
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
                  onClick={() => router.back()}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <Input
                  ref={inputRef}
                  placeholder="장소 검색"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleFocus}
                  autoFocus={!queryParam}
                  className={cn(
                    "h-11 bg-transparent dark:bg-transparent border-none rounded-xl pl-12 focus-visible:ring-0",
                    { "pr-12": input },
                  )}
                />
                {input && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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
            className="w-(--radix-popper-anchor-width) rounded-t-none rounded-b-3xl border-x border-b bg-background p-0 shadow-sm"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <ul
              ref={listRef}
              className="max-h-[calc(100dvh-8rem)] overflow-y-auto"
            >
              {suggestions.map((item, index) => (
                <li key={item.id}>
                  <PlaceItem
                    item={item}
                    thumbnailSize="sm"
                    highlighted={index === highlightedIndex}
                    onClick={() => handleSelect(item)}
                  />
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </div>

      {!queryParam && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <SearchEmpty />
        </div>
      )}

      {queryParam && isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-8 text-primary" />
        </div>
      )}

      {queryParam && !isLoading && results.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <SearchNoResults />
        </div>
      )}

      {hasResults && (
        <div className="mx-auto max-w-4xl px-4 pt-[68px] pb-8">
          <ul className="divide-y">
            {results.map((item) => (
              <li key={item.id}>
                <PlaceItem
                  item={item}
                  thumbnailSize="lg"
                  onClick={() => handleSelect(item)}
                />
              </li>
            ))}
          </ul>
          <div ref={sentinelRef} className="flex justify-center py-4">
            {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
          </div>
        </div>
      )}
    </div>
  );
}
