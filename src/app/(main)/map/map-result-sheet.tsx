"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";

/** Search bar: py-3 (12px) + h-11 (44px) + py-3 (12px) */
const SEARCH_BAR_HEIGHT = 68;
const COMPACT_SNAP = "200px";

type SnapPoint = number | string;

interface MapResultSheetProps {
  children: React.ReactNode;
  onClose: () => void;
  onNearTopChange?: (nearTop: boolean) => void;
  compact?: boolean;
}

export function MapResultSheet({
  children,
  onClose,
  onNearTopChange,
  compact,
}: MapResultSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const wasNearTop = useRef(false);

  const fullSnap = useMemo(() => {
    if (typeof window === "undefined") return 0.9;
    return (window.innerHeight - SEARCH_BAR_HEIGHT) / window.innerHeight;
  }, []);

  const listSnaps = useMemo<SnapPoint[]>(
    () => ["180px", 0.45, fullSnap],
    [fullSnap],
  );

  const compactSnaps = useMemo<SnapPoint[]>(() => [COMPACT_SNAP], []);

  const snapPoints = compact ? compactSnaps : listSnaps;
  const activeSnap = compact ? COMPACT_SNAP : 0.45;

  const isFullSnap = !compact && activeSnap === fullSnap;

  useEffect(() => {
    if (!isFullSnap && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isFullSnap]);

  const handleSnapChange = useCallback(
    (snap: SnapPoint | null) => {
      const nearTop = snap === fullSnap;
      if (nearTop !== wasNearTop.current) {
        wasNearTop.current = nearTop;
        onNearTopChange?.(nearTop);
      }
    },
    [fullSnap, onNearTopChange],
  );

  // Reset nearTop when switching to compact
  useEffect(() => {
    if (compact && wasNearTop.current) {
      wasNearTop.current = false;
      onNearTopChange?.(false);
    }
  }, [compact, onNearTopChange]);

  return (
    <Drawer.Root
      open
      snapPoints={snapPoints}
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={handleSnapChange}
      modal={false}
      noBodyStyles
      dismissible={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-2xl border-t bg-background shadow-lg"
          style={{ maxHeight: `calc(100dvh - ${SEARCH_BAR_HEIGHT}px)` }}
        >
          <Drawer.Title className="sr-only">검색 결과</Drawer.Title>

          {/* Drag handle + close button */}
          <div className="relative flex shrink-0 justify-center py-3">
            {!compact && (
              <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
            )}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="닫기"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto"
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
