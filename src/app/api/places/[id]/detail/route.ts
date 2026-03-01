import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { COMPANY_LOCATION } from "@/lib/constants";
import { fetchWalkingRoutes } from "@/lib/naver";
import { optimizeSupabaseImageUrl } from "@/lib/image";
import type { KonaCardStatus, KonaVote } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: naverPlaceId } = await params;
  const { searchParams } = request.nextUrl;
  const x = searchParams.get("x") ?? "";
  const y = searchParams.get("y") ?? "";

  const supabase = await createClient();

  // Step 1: DB 장소 조회 + 인증 확인 (병렬)
  const [{ data: place }, { data: { user: authUser } }] = await Promise.all([
    supabase.from("places").select("*").eq("id", naverPlaceId).single(),
    supabase.auth.getUser(),
  ]);

  const isRegistered = !!place;
  const isLoggedIn = !!authUser;

  // Step 2: 등록 장소면 추가 데이터 병렬 조회
  const walkingRouteQuery =
    x && y
      ? fetchWalkingRoutes(
          { lng: String(COMPANY_LOCATION.lng), lat: String(COMPANY_LOCATION.lat) },
          { lng: x, lat: y },
        )
      : Promise.resolve(null);

  const reviewStatsQuery = isRegistered
    ? supabase
        .from("reviews")
        .select("rating", { count: "exact" })
        .eq("place_id", place.id)
    : Promise.resolve({ data: null, count: null });

  const konaVoteQuery =
    isRegistered && isLoggedIn
      ? supabase
          .from("kona_card_votes")
          .select("vote")
          .eq("place_id", place.id)
          .eq("user_id", authUser!.id)
          .single()
      : Promise.resolve({ data: null });

  const [walkingRoutes, reviewStatsResult, konaVoteResult] = await Promise.all([
    walkingRouteQuery,
    reviewStatsQuery,
    konaVoteQuery,
  ]);

  // Step 3: 데이터 가공
  const walkingRoute = walkingRoutes?.[0] ?? null;
  const reviews = reviewStatsResult?.data ?? [];
  const reviewCount = reviewStatsResult?.count ?? 0;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return NextResponse.json({
    place: place
      ? {
          id: place.id,
          name: place.name,
          kona_card_status: (place.kona_card_status as KonaCardStatus) ?? "unknown",
          image_urls: place.image_urls,
        }
      : null,
    avgRating,
    reviewCount,
    userKonaVote: (konaVoteResult?.data?.vote as KonaVote) ?? null,
    isLoggedIn,
    walkingRoute: walkingRoute
      ? {
          distance: walkingRoute.summary.distance,
          duration: walkingRoute.summary.duration,
        }
      : null,
  });
}
