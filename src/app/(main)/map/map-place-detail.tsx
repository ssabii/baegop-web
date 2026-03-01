"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Dot,
  ExternalLink,
  Footprints,
  MapPin,
  Phone,
  Route,
  Star,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { LoginAlertDialog } from "@/components/login-alert-dialog";
import { KonaCardBadge } from "@/components/place-detail/kona-card-badge";
import { KonaVoteSection } from "@/components/place-detail/kona-vote";
import { PlaceTabs } from "@/components/place-detail/place-tabs";
import { formatShortAddress } from "@/lib/address";
import { COMPANY_LOCATION } from "@/lib/constants";
import {
  calculateDistance,
  estimateWalkingMinutes,
  formatDistance,
  formatWalkingDuration,
} from "@/lib/geo";
import { optimizeNaverImageUrl } from "@/lib/image";
import { buildNaverWalkingRouteLink } from "@/lib/naver";
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

  // 도보 정보: API 데이터 우선, 없으면 Haversine 추정
  const haversineDistance = calculateDistance(
    { lat: COMPANY_LOCATION.lat, lng: COMPANY_LOCATION.lng },
    { lat: Number(item.y), lng: Number(item.x) },
  );
  const walkingDistance = data?.walkingRoute?.distance ?? haversineDistance;
  const walkingMinutes = data?.walkingRoute
    ? Math.round(data.walkingRoute.duration / 60)
    : estimateWalkingMinutes(haversineDistance);

  const shortcuts = [
    {
      key: "map",
      href: `https://map.naver.com/p/entry/place/${item.id}`,
      icon: MapPin,
      label: "지도보기",
      external: true,
    },
    {
      key: "route",
      href: buildNaverWalkingRouteLink(COMPANY_LOCATION, {
        lng: Number(item.x),
        lat: Number(item.y),
        name: item.name,
        placeId: item.id,
      }),
      icon: Route,
      label: "경로보기",
      external: true,
    },
    ...(item.phone
      ? [
          {
            key: "phone",
            href: `tel:${item.phone}`,
            icon: Phone,
            label: "전화걸기",
            external: false,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4 px-4 pb-8">
      {/* 기본 정보 */}
      <div className="space-y-1">
        <div>
          {/* 코나카드 뱃지 / 미등록 뱃지 — 최상단 */}
          {!isLoading && isRegistered && (
            <KonaCardBadge status={data.place!.kona_card_status} />
          )}
          {!isLoading && !isRegistered && (
            <Badge variant="secondary">미등록 장소</Badge>
          )}
        </div>
        {/* 제목 + 링크 */}
        <Link
          href={`/places/${item.id}`}
          className="flex flex-wrap items-start gap-x-1.5 gap-y-0 group"
        >
          <h3 className="min-w-0 flex-1 line-clamp-2 text-base font-bold leading-snug group-hover:underline">
            {item.name}
          </h3>
          <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        </Link>

        {/* 별점 */}
        {!isLoading && isRegistered && data.avgRating !== null && (
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

        {/* 카테고리 */}
        {category && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Tag className="size-3 shrink-0" />
            <span className="truncate">{category}</span>
          </div>
        )}

        {/* 도보 정보 */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Footprints className="size-3 shrink-0" />
          <span>{formatWalkingDuration(walkingMinutes)}</span>
          <Dot className="size-3 shrink-0" />
          <span>{formatDistance(walkingDistance)}</span>
        </div>

        {/* 주소 */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">
            {formatShortAddress(item.roadAddress || item.address)}
          </span>
        </div>
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

      {/* 바로가기 버튼 */}
      <ButtonGroup className="w-full rounded-xl">
        {shortcuts.map(({ key, href, icon: Icon, label, external }) => (
          <Button
            key={key}
            variant="outline"
            size="lg"
            className="flex-1 flex-col min-[375px]:flex-row gap-1 min-[375px]:gap-1.5 h-auto px-0 has-[>svg]:px-0 py-3 rounded-xl"
            asChild
          >
            <a
              href={href}
              {...(external && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
            >
              <Icon className="size-5" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </a>
          </Button>
        ))}
      </ButtonGroup>

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
