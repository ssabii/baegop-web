import { notFound } from "next/navigation";
import {
  Dot,
  ExternalLink,
  Footprints,
  MapPin,
  Phone,
  Star,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  buildNaverPlaceLink,
  buildNaverWalkingRouteLink,
  fetchPlaceDetailWithFallback,
  fetchWalkingRoutes,
} from "@/lib/naver";
import { formatDistance, formatWalkingDuration } from "@/lib/geo";
import { COMPANY_LOCATION } from "@/lib/constants";
import { optimizeNaverImageUrls } from "@/lib/image";
import { ImageGallery } from "@/components/image-gallery";
import { Badge } from "@/components/ui/badge";
import { SubHeader } from "@/components/sub-header";
import { PlaceDetailTabs } from "./place-detail-tabs";
import { KonaVoteSection } from "./kona-vote";
import { PlaceActionBar } from "./place-action-bar";
import type { KonaCardStatus, KonaVote, NaverPlaceDetail } from "@/types";

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: naverPlaceId } = await params;

  const supabase = await createClient();

  const { data: place } = await supabase
    .from("places")
    .select("*")
    .eq("id", naverPlaceId)
    .single();

  const isRegistered = !!place;

  let detail: NaverPlaceDetail | null = await fetchPlaceDetailWithFallback(
    naverPlaceId,
    place?.name,
  );

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

  const walkingRoutes = await fetchWalkingRoutes(
    { lng: String(COMPANY_LOCATION.lng), lat: String(COMPANY_LOCATION.lat) },
    { lng: detail.x, lat: detail.y },
  );
  const walkingRoute = walkingRoutes?.[0] ?? null;
  console.log("walkingRoutes", walkingRoutes);

  let reviewCount = 0;
  let avgRating: number | null = null;
  let userKonaVote: KonaVote | null = null;
  let user: { id: string } | null = null;

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  user = authUser ? { id: authUser.id } : null;

  if (isRegistered) {
    const { data: reviewData } = await supabase
      .from("reviews")
      .select("rating")
      .eq("place_id", place.id);

    const ratings = reviewData ?? [];
    reviewCount = ratings.length;
    avgRating =
      reviewCount > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : null;

    if (user) {
      const { data: vote } = await supabase
        .from("kona_card_votes")
        .select("vote")
        .eq("place_id", place.id)
        .eq("user_id", user.id)
        .single();
      userKonaVote = (vote?.vote as KonaVote) ?? null;
    }
  }

  const address = detail.roadAddress || detail.address;
  const naverLink = buildNaverPlaceLink(naverPlaceId);

  return (
    <>
      <SubHeader title="장소" />
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
              <span>
                {address}{" "}
                <a
                  href={naverLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="네이버 플레이스에서 보기"
                  className="inline-flex align-text-bottom"
                >
                  <ExternalLink className="size-4 text-muted-foreground hover:text-accent-foreground" />
                </a>
              </span>
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
                <a
                  href={buildNaverWalkingRouteLink(COMPANY_LOCATION, {
                    lng: Number(detail.x),
                    lat: Number(detail.y),
                    name: detail.name,
                    placeId: naverPlaceId,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center justify-center"
                >
                  <ExternalLink className="size-4 text-muted-foreground hover:text-accent-foreground" />
                </a>
              </div>
            )}
            {detail.phone && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <a href={`tel:${detail.phone}`} className="underline">
                  {detail.phone}
                </a>
              </p>
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

          {/* 코나카드 섹션 */}
          {isRegistered && (
            <KonaVoteSection
              placeId={place.id}
              status={(place.kona_card_status as KonaCardStatus) ?? "unknown"}
              userVote={userKonaVote}
              isLoggedIn={!!user}
            />
          )}

          {/* 메뉴 / 리뷰 탭 */}
          <PlaceDetailTabs
            menus={detail.menus}
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
