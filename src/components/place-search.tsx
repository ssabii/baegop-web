"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2, MapPin, Search, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NaverSearchResult } from "@/types";

const DEFAULT_DISPLAY = 10;
const AUTOCOMPLETE_LIMIT = 5;

interface PlaceSearchProps {
  autoFocus?: boolean;
}

export function PlaceSearch({ autoFocus }: PlaceSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") ?? "";
  const displayParam = Number(searchParams.get("display")) || DEFAULT_DISPLAY;

  const [input, setInput] = useState(queryParam);
  const [results, setResults] = useState<NaverSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // 팝오버 자동완성
  const [suggestions, setSuggestions] = useState<NaverSearchResult[]>([]);
  const [showPopover, setShowPopover] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const isTyping = input !== queryParam;

  const searchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowPopover(false);
      return;
    }
    const res = await fetch(
      `/api/naver-search?query=${encodeURIComponent(q)}&display=${AUTOCOMPLETE_LIMIT}`,
    );
    if (res.ok) {
      const data: NaverSearchResult[] = await res.json();
      setSuggestions(data);
      setShowPopover(data.length > 0);
    }
  }, []);

  // 디바운스 자동완성 (입력 중일 때만)
  useEffect(() => {
    if (!isTyping) {
      setShowPopover(false);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => searchSuggestions(input), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [input, isTyping, searchSuggestions]);

  useEffect(() => {
    setInput(queryParam);
  }, [queryParam]);

  // 팝오버 외부 클릭 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!queryParam) return;

    const controller = new AbortController();
    setIsLoading(true);

    fetch(
      `/api/naver-search?query=${encodeURIComponent(queryParam)}&display=${displayParam}`,
      { signal: controller.signal },
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((data: NaverSearchResult[]) => setResults(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [queryParam, displayParam]);

  // 팝오버 결과 바뀌면 하이라이트 리셋
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // 하이라이트된 항목 스크롤
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("li");
      items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showPopover || suggestions.length === 0) return;

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
        setShowPopover(false);
        break;
    }
  }

  function handleClear() {
    setInput("");
    setSuggestions([]);
    setShowPopover(false);
    inputRef.current?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length < 2) return;
    setShowPopover(false);
    router.push(`/search?query=${encodeURIComponent(trimmed)}`);
  }

  function handleSelect(item: NaverSearchResult) {
    setShowPopover(false);
    router.push(`/places/${item.id}`);
  }

  const searchBar = (
    <form
      ref={formRef}
      role="search"
      onSubmit={handleSubmit}
      className="relative"
    >
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-5" />
      </button>
      <Input
        ref={inputRef}
        placeholder="장소 이름으로 검색"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        className={`rounded-full pl-10 ${input ? "pr-10" : ""}`}
      />
      {input && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}

      {/* 자동완성 팝오버 */}
      {showPopover && (
        <ul
          ref={listRef}
          className="absolute right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-lg"
        >
          {suggestions.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  index === highlightedIndex ? "bg-accent" : "hover:bg-accent"
                }`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-bold">{item.name}</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">
                      {item.roadAddress || item.address}
                    </span>
                  </span>
                  {item.category && (
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Tag className="size-3 shrink-0" />
                      <span className="truncate">{item.category}</span>
                    </span>
                  )}
                </div>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="size-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <MapPin className="size-5 text-muted-foreground" />
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );

  // 검색 전: 뷰포트 높이에 맞춘 안내 화면
  if (!queryParam) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-5rem)] max-w-4xl flex-col px-4 pt-4">
        {searchBar}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Search className="size-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-semibold">장소를 검색해보세요.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            장소 이름을 입력하면 검색 결과가 나타나요.
          </p>
          <Button className="mt-6" onClick={() => inputRef.current?.focus()}>
            검색 시작하기
          </Button>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-5rem)] max-w-4xl flex-col px-4 pt-4">
        {searchBar}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Loader2 className="size-16 animate-spin text-muted-foreground/30" />
          <p className="mt-4 text-lg font-semibold">검색 중...</p>
          <p className="mt-1 text-sm text-muted-foreground">
            잠시만 기다려주세요.
          </p>
        </div>
      </div>
    );
  }

  // 검색 결과 없음
  if (results.length === 0) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-5rem)] max-w-4xl flex-col px-4 pt-4">
        {searchBar}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Search className="size-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-semibold">검색 결과가 없습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            다른 키워드로 다시 검색해보세요.
          </p>
          <Button className="mt-6" onClick={() => inputRef.current?.focus()}>
            다시 검색하기
          </Button>
        </div>
      </div>
    );
  }

  // 검색 결과 리스트
  return (
    <div className="mx-auto max-w-4xl px-4 pt-4">
      {searchBar}
      <ul className="mt-4 divide-y">
        {results.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleSelect(item)}
              className="flex w-full gap-3 px-1 py-3 text-left transition-colors hover:bg-accent"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-base font-bold">{item.name}</span>
                <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">
                    {item.roadAddress || item.address}
                  </span>
                </span>
                {item.category && (
                  <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                    <Tag className="size-3 shrink-0" />
                    <span className="truncate">{item.category}</span>
                  </span>
                )}
              </div>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="size-20 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <MapPin className="size-5 text-muted-foreground" />
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
