"use client";

import { useRef, useEffect, useMemo } from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import { PlaceItem } from "@/components/place-search/place-item";
import type { NaverSearchResult } from "@/types";

/** Search bar: py-3 (12px) + h-11 (44px) + py-3 (12px) */
const SEARCH_BAR_HEIGHT = 68;

type SnapPoint = "peek" | "half" | "full";

interface MapResultSheetProps {
  results: NaverSearchResult[];
  activeSnapPoint: SnapPoint;
  onSnapPointChange: (snap: SnapPoint) => void;
  onItemClick: (item: NaverSearchResult) => void;
}

export type { SnapPoint };

export function MapResultSheet({
  results,
  activeSnapPoint,
  onSnapPointChange,
  onItemClick,
}: MapResultSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const [fullSnap] = useMemo(() => {
    if (typeof window === "undefined") return [0.9];
    return [(window.innerHeight - SEARCH_BAR_HEIGHT) / window.innerHeight];
  }, []);

  const snapValues = useMemo(
    () => ({ peek: "180px" as string | number, half: 0.45, full: fullSnap }),
    [fullSnap],
  );

  const vaulSnaps = useMemo(
    () => [snapValues.peek, snapValues.half, snapValues.full],
    [snapValues],
  );

  const toSnapPoint = (value: number | string | null): SnapPoint => {
    if (value === snapValues.peek) return "peek";
    if (value === snapValues.half) return "half";
    return "full";
  };

  const isFullSnap = activeSnapPoint === "full";

  useEffect(() => {
    if (!isFullSnap && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isFullSnap]);

  return (
    <Drawer.Root
      open
      snapPoints={vaulSnaps}
      activeSnapPoint={snapValues[activeSnapPoint]}
      setActiveSnapPoint={(v) => onSnapPointChange(toSnapPoint(v))}
      modal={false}
      noBodyStyles
      dismissible={false}
    >
      <Drawer.Portal>
        {isFullSnap && (
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        )}
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-2xl border-t bg-background shadow-lg"
          style={{ maxHeight: `calc(100dvh - ${SEARCH_BAR_HEIGHT}px)` }}
        >
          <Drawer.Title className="sr-only">검색 결과</Drawer.Title>

          {/* Drag handle */}
          <div className="flex justify-center py-3">
            <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Result count */}
          <div className="px-4 pb-3">
            <p className="text-sm font-medium text-muted-foreground">
              검색 결과 {results.length}건
            </p>
          </div>

          {/* Result list */}
          <div
            ref={contentRef}
            className={cn("flex-1 overflow-y-auto px-3", {
              "overflow-hidden": !isFullSnap,
            })}
          >
            {results.map((item) => (
              <PlaceItem
                key={item.id}
                item={item}
                thumbnailSize="lg"
                onClick={() => onItemClick(item)}
              />
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
