"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPin, Search, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { findPlaceByNaverPlaceId } from "@/app/(main)/actions";
import type { NaverSearchResult } from "@/types";

interface PlaceSearchProps {
  autoFocus?: boolean;
}

export function PlaceSearch({ autoFocus }: PlaceSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NaverSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const res = await fetch(`/api/naver-search?query=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data: NaverSearchResult[] = await res.json();
      setResults(data);
      setOpen(data.length > 0);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item: NaverSearchResult) {
    setOpen(false);
    setQuery(item.name);
    startTransition(async () => {
      if (item.id) {
        const existing = await findPlaceByNaverPlaceId(item.id);
        if (existing) {
          router.push(`/places/${existing.id}`);
          return;
        }
      }

      // DB에 없으면 프리뷰 페이지로 이동 (상세 정보는 서버에서 placeDetail로 조회)
      router.push(`/places/preview/${item.id}`);
    });
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="장소 이름으로 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            autoFocus={autoFocus}
            className="rounded-full pl-9"
          />
        </div>
      </div>

      {open && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="size-12 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                    <UtensilsCrossed className="size-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    {item.roadAddress || item.address}
                  </span>
                  {item.category && (
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/80">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
