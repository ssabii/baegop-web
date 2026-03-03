"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Drawer } from "vaul";
import {
  Building2,
  ExternalLink,
  MapPin,
  Phone,
  Star,
  Tag,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/components/favorite-button";
import { LoginAlertDialog } from "@/components/login-alert-dialog";
import { KonaCardBadge } from "@/components/place-detail/kona-card-badge";
import { KonaVoteSection } from "@/components/place-detail/kona-vote";
import { PlaceTabs } from "@/components/place-detail/place-tabs";
import { cn } from "@/lib/utils";
import { optimizeNaverImageUrl } from "@/lib/image";
import { usePlaceData } from "@/hooks/use-place-data";
import type { DubaiCookieStore } from "@/data/dubai-cookie-stores";
import { MapViewButton } from "./map-view-button";

const COMPACT_SNAP = "200px";
const HALF_SNAP = 0.5;
const FULL_SNAP = 1;
type SnapPoint = number | string;

interface StoreDrawerProps {
  store: DubaiCookieStore | null;
  onClose: () => void;
}

function StoreDetail({ store }: { store: DubaiCookieStore }) {
  const [imgError, setImgError] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const { data, isLoading } = usePlaceData(store.placeId, {
    x: String(store.lng),
    y: String(store.lat),
  });

  const category = store.category?.split(">").pop()?.trim();
  const isRegistered = !!data?.place;

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

        {isLoading ? (
          <Skeleton className="h-5 w-28" />
        ) : (
          <>
            {isRegistered && data.avgRating !== null && (
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  {data.avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({data.reviewCount})
                </span>
              </div>
            )}
            <div>
              {isRegistered ? (
                <KonaCardBadge status={data.place!.kona_card_status} />
              ) : (
                <Badge variant="secondary">미등록 장소</Badge>
              )}
            </div>
          </>
        )}
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

      {isRegistered && data?.place && (
        <KonaVoteSection
          placeId={data.place.id}
          status={data.place.kona_card_status}
          userVote={data.userKonaVote}
          isLoggedIn={data.isLoggedIn}
          onLoginRequired={() => setLoginDialogOpen(true)}
        />
      )}

      <PlaceTabs
        isRegistered={isRegistered}
        placeId={data?.place?.id ?? null}
        naverPlaceId={store.placeId}
        currentUserId={null}
        reviewCount={data?.reviewCount}
      />

      <LoginAlertDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        description="코나카드 투표는 로그인이 필요해요"
      />
    </div>
  );
}

function StoreDrawerHeader({
  store,
  onClose,
}: {
  store: DubaiCookieStore;
  onClose: () => void;
}) {
  const { data: placeData } = usePlaceData(store.placeId, {
    x: String(store.lng),
    y: String(store.lat),
  });
  const isRegistered = !!placeData?.place;

  return (
    <div className="mx-auto flex w-full max-w-4xl shrink-0 items-center justify-end gap-2 px-4 pb-2">
      {isRegistered && (
        <FavoriteButton placeId={store.placeId} className="size-8 bg-secondary" />
      )}
      <Button
        variant="secondary"
        size="icon-sm"
        onClick={onClose}
        className="rounded-full"
      >
        <X className="size-5" />
      </Button>
    </div>
  );
}

export function StoreDrawer({ store, onClose }: StoreDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expandParam = searchParams.get("expand");

  const [activeSnap, setActiveSnap] = useState<SnapPoint>(
    expandParam ? FULL_SNAP : HALF_SNAP,
  );
  const prevIsFullRef = useRef(activeSnap === FULL_SNAP);
  const contentRef = useRef<HTMLDivElement>(null);

  const isFullSnap = activeSnap === FULL_SNAP;
  const isScrollable = activeSnap === HALF_SNAP || activeSnap === FULL_SNAP;

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

            <StoreDrawerHeader store={store} onClose={onClose} />

            <div
              ref={contentRef}
              className={cn(
                "mx-auto min-h-0 w-full max-w-4xl flex-1 overscroll-contain",
                {
                  "overflow-y-auto": isFullSnap,
                  "overflow-hidden": !isFullSnap,
                },
              )}
            >
              <StoreDetail store={store} />
            </div>

            {isScrollable && (
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
