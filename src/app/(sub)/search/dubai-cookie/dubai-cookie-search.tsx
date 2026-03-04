"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  DUBAI_COOKIE_STORES,
  type DubaiCookieStore,
} from "@/data/dubai-cookie-stores";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { formatShortAddress } from "@/lib/address";
import { optimizeNaverImageUrl } from "@/lib/image";
import { cn } from "@/lib/utils";
import { Building2, ChevronLeft, Clock, MapPin, Tag, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";

function StoreListItem({
  store,
  onSelect,
}: {
  store: DubaiCookieStore;
  onSelect: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full cursor-pointer items-center gap-3 px-1 py-3 text-left transition-colors [-webkit-tap-highlight-color:transparent]"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-base font-bold">{store.name}</span>
        {store.category && (
          <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Tag className="size-3 shrink-0" />
            <span>{store.category}</span>
          </span>
        )}
        <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span>{formatShortAddress(store.roadAddress || store.address)}</span>
        </span>
      </div>
      {store.imageUrl && !imgError ? (
        <img
          src={optimizeNaverImageUrl(store.imageUrl)}
          alt=""
          className="size-20 shrink-0 rounded-lg object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Building2 className="size-5 text-muted-foreground" />
        </div>
      )}
    </button>
  );
}

export function DubaiCookieSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "";

  const [input, setInput] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const { searches, addSearch, removeSearch, clearAll } = useRecentSearches(
    "dubai-cookie-recent-searches",
  );

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return DUBAI_COOKIE_STORES.filter((s) => s.name.toLowerCase().includes(q));
  }, [input]);

  const hasInput = input.trim().length > 0;
  const showResults = hasInput && filtered.length > 0;
  const showNoResults = hasInput && filtered.length === 0;
  const showRecent = !hasInput && searches.length > 0;
  const showEmpty = !hasInput && searches.length === 0;

  function navigateToMap(query: string, placeId?: string) {
    const params = new URLSearchParams();
    params.set("query", query);
    if (placeId) params.set("place", placeId);
    router.push(`/map/dubaicookie?${params}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    addSearch(trimmed);
    if (filtered.length > 0) {
      router.replace(`/map/dubaicookie?query=${encodeURIComponent(trimmed)}`);
    }
    // No results → stay on page, inline "검색 결과가 없어요" shown
  }

  function handleSelectStore(store: DubaiCookieStore) {
    addSearch(store.name);
    navigateToMap(store.name, store.placeId);
  }

  function handleRecentClick(term: string) {
    setInput(term);
    addSearch(term);
    const q = term.trim().toLowerCase();
    const results = DUBAI_COOKIE_STORES.filter((s) =>
      s.name.toLowerCase().includes(q),
    );
    if (results.length > 0) {
      router.replace(`/map/dubaicookie?query=${encodeURIComponent(term)}`);
    }
    // No results → stay, input set to term, showNoResults will trigger
  }

  function handleClear() {
    setInput("");
    inputRef.current?.focus();
  }

  function handleBack() {
    router.back();
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Search bar */}
      <div className="fixed inset-x-0 top-0 z-50 px-4 py-3">
        <form
          role="search"
          onSubmit={handleSubmit}
          className="relative mx-auto max-w-4xl"
        >
          <div className="relative flex h-11 items-center rounded-full border bg-background shadow-sm">
            <button
              type="button"
              onClick={handleBack}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </button>
            <Input
              ref={inputRef}
              placeholder="두쫀쿠 매장을 검색해보세요"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus={!initialQuery}
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

      {/* Empty state */}
      {showEmpty && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <Empty className="border-none">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="size-12 rounded-none bg-transparent"
              >
                <img
                  src="/dubai-cookie.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="size-12"
                />
              </EmptyMedia>
              <EmptyTitle className="font-bold">
                두쫀쿠 매장을 검색해보세요
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
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

      {/* Filtered results */}
      {showResults && (
        <div className="mx-auto w-full max-w-4xl overflow-y-auto px-4 pt-[68px]">
          <ul className="divide-y">
            {filtered.map((store) => (
              <li key={store.placeId}>
                <StoreListItem
                  store={store}
                  onSelect={() => handleSelectStore(store)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results */}
      {showNoResults && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <Empty className="border-none">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="size-12 rounded-none bg-transparent"
              >
                <img src="/dubai-cookie.svg" alt="두쫀쿠" className="size-12" />
              </EmptyMedia>
              <EmptyTitle className="font-bold">검색 결과가 없어요</EmptyTitle>
              <EmptyDescription>다른 검색어로 검색해보세요</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
    </div>
  );
}
