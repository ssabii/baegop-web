"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Building2, MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { optimizeNaverImageUrl } from "@/lib/image";
import type { NaverSearchResult } from "@/types";

interface MapResultCardsProps {
  results: NaverSearchResult[];
  activeId: string | null;
  onCardClick: (item: NaverSearchResult) => void;
  scrollToId: string | null;
}

export function MapResultCards({
  results,
  activeId,
  onCardClick,
  scrollToId,
}: MapResultCardsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const setCardRef = useCallback(
    (id: string) => (el: HTMLButtonElement | null) => {
      if (el) {
        cardRefs.current.set(id, el);
      } else {
        cardRefs.current.delete(id);
      }
    },
    [],
  );

  useEffect(() => {
    if (!scrollToId) return;
    const el = cardRefs.current.get(scrollToId);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [scrollToId]);

  if (results.length === 0) return null;

  return (
    <div className="absolute inset-x-0 bottom-4 z-10">
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory scrollbar-none"
      >
        {results.map((item) => (
          <ResultCard
            key={item.id}
            item={item}
            active={item.id === activeId}
            onClick={() => onCardClick(item)}
            ref={setCardRef(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface ResultCardProps {
  item: NaverSearchResult;
  active: boolean;
  onClick: () => void;
}

import { forwardRef } from "react";

const ResultCard = forwardRef<HTMLButtonElement, ResultCardProps>(
  function ResultCard({ item, active, onClick }, ref) {
    const [imgError, setImgError] = useState(false);
    const categoryText = item.category
      ? (item.category.split(">").pop()?.trim() ?? "")
      : "";

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-56 shrink-0 snap-center gap-3 rounded-xl border bg-background p-3 text-left shadow-sm transition-colors cursor-pointer",
          { "ring-2 ring-primary": active },
        )}
      >
        {item.imageUrl && !imgError ? (
          <img
            src={optimizeNaverImageUrl(
              item.imageUrl.replace(/^http:\/\//, "https://"),
            )}
            alt=""
            className="size-14 shrink-0 rounded-lg object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Building2 className="size-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-bold">{item.name}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">
              {item.roadAddress || item.address}
            </span>
          </span>
          {categoryText && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="size-3 shrink-0" />
              <span className="truncate">{categoryText}</span>
            </span>
          )}
        </div>
      </button>
    );
  },
);
