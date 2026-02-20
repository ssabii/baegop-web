"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { PlaceItem } from "./place-item";
import { usePlaceSuggestions } from "./use-place-suggestions";
import type { NaverSearchResult } from "@/types";

interface PlaceSearchProps {
  autoFocus?: boolean;
  initialResults?: NaverSearchResult[] | null;
}

export function PlaceSearch({
  autoFocus,
  initialResults = null,
}: PlaceSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") ?? "";

  const [input, setInput] = useState(queryParam);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isTyping = input !== queryParam;

  const {
    suggestions,
    showPopover,
    highlightedIndex,
    isSearching,
    listRef,
    handleKeyDown,
    handleClear,
    dismissSuggestions,
  } = usePlaceSuggestions({
    inputRef,
    formRef,
    input,
    setInput,
    isTyping,
    onSelect: (item) => {
      router.push(`/places/${item.id}`);
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
    router.push(`/search?query=${encodeURIComponent(trimmed)}`);
  }

  function handleSelect(item: NaverSearchResult) {
    dismissSuggestions();
    router.push(`/places/${item.id}`);
  }

  const searchBar = (
    <div className="sticky top-0 z-40 pt-4 pb-3">
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
          className={`bg-sidebar border-none rounded-full pl-10 ${input ? "pr-10" : ""}`}
        />
        {input && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {isSearching ? (
              <Spinner className="size-4" />
            ) : (
              <X className="size-4" />
            )}
          </button>
        )}

        {/* 자동완성 팝오버 */}
        {showPopover && (
          <ul
            ref={listRef}
            className="absolute right-0 left-0 z-50 mt-2 max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-xl border-popover bg-popover shadow-lg"
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
        )}
      </form>
    </div>
  );

  // 검색 전: 뷰포트 높이에 맞춘 안내 화면
  if (!queryParam) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-5rem)] max-w-4xl flex-col px-4">
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

  // 최초 검색 대기 (서버 응답 전)
  if (initialResults === null) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-5rem)] max-w-4xl flex-col px-4">
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
  if (initialResults.length === 0) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-5rem)] max-w-4xl flex-col px-4">
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
    <div className="mx-auto max-w-4xl px-4">
      {searchBar}
      <ul className="mt-4 divide-y">
        {initialResults.map((item) => (
          <li key={item.id}>
            <PlaceItem
              item={item}
              thumbnailSize="lg"
              onClick={() => handleSelect(item)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
