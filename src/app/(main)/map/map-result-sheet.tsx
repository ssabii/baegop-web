"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import { useSheetScrollLock } from "@/hooks/use-sheet-scroll-lock";

const HALF_SNAP = 0.5;
const FULL_SNAP = 1;

type SnapPoint = number | string;

interface MapResultSheetProps {
  children: React.ReactNode;
  onNearTopChange?: (nearTop: boolean) => void;
}

export function MapResultSheet({
  children,
  onNearTopChange,
}: MapResultSheetProps) {
  const wasNearTop = useRef(false);
  const [activeSnap, setActiveSnap] = useState<SnapPoint>(HALF_SNAP);

  const isFullSnap = activeSnap === FULL_SNAP;
  const contentRef = useSheetScrollLock(isFullSnap);

  const handleSnapChange = useCallback((snap: SnapPoint | null) => {
    if (snap !== null) setActiveSnap(snap);
  }, []);

  // Notify nearTop changes
  useEffect(() => {
    const nearTop = activeSnap === FULL_SNAP;
    if (nearTop !== wasNearTop.current) {
      wasNearTop.current = nearTop;
      onNearTopChange?.(nearTop);
    }
  }, [activeSnap, onNearTopChange]);

  return (
    <Drawer.Root
      open
      snapPoints={[HALF_SNAP, FULL_SNAP]}
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={handleSnapChange}
      modal={false}
      noBodyStyles
      dismissible={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-[41] flex h-dvh flex-col rounded-t-2xl border-t bg-background shadow-lg"
        >
          <Drawer.Title className="sr-only">검색 결과</Drawer.Title>

          {/* Drag handle */}
          <div className="flex shrink-0 justify-center py-3">
            <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Content — only scroll at fullSnap, drag to expand at other snaps */}
          <div
            ref={contentRef}
            className={cn("flex-1 overscroll-contain", {
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
