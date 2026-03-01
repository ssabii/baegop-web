"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COMPACT_SNAP = 0.3;
const HALF_SNAP = 0.5;
const FULL_SNAP = 1;
const PROGRESS_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

type SnapPoint = number | string;

interface MapResultSheetProps {
  children: React.ReactNode;
  onClose: () => void;
  onTopProgress?: (progress: number) => void;
}

export function MapResultSheet({
  children,
  onClose,
  onTopProgress,
}: MapResultSheetProps) {
  const [activeSnap, setActiveSnap] = useState<SnapPoint>(COMPACT_SNAP);
  const [isAtTop, setIsAtTop] = useState(false);

  const isFullSnap = activeSnap === FULL_SNAP;
  const contentRef = useRef<HTMLDivElement>(null);

  // compact snap으로 돌아올 때 스크롤 위치 리셋
  useEffect(() => {
    if (!isFullSnap && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isFullSnap]);

  // 시트 상단이 검색바 영역에 접근하면 progress 0→1 전달
  const { ref: sentinelRef } = useInView({
    threshold: PROGRESS_THRESHOLDS,
    rootMargin: "0px 0px -80% 0px",
    onChange: (_inView, entry) => {
      const progress = entry.intersectionRatio;
      setIsAtTop(progress > 0.9);
      onTopProgress?.(progress);
    },
  });

  const handleSnapChange = useCallback((snap: SnapPoint | null) => {
    if (snap !== null) setActiveSnap(snap);
  }, []);

  return (
    <Drawer.Root
      open
      snapPoints={[COMPACT_SNAP, HALF_SNAP, FULL_SNAP]}
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={handleSnapChange}
      modal={false}
      noBodyStyles
      dismissible={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[41] flex h-dvh flex-col"
        >
          <div
            className={cn(
              "pointer-events-auto flex min-h-0 flex-1 flex-col border-t bg-background shadow-lg transition-[border-radius,border-color] duration-300",
              {
                "rounded-t-2xl": !isAtTop,
                "rounded-none border-t-transparent": isAtTop,
              },
            )}
          >
            {/* Sentinel: 검색바 영역 접근 감지 (160px 높이로 그라데이션 진행) */}
            <div className="pointer-events-none relative shrink-0">
              <div
                ref={sentinelRef}
                className="absolute inset-x-0 top-0 h-[160px]"
              />
            </div>

            <Drawer.Title className="sr-only">검색 결과</Drawer.Title>

            {/* Drag handle */}
            <div className="flex shrink-0 justify-center py-3">
              <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Close button */}
            <div className="flex shrink-0 justify-end px-4 pb-2">
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="size-5" />
              </Button>
            </div>

            {/* Content */}
            <div
              ref={contentRef}
              className={cn("min-h-0 flex-1 overscroll-contain", {
                "overflow-y-auto": isFullSnap,
                "overflow-hidden": !isFullSnap,
              })}
            >
              {children}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
