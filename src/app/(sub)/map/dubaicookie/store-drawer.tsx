"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Drawer } from "vaul";
import {
  Building2,
  ExternalLink,
  MapPin,
  Phone,
  Tag,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { optimizeNaverImageUrl } from "@/lib/image";
import type { DubaiCookieStore } from "@/data/dubai-cookie-stores";
import { useStoreMenus } from "./use-store-menus";

const COMPACT_SNAP = "200px";
const HALF_SNAP = 0.5;
const FULL_SNAP = 1;
type SnapPoint = number | string;

interface StoreDrawerProps {
  store: DubaiCookieStore | null;
  onClose: () => void;
}

function getLastCategory(category: string): string {
  if (!category) return "";
  const parts = category.split(">");
  return parts[parts.length - 1].trim();
}

function MenuSection({ placeId }: { placeId: string }) {
  const { data, isLoading } = useStoreMenus(placeId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <UtensilsCrossed className="size-4" />
          <span>메뉴</span>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    );
  }

  if (!data?.items?.length) return null;

  const menus = data.items;
  const hasMore = data.nextCursor !== null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <UtensilsCrossed className="size-4" />
        <span>메뉴</span>
      </div>
      <ul className="space-y-1 text-sm">
        {menus.map((menu) => (
          <li key={menu.name} className="flex justify-between">
            <span className="truncate">{menu.name}</span>
            {menu.price && (
              <span className="shrink-0 text-muted-foreground">
                {menu.price}
              </span>
            )}
          </li>
        ))}
      </ul>
      {hasMore && (
        <p className="text-xs text-muted-foreground">+더 많은 메뉴</p>
      )}
    </div>
  );
}

function StoreDetail({ store }: { store: DubaiCookieStore }) {
  const [imgError, setImgError] = useState(false);
  const category = getLastCategory(store.category);

  return (
    <div className="space-y-4 px-4 pb-8">
      <div className="space-y-1">
        <Link
          href={`/places/${store.placeId}`}
          className="group inline-flex max-w-full items-start gap-1 pr-12"
        >
          <h3 className="min-w-0 shrink text-xl font-bold leading-snug group-hover:underline">
            {store.name}
          </h3>
          <ExternalLink className="mt-1.5 size-4 shrink-0 text-foreground" />
        </Link>

        {category && (
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Tag className="size-3 shrink-0" />
            <span>{category}</span>
          </div>
        )}

        {store.phone && (
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Phone className="size-3 shrink-0" />
            <a href={`tel:${store.phone}`} className="hover:underline">
              {store.phone}
            </a>
          </div>
        )}

        <div className="flex items-start gap-1 text-sm font-medium text-muted-foreground">
          <MapPin className="mt-0.5 size-3 shrink-0" />
          <span>{store.roadAddress || store.address}</span>
        </div>
      </div>

      <Link href={`/places/${store.placeId}`} className="block">
        {store.imageUrl && !imgError ? (
          <img
            src={optimizeNaverImageUrl(store.imageUrl)}
            alt=""
            className="h-48 w-full rounded-lg object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-lg bg-muted">
            <Building2 className="size-8 text-muted-foreground" />
          </div>
        )}
      </Link>

      <MenuSection placeId={store.placeId} />
    </div>
  );
}

export function StoreDrawer({ store, onClose }: StoreDrawerProps) {
  const [activeSnap, setActiveSnap] = useState<SnapPoint>(HALF_SNAP);
  const contentRef = useRef<HTMLDivElement>(null);

  const isFullSnap = activeSnap === FULL_SNAP;
  const isScrollable = activeSnap === HALF_SNAP || activeSnap === FULL_SNAP;

  useEffect(() => {
    if (!isFullSnap && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isFullSnap]);

  // store 변경 시 snap 리셋
  useEffect(() => {
    if (store) setActiveSnap(HALF_SNAP);
  }, [store]);

  const handleSnapChange = useCallback((snap: SnapPoint | null) => {
    if (snap !== null) setActiveSnap(snap);
  }, []);

  if (!store) return null;

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
          className="pointer-events-none fixed inset-x-0 bottom-0 z-45 flex h-dvh flex-col outline-none"
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
            <Drawer.Title className="sr-only">매장 상세</Drawer.Title>

            <div className="flex shrink-0 justify-center py-3">
              <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="mx-auto flex w-full max-w-4xl shrink-0 items-center justify-end gap-2 px-4 pb-2">
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="size-5" />
              </Button>
            </div>

            <div
              ref={contentRef}
              className={cn(
                "mx-auto min-h-0 w-full max-w-4xl flex-1 overscroll-contain",
                {
                  "overflow-y-auto": isScrollable,
                  "overflow-hidden": !isScrollable,
                },
              )}
            >
              <StoreDetail store={store} />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
