"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
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
      {/* Search bar */}
      <form
        role="search"
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-b px-4 py-3"
      >
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 cursor-pointer p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder="장소 검색"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            autoFocus
            className={cn(
              "h-10 rounded-lg border-none bg-muted pl-3 focus-visible:ring-0 dark:bg-muted",
              { "pr-10": input },
            )}
          />
          {input ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              {isSearching ? (
                <Spinner className="size-4" />
              ) : (
                <X className="size-4" />
              )}
            </button>
          ) : (
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
        </div>
      </form>

      {/* Suggestions list */}
      <ul ref={listRef} className="overflow-y-auto" style={{ maxHeight: "calc(100dvh - 65px)" }}>
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
    </div>
  );
}
