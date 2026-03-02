import { ImageGallery } from "@/components/image-gallery";
import { SubHeader } from "@/components/sub-header";
import { Button } from "@/components/ui/button";
import { COMPANY_LOCATION } from "@/lib/constants";
import { formatDistance, formatWalkingDuration } from "@/lib/geo";
import { optimizeNaverImageUrls, optimizeSupabaseImageUrl } from "@/lib/image";
import {
  fetchPlaceBySearch,
  fetchPlaceDetail,
  fetchWalkingRoutes,
} from "@/lib/naver";
import { createClient } from "@/lib/supabase/server";
import type { KonaCardStatus, KonaVote, NaverPlaceDetail } from "@/types";
import { FavoriteButton } from "@/components/favorite-button";
import { Dot, Footprints, Home, MapPin, Phone, Star, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KonaCardBadge } from "@/components/place-detail/kona-card-badge";
import { KonaVoteSection } from "@/components/place-detail/kona-vote";
import { UnregisteredBadge } from "@/components/place-detail/unregistered-badge";
import { PlaceActionBar } from "./place-action-bar";
import { PlaceMap } from "./place-map";
import { PlaceShortcuts } from "./place-shortcuts";
import { PlaceTabsWithUrl } from "./place-tabs-with-url";

export default async function PlaceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id: naverPlaceId }] = await Promise.all([params, searchParams]);

  const supabase = await createClient();

  // Step 1: 독립적인 요청 병렬 실행
  const placeQuery = supabase
    .from("places")
    .select("*")
    .eq("id", naverPlaceId)
    .single();
  const authQuery = supabase.auth.getUser();
  const naverDetailQuery = fetchPlaceDetail(naverPlaceId);

  const [{ data: place }, { data: { user: authUser } }, naverDetail] =
    await Promise.all([placeQuery, authQuery, naverDetailQuery]);

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
  const PAGE_SIZE = 10;
  const walkingRouteQuery = fetchWalkingRoutes(
    { lng: String(COMPANY_LOCATION.lng), lat: String(COMPANY_LOCATION.lat) },
    { lng: detail.x, lat: detail.y },
  );
  const reviewsQuery = isRegistered
    ? supabase
        .from("reviews")
        .select(
          "*, profiles(nickname, avatar_url), review_images(url, display_order)",
          { count: "exact" },
        )
        .eq("place_id", place.id)
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1)
    : Promise.resolve({ data: null, count: null });
  const konaVoteQuery =
    isRegistered && user
      ? supabase
          .from("kona_card_votes")
          .select("vote")
          .eq("place_id", place.id)
          .eq("user_id", user.id)
          .single()
      : Promise.resolve({ data: null });

  const [walkingRoutes, reviewsResult, konaVoteResult] = await Promise.all([
    walkingRouteQuery,
    reviewsQuery,
    konaVoteQuery,
  ]);

  // Step 4: 데이터 가공
  const walkingRoute = walkingRoutes?.[0] ?? null;
  const userKonaVote = (konaVoteResult?.data?.vote as KonaVote) ?? null;
  const address = detail.roadAddress || detail.address;

  const reviews = reviewsResult?.data ?? [];
  const reviewCount = reviewsResult?.count ?? 0;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  const initialReviews = {
    items: reviews.map((review) => ({
      ...review,
      review_images:
        review.review_images?.map((img) => ({
          ...img,
          url: optimizeSupabaseImageUrl(img.url),
        })) ?? [],
    })),
    nextCursor: reviews.length === PAGE_SIZE ? PAGE_SIZE : null,
  };

  const initialMenus = {
    items: detail.menus.slice(0, PAGE_SIZE),
    nextCursor: detail.menus.length > PAGE_SIZE ? PAGE_SIZE : null,
  };

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
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-bold">{detail.name}</h1>
              {isRegistered && <FavoriteButton placeId={naverPlaceId} />}
            </div>

            {detail.category && (
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Tag className="size-4 shrink-0" />
                {detail.category}
              </div>
            )}
            {detail.phone && (
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <a href={`tel:${detail.phone}`}>{detail.phone}</a>
              </div>
            )}
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
            {address && (
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                <span className="[text-decoration:none]">{address}</span>
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
            {/* 뱃지 */}
            <div className="flex items-center gap-2">
              {!isRegistered && <UnregisteredBadge />}
              {isRegistered && (
                <KonaCardBadge
                  status={
                    (place.kona_card_status as KonaCardStatus) ?? "unknown"
                  }
                />
              )}
            </div>
          </section>

          {/* 장소 맵 */}
          <PlaceMap
            lat={detail.y}
            lng={detail.x}
            name={detail.name}
          />

          {/* 바로가기 버튼 */}
          <PlaceShortcuts
            naverPlaceId={naverPlaceId}
            detail={detail}
            walkingRoute={walkingRoute}
          />

          {/* 코나카드 섹션 */}
          {isRegistered && (
            <KonaVoteSection
              placeId={place.id}
              status={(place.kona_card_status as KonaCardStatus) ?? "unknown"}
              userVote={userKonaVote}
              isLoggedIn={!!user}
              showLoginAlert={!user}
            />
          )}

          {/* 메뉴 / 리뷰 탭 */}
          <PlaceTabsWithUrl
            isRegistered={isRegistered}
            placeId={place?.id ?? null}
            naverPlaceId={naverPlaceId}
            currentUserId={user?.id ?? null}
            initialMenus={initialMenus}
            initialReviews={initialReviews}
            menuCount={detail.menus.length}
            reviewCount={reviewCount}
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
