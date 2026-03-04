"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Drawer } from "vaul";
import { Building2, MapPin, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatShortAddress } from "@/lib/address";
import { optimizeNaverImageUrl } from "@/lib/image";
import type { DubaiCookieStore } from "@/data/dubai-cookie-stores";
import { LocationButton } from "@/components/location-button";
import { SearchInMapButton } from "@/components/search-in-map-button";
import { MapViewButton } from "./map-view-button";

const COMPACT_SNAP = 0.2;
const HALF_SNAP = 0.5;
const FULL_SNAP = 1;
type SnapPoint = number | string;

interface StoreListSheetProps {
  stores: DubaiCookieStore[];
  onSelectStore: (store: DubaiCookieStore) => void;
  onClose: () => void;
  onLocate: (position: { lat: number; lng: number }) => void;
  onSnapChange?: (snap: number | string) => void;
  showSearchInMap?: boolean;
  onSearchInMap?: () => void;
}

function StoreListItem({
  store,
  onSelect,
}: {
  store: DubaiCookieStore;
  onSelect: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full cursor-pointer items-center gap-3 px-1 py-3 text-left transition-colors [-webkit-tap-highlight-color:transparent]"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-base font-bold">{store.name}</span>
        {store.category && (
          <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Tag className="size-3 shrink-0" />
            <span>{store.category}</span>
          </span>
        )}
        <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span>{formatShortAddress(store.roadAddress || store.address)}</span>
        </span>
      </div>
      {store.imageUrl && !imgError ? (
        <img
          src={optimizeNaverImageUrl(store.imageUrl)}
          alt=""
          className="size-20 shrink-0 rounded-lg object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Building2 className="size-5 text-muted-foreground" />
        </div>
      )}
    </button>
  );
}

export function StoreListSheet({
  stores,
  onSelectStore,
  onClose,
  onLocate,
  onSnapChange,
  showSearchInMap = false,
  onSearchInMap,
}: StoreListSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expandParam = searchParams.get("expand");

  const [activeSnap, setActiveSnap] = useState<SnapPoint>(
    expandParam ? FULL_SNAP : HALF_SNAP,
  );
  const prevIsFullRef = useRef(activeSnap === FULL_SNAP);
  const contentRef = useRef<HTMLDivElement>(null);

  const isFullSnap = activeSnap === FULL_SNAP;

  useEffect(() => {
    onSnapChange?.(activeSnap);
  }, [activeSnap, onSnapChange]);

  useEffect(() => {
    if (!isFullSnap && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isFullSnap]);

  // URL sync: expand state
  useEffect(() => {
    if (isFullSnap === prevIsFullRef.current) return;
    prevIsFullRef.current = isFullSnap;

    const params = new URLSearchParams(searchParams);
    if (isFullSnap) {
      params.set("expand", "1");
    } else {
      params.delete("expand");
    }
    router.replace(`/map/dubaicookie?${params}`, { scroll: false });
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
          className="pointer-events-none fixed inset-x-0 bottom-0 z-41 flex h-dvh flex-col bg-transparent outline-none"
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
            <Drawer.Title className="sr-only">매장 목록</Drawer.Title>

            {!isFullSnap && (
              <div className="relative mx-auto w-full max-w-4xl">
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
                <div className="absolute -top-12 right-2">
                  <LocationButton onLocate={onLocate} />
                </div>
                {onSearchInMap && (
                  <SearchInMapButton
                    visible={showSearchInMap}
                    onClick={onSearchInMap}
                    className="bg-[#B0CC50] hover:bg-[#B0CC50]/90 dark:bg-[#8EB035] dark:hover:bg-[#8EB035]/90"
                  />
                )}
              </div>
            )}

            <div
              ref={contentRef}
              className={cn(
                "mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overscroll-contain",
                {
                  "overflow-y-auto pt-17": isFullSnap,
                  "overflow-hidden": !isFullSnap,
                },
              )}
            >
              <ul className="divide-y px-3">
                {stores.map((store) => (
                  <li key={store.placeId}>
                    <StoreListItem
                      store={store}
                      onSelect={() => onSelectStore(store)}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {isFullSnap && (
              <MapViewButton
                scrollRef={contentRef}
                onClick={() => setActiveSnap(COMPACT_SNAP)}
              />
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
