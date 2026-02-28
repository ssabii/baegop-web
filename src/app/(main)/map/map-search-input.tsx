"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { PlaceItem } from "@/components/place-search/place-item";
import { usePlaceSuggestions } from "@/components/place-search/use-place-suggestions";

interface MapSearchInputProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

export function MapSearchInput({ onSearch, onClear }: MapSearchInputProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isTyping = !submitted && input.length > 0;

  const {
    suggestions,
    popoverOpen,
    setPopoverOpen,
    highlightedIndex,
    isSearching,
    listRef,
    handleKeyDown: suggestionsKeyDown,
    handleClear: suggestionsClear,
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length < 2) return;
    dismissSuggestions();
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
    onClear();
  }

  function handleInputChange(value: string) {
    setInput(value);
    if (submitted) setSubmitted(false);
  }

  return (
    <div className="absolute inset-x-0 top-0 z-50 px-4 py-3">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal>
        <form
          role="search"
          onSubmit={handleSubmit}
          className="relative mx-auto max-w-4xl"
        >
          <PopoverAnchor
            asChild
            className={cn("rounded-full bg-background shadow-sm", {
              "rounded-t-3xl rounded-b-none border-t border-x border-b-0":
                popoverOpen,
              border: !popoverOpen,
            })}
          >
            <div className="relative flex h-11 items-center">
              <Search className="absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="장소 검색"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                className={cn(
                  "h-11 rounded-xl border-none bg-transparent pl-11 focus-visible:ring-0 dark:bg-transparent",
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
                    dismissSuggestions();
                    router.push(`/places/${item.id}`);
                  }}
                />
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
