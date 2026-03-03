"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Drawer } from "vaul";
import { Building2, MapPin, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { optimizeNaverImageUrl } from "@/lib/image";
import type { DubaiCookieStore } from "@/data/dubai-cookie-stores";
import { MapViewButton } from "./map-view-button";

const COMPACT_SNAP = 0.3;
const HALF_SNAP = 0.5;
const FULL_SNAP = 1;
type SnapPoint = number | string;

interface StoreListSheetProps {
  stores: DubaiCookieStore[];
  selectedStore: DubaiCookieStore | null;
  onSelectStore: (store: DubaiCookieStore) => void;
  onClose: () => void;
}

function getLastCategory(category: string): string {
  if (!category) return "";
  const parts = category.split(">");
  return parts[parts.length - 1].trim();
}

function StoreListItem({
  store,
  isSelected,
  onSelect,
}: {
  store: DubaiCookieStore;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected]);

  const category = getLastCategory(store.category);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 px-1 py-3 text-left transition-colors [-webkit-tap-highlight-color:transparent]",
        { "bg-accent": isSelected },
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-base font-bold">{store.name}</span>
        {category && (
          <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Tag className="size-3 shrink-0" />
            <span className="truncate">{category}</span>
          </span>
        )}
        <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">
            {store.roadAddress || store.address}
          </span>
        </span>
      </div>
      {store.imageUrl ? (
        <img
          src={optimizeNaverImageUrl(store.imageUrl)}
          alt=""
          className="size-20 shrink-0 rounded-lg object-cover"
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
  selectedStore,
  onSelectStore,
  onClose,
}: StoreListSheetProps) {
  const [activeSnap, setActiveSnap] = useState<SnapPoint>(HALF_SNAP);
  const contentRef = useRef<HTMLDivElement>(null);

  const isFullSnap = activeSnap === FULL_SNAP;

  useEffect(() => {
    if (!isFullSnap && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isFullSnap]);

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
              <div className="mx-auto w-full max-w-4xl">
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

            <div
              ref={contentRef}
              className={cn(
                "mx-auto min-h-0 w-full max-w-4xl flex-1 overscroll-contain",
                {
                  "overflow-y-auto pt-12": isFullSnap,
                  "overflow-hidden": !isFullSnap,
                },
              )}
            >
              <ul className="divide-y px-3">
                {stores.map((store) => (
                  <li key={store.placeId}>
                    <StoreListItem
                      store={store}
                      isSelected={selectedStore?.placeId === store.placeId}
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
