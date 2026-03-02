"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapViewButton } from "./map-view-button";

const COMPACT_SNAP = 0.3;
const HALF_SNAP = 0.5;
const FULL_SNAP = 1;
type SnapPoint = number | string;

interface MapResultSheetProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function MapResultSheet({ children, onClose }: MapResultSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expandParam = searchParams.get("expand");

  const [activeSnap, setActiveSnap] = useState<SnapPoint>(
    expandParam ? FULL_SNAP : HALF_SNAP,
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
          className="pointer-events-none fixed inset-x-0 bottom-0 z-41 flex h-dvh flex-col outline-none bg-transparent"
        >
          <div
            className={cn(
              "pointer-events-auto relative flex min-h-0 flex-1 flex-col border-t bg-background shadow-lg transition-[border-radius,border-color] duration-300",
              {
                "rounded-t-2xl": !isFullSnap,
                "rounded-none border-t-transparent": isFullSnap,
              },
            )}
          >
            <Drawer.Title className="sr-only">검색 결과</Drawer.Title>

            {/* <div className="max-w-4xl mx-auto w-full"> */}
            {/* Drag handle & Close button — full snap에서는 검색바 back/clear와 중복이므로 숨김 */}
            {!isFullSnap && (
              <div className="max-w-4xl mx-auto w-full">
                <div className="flex shrink-0 justify-center py-3">
                  <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
                </div>
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
              </div>
            )}

            {/* Content */}
            <div
              ref={contentRef}
              className={cn(
                "min-h-0 flex-1 overscroll-contain mx-auto max-w-4xl w-full",
                {
                  "overflow-y-auto pt-17": isFullSnap,
                  "overflow-hidden": !isFullSnap,
                },
              )}
            >
              {children}
            </div>

            {isFullSnap && (
              <MapViewButton
                scrollRef={contentRef}
                onClick={() => setActiveSnap(COMPACT_SNAP)}
              />
            )}
            {/* </div> */}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
