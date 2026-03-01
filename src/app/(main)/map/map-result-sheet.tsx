"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

/** Search bar: py-3 (12px) + h-11 (44px) + py-3 (12px) */
const SEARCH_BAR_HEIGHT = 68;
const COMPACT_SNAP = "200px";
const HALF_SNAP = 0.5;

type SnapPoint = number | string;

interface MapResultSheetProps {
  children: React.ReactNode;
  onNearTopChange?: (nearTop: boolean) => void;
  compact?: boolean;
}

export function MapResultSheet({
  children,
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

  const isFullSnap = activeSnap === fullSnap;

  // Notify nearTop changes
  useEffect(() => {
    const nearTop = activeSnap === fullSnap;
    if (nearTop !== wasNearTop.current) {
      wasNearTop.current = nearTop;
      onNearTopChange?.(nearTop);
    }
  }, [activeSnap, fullSnap, onNearTopChange]);

  // Scroll to top when leaving full snap
  useEffect(() => {
    if (!isFullSnap && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isFullSnap]);

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

          {/* Drag handle */}
          <div className="flex shrink-0 justify-center py-3">
            {!compact && (
              <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
            )}
          </div>

          {/* Content — only scroll at fullSnap, drag to expand at other snaps */}
          <div
            ref={contentRef}
            className={cn("flex-1 pb-17", {
              "overflow-y-auto": isFullSnap,
              "overflow-hidden": !isFullSnap,
            })}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
