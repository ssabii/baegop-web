"use client";

import { useRef, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { PlaceItem } from "@/components/place-search/place-item";
import { usePlaceSuggestions } from "@/components/place-search/use-place-suggestions";

interface MapSearchOverlayProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  onClose: () => void;
}

export function MapSearchOverlay({
  initialQuery = "",
  onSearch,
  onClose,
}: MapSearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(false);

  const isTyping = !submitted && input.length > 0;

  const {
    suggestions,
    popoverOpen,
    highlightedIndex,
    isSearching,
    listRef,
    handleKeyDown: suggestionsKeyDown,
    handleClear: suggestionsClear,
    handleFocus,
  } = usePlaceSuggestions({
    inputRef,
    input,
    setInput,
    isTyping,
    onSelect: (item) => {
      onSearch(item.name);
    },
  });

  const hasSuggestions = popoverOpen && suggestions.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length < 2) return;
    setSubmitted(true);
    onSearch(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && highlightedIndex < 0) {
      handleSubmit(e);
      return;
    }

    suggestionsKeyDown(e);
  }

  function handleClear() {
    suggestionsClear();
    setInput("");
    setSubmitted(false);
  }

  function handleInputChange(value: string) {
    setInput(value);
    if (submitted) setSubmitted(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <form
        role="search"
        onSubmit={handleSubmit}
        className="relative mx-auto max-w-4xl px-4 py-3"
      >
        <div
          className={cn("bg-background shadow-sm", {
            "rounded-3xl border": hasSuggestions,
            "rounded-full border": !hasSuggestions,
          })}
        >
          {/* Search input */}
          <div className="relative flex h-11 items-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </button>
            <Input
              ref={inputRef}
              placeholder="장소 검색"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              autoFocus
              className={cn(
                "h-11 rounded-xl border-none bg-transparent pl-12 focus-visible:ring-0 dark:bg-transparent",
                { "pr-12": input },
              )}
            />
            {input && (
              <button
                type="button"
                onClick={handleClear}
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

          {/* Suggestions */}
          {hasSuggestions && (
            <ul ref={listRef} className="max-h-dvh overflow-y-auto">
              {suggestions.map((item, index) => (
                <li key={item.id}>
                  <PlaceItem
                    item={item}
                    thumbnailSize="sm"
                    highlighted={index === highlightedIndex}
                    onClick={() => onSearch(item.name)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </div>
  );
}
