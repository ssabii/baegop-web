"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ExternalLink,
  MapPin,
  Phone,
  Star,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginAlertDialog } from "@/components/login-alert-dialog";
import { KonaCardBadge } from "@/components/place-detail/kona-card-badge";
import { KonaVoteSection } from "@/components/place-detail/kona-vote";
import { PlaceTabs } from "@/components/place-detail/place-tabs";
import { formatShortAddress } from "@/lib/address";
import { optimizeNaverImageUrl } from "@/lib/image";
import { usePlaceData } from "@/hooks/use-place-data";
import type { NaverSearchResult } from "@/types";

interface MapPlaceDetailProps {
  item: NaverSearchResult;
}

export function MapPlaceDetail({ item }: MapPlaceDetailProps) {
  const [imgError, setImgError] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const { data, isLoading } = usePlaceData(item.id, { x: item.x, y: item.y });

  const category = item.category?.split(">").pop()?.trim();
  const isRegistered = !!data?.place;

  return (
    <div className="space-y-3 px-4 pb-8">
      {/* 제목 + 링크 */}
      <Link
        href={`/places/${item.id}`}
        className="inline-flex max-w-full items-start gap-1 group"
      >
        <h3 className="min-w-0 shrink line-clamp-2 text-base font-bold leading-snug group-hover:underline">
          {item.name}
        </h3>
        <ExternalLink className="size-4 shrink-0 text-foreground mt-0.5" />
      </Link>

      <div className="space-y-1">
        {/* 카테고리 */}
        {category && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Tag className="size-3 shrink-0" />
            <span className="truncate">{category}</span>
          </div>
        )}

        {/* 전화번호 */}
        {item.phone && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Phone className="size-3 shrink-0" />
            <a href={`tel:${item.phone}`} className="hover:underline">
              {item.phone}
            </a>
          </div>
        )}

        {/* 주소 */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">
            {formatShortAddress(item.roadAddress || item.address)}
          </span>
        </div>
        {/* 별점 + 코나카드 뱃지 */}
        {isLoading ? (
          <Skeleton className="h-5 w-28" />
        ) : (
          <>
            {isRegistered && data.avgRating !== null && (
              <div className="flex items-center gap-1">
                <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  {data.avgRating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
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

      {/* 썸네일 */}
      {item.imageUrl && !imgError ? (
        <img
          src={optimizeNaverImageUrl(
            item.imageUrl.replace(/^http:\/\//, "https://"),
          )}
          alt=""
          className="h-48 w-full rounded-lg object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center rounded-lg bg-muted">
          <Building2 className="size-8 text-muted-foreground" />
        </div>
      )}

      {/* 코나카드 투표 */}
      {isRegistered && data?.place && (
        <KonaVoteSection
          placeId={data.place.id}
          status={data.place.kona_card_status}
          userVote={data.userKonaVote}
          isLoggedIn={data.isLoggedIn}
          onLoginRequired={() => setLoginDialogOpen(true)}
        />
      )}

      {/* 메뉴 / 리뷰 탭 */}
      <PlaceTabs
        isRegistered={isRegistered}
        placeId={data?.place?.id ?? null}
        naverPlaceId={item.id}
        currentUserId={null}
      />

      <LoginAlertDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        description="코나카드 투표는 로그인이 필요해요"
      />
    </div>
  );
}
