"use client";

import { useState, useCallback } from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSheetScrollLock } from "@/hooks/use-sheet-scroll-lock";
import { MapPlaceDetail } from "./map-place-detail";
import type { NaverSearchResult } from "@/types";

const COMPACT_SNAP = "200px";
const FULL_SNAP = 1;

type SnapPoint = number | string;

interface MapPlaceDetailSheetProps {
  item: NaverSearchResult;
  onDismiss: () => void;
}

export function MapPlaceDetailSheet({
  item,
  onDismiss,
}: MapPlaceDetailSheetProps) {
  const [activeSnap, setActiveSnap] = useState<SnapPoint>(COMPACT_SNAP);

  const isFullSnap = activeSnap === FULL_SNAP;
  const contentRef = useSheetScrollLock(isFullSnap);

  const handleSnapChange = useCallback((snap: SnapPoint | null) => {
    if (snap !== null) setActiveSnap(snap);
  }, []);

  return (
    <Drawer.Root
      open
      snapPoints={[COMPACT_SNAP, FULL_SNAP]}
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={handleSnapChange}
      modal={false}
      noBodyStyles
      dismissible
      onClose={onDismiss}
    >
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-[45] flex h-dvh flex-col rounded-t-2xl border-t bg-background shadow-lg"
        >
          <Drawer.Title className="sr-only">장소 상세</Drawer.Title>

          {/* Drag handle + close button */}
          <div className="relative flex shrink-0 justify-center py-3">
            <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
            <button
              type="button"
              onClick={onDismiss}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className={cn("flex-1 overscroll-contain", {
              "overflow-y-auto": isFullSnap,
              "overflow-hidden": !isFullSnap,
            })}
          >
            <MapPlaceDetail item={item} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
