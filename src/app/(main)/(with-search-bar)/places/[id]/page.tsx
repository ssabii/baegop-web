import { notFound } from "next/navigation";
import {
  ExternalLink,
  Flame,
  Footprints,
  MapPin,
  MessageSquare,
  Phone,
  Tag,
  UtensilsCrossed,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buildNaverMapLink, fetchPlaceDetail } from "@/lib/naver";
import { COMPANY_LOCATION } from "@/lib/constants";
import { calculateDistance, estimateWalkingMinutes, formatDistance } from "@/lib/geo";
import { ImageGallery } from "@/components/image-gallery";
import { ReviewSection } from "./review-section";
import { KonaVoteSection } from "./kona-vote";
import { ReviewForm } from "./review-form";
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

          {/* 코나카드 투표 (등록된 장소만) */}
          {isRegistered && (
            <div className="pt-1">
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

        {/* 메뉴 섹션 (네이버 API) */}
        {detail.menus.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <UtensilsCrossed className="size-5" />
              메뉴 ({detail.menus.length})
            </h2>
            <ul className="mt-4 divide-y rounded-lg border">
              {detail.menus.map((menu) => (
                <li key={menu.name} className="flex items-center gap-3 px-4 py-3">
                  {menu.images.length > 0 ? (
                    <img
                      src={menu.images[0]}
                      alt={menu.name}
                      className="size-14 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted">
                      <UtensilsCrossed className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{menu.name}</span>
                        {menu.recommend && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            <Flame className="size-3" />
                            추천
                          </span>
                        )}
                      </div>
                      {menu.description && (
                        <span className="text-xs text-muted-foreground">
                          {menu.description}
                        </span>
                      )}
                    </div>
                    {menu.price && (
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {Number(menu.price).toLocaleString()}원
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 리뷰 섹션 */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquare className="size-5" />
            리뷰 ({reviews.length})
          </h2>
          <div className="mt-4">
            {isRegistered ? (
              <ReviewSection
                placeId={place.id}
                naverPlaceId={naverPlaceId}
                reviews={reviews}
                currentUserId={user?.id ?? null}
              />
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-dashed p-4">
                  <p className="text-sm font-medium">
                    리뷰를 작성하면 장소가 등록됩니다
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    첫 리뷰를 남겨주세요!
                  </p>
                </div>
                {user && <ReviewForm placeDetail={detail} />}
              </div>
            )}
          </div>
        </section>
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
