"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { stripHtml } from "@/lib/naver";
import { findOrCreateRestaurant } from "@/app/(main)/actions";
import type { NaverSearchResult } from "@/types";

export function RestaurantSearch() {
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
    setQuery(stripHtml(item.title));
    startTransition(async () => {
      await findOrCreateRestaurant(item);
    });
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="맛집 이름으로 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-9"
        />
      </div>

      {open && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
          {results.map((item, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                <span className="text-sm font-medium">{stripHtml(item.title)}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  {item.roadAddress || item.address}
                </span>
                {item.category && (
                  <span className="text-xs text-muted-foreground">{item.category}</span>
                )}
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
