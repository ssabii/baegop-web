"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const expandParam = searchParams.get("expand");

  const [activeSnap, setActiveSnap] = useState<SnapPoint>(
    expandParam ? FULL_SNAP : COMPACT_SNAP,
  );
  const prevIsFullRef = useRef(activeSnap === FULL_SNAP);

  const isFullSnap = activeSnap === FULL_SNAP;
  const contentRef = useRef<HTMLDivElement>(null);

  // compact snap으로 돌아올 때 스크롤 위치 리셋
  useEffect(() => {
    if (!isFullSnap && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isFullSnap]);

  // 시트 상단이 뷰포트 상단 ~8% 영역에 진입하면 isAtTop = true
  const { ref: sentinelRef, inView: isAtTop } = useInView({
    rootMargin: "0px 0px -92% 0px",
  });

  // URL 동기화: expand 상태 변경 시 querystring 업데이트
  useEffect(() => {
    if (isFullSnap === prevIsFullRef.current) return;
    prevIsFullRef.current = isFullSnap;

    const params = new URLSearchParams(searchParams);
    if (isFullSnap) {
      params.set("expand", "1");
    } else {
      params.delete("expand");
    }
    router.replace(`/map?${params}`, { scroll: false });
  }, [isFullSnap, searchParams, router]);

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
      dismissible={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] flex h-dvh flex-col"
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
            {/* Sentinel: 시트 상단이 뷰포트 탑에 닿는지 감지 */}
            <div ref={sentinelRef} />

            <Drawer.Title className="sr-only">장소 상세</Drawer.Title>

            {/* Drag handle */}
            <div className="flex shrink-0 justify-center py-3">
              <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Close button */}
            <div className="flex shrink-0 justify-end px-4 pb-2">
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={onDismiss}
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
              <MapPlaceDetail item={item} />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
