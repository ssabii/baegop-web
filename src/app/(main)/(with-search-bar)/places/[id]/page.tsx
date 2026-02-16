import { notFound } from "next/navigation";
import {
  ExternalLink,
  Footprints,
  MapPin,
  Phone,
  Star,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buildNaverMapLink, fetchPlaceDetail } from "@/lib/naver";
import { COMPANY_LOCATION } from "@/lib/constants";
import { calculateDistance, estimateWalkingMinutes, formatDistance } from "@/lib/geo";
import { ImageGallery } from "@/components/image-gallery";
import { PlaceDetailTabs } from "./place-detail-tabs";
import { KonaVoteSection } from "./kona-vote";
import { RegisterPlaceButton } from "./register-place-button";
import type { KonaCardStatus, KonaVote } from "@/types";

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: naverPlaceId } = await params;

  // 네이버 API에서 상세 정보 조회
  const detail = await fetchPlaceDetail(naverPlaceId);
  if (!detail) notFound();

  // DB에서 장소 조회 (등록 여부 확인)
  const supabase = await createClient();

  const { data: place } = await supabase
    .from("places")
    .select("*")
    .eq("naver_place_id", naverPlaceId)
    .single();

  const isRegistered = !!place;

  // 거리 계산 (네이버 API 좌표 기준)
  const lat = detail.y ? parseFloat(detail.y) : null;
  const lng = detail.x ? parseFloat(detail.x) : null;
  let distanceText: string | null = null;
  if (lat && lng) {
    const meters = calculateDistance(COMPANY_LOCATION, { lat, lng });
    const minutes = estimateWalkingMinutes(meters);
    distanceText = `도보 약 ${minutes}분 (${formatDistance(meters)})`;
  }

  // 등록된 장소인 경우 DB 데이터 조회
  let reviews: ReviewData[] = [];
  let userKonaVote: KonaVote | null = null;
  let user: { id: string } | null = null;

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  user = authUser ? { id: authUser.id } : null;

  if (isRegistered) {
    const { data: reviewData } = await supabase
      .from("reviews")
      .select("*, profiles(nickname, avatar_url)")
      .eq("place_id", place.id)
      .order("created_at", { ascending: false });

    reviews = (reviewData as ReviewData[]) ?? [];

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
  const naverLink = place?.naver_link ?? buildNaverMapLink(detail.name);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return (
    <main className="mx-auto max-w-4xl">
      {/* 이미지 갤러리 */}
      <ImageGallery images={detail.imageUrls} alt={detail.name} />

      <div className="space-y-6 px-4 py-6">
        {/* 기본 정보 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{detail.name}</h1>
            {!isRegistered && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                미등록
              </span>
            )}
          </div>

          {detail.description && (
            <p className="text-sm text-muted-foreground">
              {detail.description}
            </p>
          )}

          {detail.category && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="size-4 shrink-0" />
              {detail.category}
            </p>
          )}
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            {address}
          </p>
          {detail.phone && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4 shrink-0" />
              <a href={`tel:${detail.phone}`} className="hover:underline">
                {detail.phone}
              </a>
            </p>
          )}
          {distanceText && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Footprints className="size-4 shrink-0" />
              {distanceText}
            </p>
          )}
          <a
            href={naverLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="size-4" />
            네이버에서 보기
          </a>

          {/* 장소 등록 버튼 (미등록 + 로그인 상태) */}
          {!isRegistered && user && (
            <RegisterPlaceButton placeDetail={detail} />
          )}

          {/* 별점 + 코나카드 배지 */}
          {isRegistered && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {avgRating !== null && (
                <span className="flex items-center gap-1 text-sm font-medium text-yellow-500">
                  <Star className="size-4 fill-current" />
                  {avgRating.toFixed(1)}
                </span>
              )}
              <KonaVoteSection
                placeId={place.id}
                naverPlaceId={naverPlaceId}
                status={(place.kona_card_status as KonaCardStatus) ?? "unknown"}
                userVote={userKonaVote}
                isLoggedIn={!!user}
              />
            </div>
          )}
        </section>

        {/* 메뉴 / 리뷰 탭 */}
        <PlaceDetailTabs
          menus={detail.menus}
          reviews={reviews}
          isRegistered={isRegistered}
          placeId={place?.id ?? null}
          naverPlaceId={naverPlaceId}
          currentUserId={user?.id ?? null}
          placeDetail={detail}
        />
      </div>
    </main>
  );
}

interface ReviewData {
  id: number;
  rating: number;
  content: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    nickname: string | null;
    avatar_url: string | null;
  } | null;
}
