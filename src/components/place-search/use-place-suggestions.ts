import { useCallback, useEffect, useRef, useState } from "react";
import type { NaverSearchResult } from "@/types";

const AUTOCOMPLETE_LIMIT = 5;

interface UsePlaceSuggestionsOptions {
  inputRef: React.RefObject<HTMLInputElement | null>;
  input: string;
  setInput: (value: string) => void;
  isTyping: boolean;
  onSelect: (item: NaverSearchResult) => void;
}

interface UsePlaceSuggestionsReturn {
  suggestions: NaverSearchResult[];
  popoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
  highlightedIndex: number;
  isSearching: boolean;
  listRef: React.RefObject<HTMLUListElement | null>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleClear: () => void;
  handleFocus: () => void;
  dismissSuggestions: () => void;
}

export function usePlaceSuggestions({
  inputRef,
  input,
  setInput,
  isTyping,
  onSelect,
}: UsePlaceSuggestionsOptions): UsePlaceSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<NaverSearchResult[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const suggestControllerRef = useRef<AbortController>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const skipFocusRef = useRef(false);

  const searchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setPopoverOpen(false);
      setIsSearching(false);
      return;
    }
    suggestControllerRef.current?.abort();
    const controller = new AbortController();
    suggestControllerRef.current = controller;
    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/naver-search?query=${encodeURIComponent(q)}&display=${AUTOCOMPLETE_LIMIT}`,
        { signal: controller.signal },
      );
      if (res.ok) {
        const data: NaverSearchResult[] = await res.json();
        setSuggestions(data);
        setHighlightedIndex(-1);
        setPopoverOpen(data.length > 0);
      }
    } catch {
      // aborted
    } finally {
      if (!controller.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, []);

  // 디바운스 자동완성 (입력 중일 때만)
  useEffect(() => {
    if (!isTyping) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => searchSuggestions(input), 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [input, isTyping, searchSuggestions]);

  // 하이라이트된 항목 스크롤
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("li");
      items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  function handleFocus() {
    if (skipFocusRef.current) {
      skipFocusRef.current = false;
      return;
    }
    // 이미 제안이 있으면 팝오버만 다시 열기 (재검색 방지)
    if (suggestions.length > 0) {
      setPopoverOpen(true);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.nativeEvent.isComposing) return;
    if (!popoverOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case "Enter":
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          e.preventDefault();
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setPopoverOpen(false);
        break;
    }
  }

  function handleClear() {
    setInput("");
    suggestControllerRef.current?.abort();
    setSuggestions([]);
    setPopoverOpen(false);
    setIsSearching(false);
    skipFocusRef.current = true;
    inputRef.current?.focus();
  }

  function dismissSuggestions() {
    if (timerRef.current) clearTimeout(timerRef.current);
    suggestControllerRef.current?.abort();
    setSuggestions([]);
    setPopoverOpen(false);
    setIsSearching(false);
    inputRef.current?.blur();
  }

  function handleSelect(item: NaverSearchResult) {
    dismissSuggestions();
    onSelect(item);
  }

  return {
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
  };
}
