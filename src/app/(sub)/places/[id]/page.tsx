import { notFound } from "next/navigation";
import { MapPin, Phone, Star, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buildNaverPlaceLink, fetchPlaceDetailWithFallback } from "@/lib/naver";
import { optimizeNaverImageUrls } from "@/lib/image";
import { NaverIcon } from "@/components/naver-icon";
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
      <main className="pb-20">
        {/* 이미지 갤러리 */}
        <ImageGallery images={detail.imageUrls} alt={detail.name} />

        <div className="space-y-8 p-4">
          {/* 기본 정보 */}
          <section className="space-y-2">
            {!isRegistered && <Badge variant="secondary">미등록 장소</Badge>}
            <h1 className="text-2xl font-bold">{detail.name}</h1>

            {detail.category && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Tag className="size-4 shrink-0" />
                {detail.category}
              </p>
            )}
            <p className="flex items-start gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {address}
            </p>
            {detail.phone && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <a href={`tel:${detail.phone}`} className="hover:underline">
                  {detail.phone}
                </a>
              </p>
            )}
            <a
              href={naverLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[#03C75A] hover:underline"
            >
              <NaverIcon className="size-4" />
              네이버에서 보기
            </a>

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
              naverPlaceId={naverPlaceId}
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
