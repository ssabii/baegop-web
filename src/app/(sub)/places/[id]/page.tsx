import { notFound } from "next/navigation";
import {
  Dot,
  ExternalLink,
  Footprints,
  Home,
  Map,
  MapPin,
  Phone,
  Route,
  Star,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  buildNaverPlaceLink,
  buildNaverWalkingRouteLink,
  fetchPlaceDetail,
  fetchPlaceBySearch,
  fetchWalkingRoutes,
} from "@/lib/naver";
import { formatDistance, formatWalkingDuration } from "@/lib/geo";
import { COMPANY_LOCATION } from "@/lib/constants";
import { optimizeNaverImageUrls } from "@/lib/image";
import Link from "next/link";
import { ImageGallery } from "@/components/image-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubHeader } from "@/components/sub-header";
import { PlaceDetailTabs } from "./place-detail-tabs";
import { KonaVoteSection } from "./kona-vote";
import { PlaceActionBar } from "./place-action-bar";
import { StaticMap } from "./static-map";
import type { KonaCardStatus, KonaVote, NaverPlaceDetail } from "@/types";

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: naverPlaceId } = await params;

  const supabase = await createClient();

  // Step 1: 독립적인 요청 병렬 실행
  const [
    { data: place },
    {
      data: { user: authUser },
    },
    naverDetail,
  ] = await Promise.all([
    supabase.from("places").select("*").eq("id", naverPlaceId).single(),
    supabase.auth.getUser(),
    fetchPlaceDetail(naverPlaceId),
  ]);

  const isRegistered = !!place;
  const user = authUser ? { id: authUser.id } : null;

  // Step 2: 네이버 상세 정보 폴백
  let detail: NaverPlaceDetail | null = naverDetail;
  if (!detail && place?.name) {
    detail = await fetchPlaceBySearch(naverPlaceId, place.name);
  }
  if (!detail && place) {
    detail = {
      id: naverPlaceId,
      name: place.name,
      category: place.category ?? "",
      address: place.address ?? "",
      roadAddress: place.address ?? "",
      phone: null,
      x: place.lng?.toString() ?? "",
      y: place.lat?.toString() ?? "",
      imageUrls: optimizeNaverImageUrls(place.image_urls ?? []),
      menus: [],
    };
  }

  if (!detail) notFound();

  // Step 3: 나머지 데이터 병렬 페칭
  const [walkingRoutes, reviewData, konaVoteData] = await Promise.all([
    fetchWalkingRoutes(
      { lng: String(COMPANY_LOCATION.lng), lat: String(COMPANY_LOCATION.lat) },
      { lng: detail.x, lat: detail.y },
    ),
    isRegistered
      ? supabase.from("reviews").select("rating").eq("place_id", place.id)
      : Promise.resolve({ data: null }),
    isRegistered && user
      ? supabase
          .from("kona_card_votes")
          .select("vote")
          .eq("place_id", place.id)
          .eq("user_id", user.id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const walkingRoute = walkingRoutes?.[0] ?? null;
  const ratings = reviewData?.data ?? [];
  const reviewCount = ratings.length;
  const avgRating =
    reviewCount > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;
  const userKonaVote: KonaVote | null =
    (konaVoteData?.data?.vote as KonaVote) ?? null;

  const address = detail.roadAddress || detail.address;
  const naverLink = buildNaverPlaceLink(naverPlaceId);

  return (
    <>
      <SubHeader
        title="장소"
        rightElement={
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="홈으로">
              <Home className="size-5" />
            </Link>
          </Button>
        }
      />
      <main className="mx-auto max-w-4xl pb-30">
        {/* 이미지 갤러리 */}
        <ImageGallery images={detail.imageUrls} alt={detail.name} />

        <div className="space-y-8 p-4">
          {/* 기본 정보 */}
          <section className="space-y-2">
            {!isRegistered && <Badge variant="secondary">미등록 장소</Badge>}
            <h1 className="text-2xl font-bold">{detail.name}</h1>

            {detail.category && (
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Tag className="size-4 shrink-0" />
                {detail.category}
              </div>
            )}
            <p className="flex items-start gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="size-4 shrink-0 mt-0.5" />
              {address}
            </p>
            {walkingRoute && (
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Footprints className="size-4 shrink-0" />
                <div className="flex items-center">
                  <div>
                    {formatWalkingDuration(
                      Math.round(walkingRoute.summary.duration / 60),
                    )}
                  </div>
                  <Dot className="size-4 shrink-0" />
                  <div>{formatDistance(walkingRoute.summary.distance)}</div>
                </div>
              </div>
            )}
            {/* 별점 */}
            {isRegistered && avgRating !== null && (
              <div className="flex items-center gap-1">
                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({reviewCount})
                </span>
              </div>
            )}
          </section>

          {/* 바로가기 버튼 */}
          <section className="flex items-center">
            <a
              href={naverLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 flex-col items-center gap-1.5 py-3 text-foreground active:bg-accent"
            >
              <ExternalLink className="size-5" />
              <span className="text-xs font-medium text-muted-foreground">
                장소보기
              </span>
            </a>
            <div className="h-[42px] w-px shrink-0 bg-border" />
            <a
              href={`https://map.naver.com/p/entry/place/${naverPlaceId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 flex-col items-center gap-1.5 py-3 text-foreground active:bg-accent"
            >
              <Map className="size-5" />
              <span className="text-xs font-medium text-muted-foreground">
                지도보기
              </span>
            </a>
            {walkingRoute && (
              <>
                <div className="h-[42px] w-px shrink-0 bg-border" />
                <a
                  href={buildNaverWalkingRouteLink(COMPANY_LOCATION, {
                    lng: Number(detail.x),
                    lat: Number(detail.y),
                    name: detail.name,
                    placeId: naverPlaceId,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 flex-col items-center gap-1.5 py-3 text-foreground active:bg-accent"
                >
                  <Route className="size-5" />
                  <span className="text-xs font-medium text-muted-foreground">
                    경로보기
                  </span>
                </a>
              </>
            )}
            {detail.phone && (
              <>
                <div className="h-[42px] w-px shrink-0 bg-border" />
                <a
                  href={`tel:${detail.phone}`}
                  className="flex flex-1 flex-col items-center gap-1.5 py-3 text-foreground active:bg-accent"
                >
                  <Phone className="size-5" />
                  <span className="text-xs font-medium text-muted-foreground">
                    전화걸기
                  </span>
                </a>
              </>
            )}
          </section>

          {/* 코나카드 섹션 */}
          {isRegistered && (
            <KonaVoteSection
              placeId={place.id}
              status={(place.kona_card_status as KonaCardStatus) ?? "unknown"}
              userVote={userKonaVote}
              isLoggedIn={!!user}
            />
          )}

          {/* 스태틱 맵 */}
          <StaticMap
            lat={detail.y}
            lng={detail.x}
            naverPlaceId={naverPlaceId}
          />

          {/* 메뉴 / 리뷰 탭 */}
          <PlaceDetailTabs
            menus={detail.menus}
            reviewCount={reviewCount}
            isRegistered={isRegistered}
            placeId={place?.id ?? null}
            naverPlaceId={naverPlaceId}
            currentUserId={user?.id ?? null}
          />
        </div>
      </main>

      <PlaceActionBar
        isRegistered={isRegistered}
        isLoggedIn={!!user}
        naverPlaceId={naverPlaceId}
        placeDetail={detail}
      />
    </>
  );
}
