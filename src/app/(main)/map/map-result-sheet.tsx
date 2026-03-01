"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Search bar: py-3 (12px) + h-11 (44px) + py-3 (12px) */
const SEARCH_BAR_HEIGHT = 68;
const COMPACT_SNAP = "200px";
const HALF_SNAP = 0.5;

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
  const [activeSnap, setActiveSnap] = useState<SnapPoint | null>(null);

  const fullSnap = useMemo(() => {
    if (typeof window === "undefined") return 0.9;
    return (window.innerHeight - SEARCH_BAR_HEIGHT) / window.innerHeight;
  }, []);

  const snapPoints = useMemo<SnapPoint[]>(
    () => [COMPACT_SNAP, HALF_SNAP, fullSnap],
    [fullSnap],
  );

  // Sync active snap when compact changes
  useEffect(() => {
    setActiveSnap(compact ? COMPACT_SNAP : HALF_SNAP);
  }, [compact]);

  const isCompact = activeSnap === COMPACT_SNAP;

  // Notify nearTop changes
  useEffect(() => {
    const nearTop = activeSnap === fullSnap;
    if (nearTop !== wasNearTop.current) {
      wasNearTop.current = nearTop;
      onNearTopChange?.(nearTop);
    }
  }, [activeSnap, fullSnap, onNearTopChange]);

  // Scroll to top when entering compact snap
  useEffect(() => {
    if (isCompact && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isCompact]);

  return (
    <Drawer.Root
      open
      snapPoints={snapPoints}
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={setActiveSnap}
      modal={false}
      noBodyStyles
      dismissible={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-40 flex h-dvh flex-col rounded-t-2xl border-t bg-background shadow-lg"
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

          {/* Content — pb-17 compensates for 68px off-screen at fullSnap */}
          <div
            ref={contentRef}
            className={cn("flex-1 pb-17", {
              "overflow-y-auto": !isCompact,
              "overflow-hidden": isCompact,
            })}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
