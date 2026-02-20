import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  POPULAR_RATING_THRESHOLD,
  POPULAR_MIN_REVIEW_COUNT,
  RECENT_DAYS,
} from "@/lib/constants";

const DEFAULT_LIMIT = 10;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tab = searchParams.get("tab") ?? "popular";
  const cursor = Math.max(Number(searchParams.get("cursor")) || 0, 0);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1),
    50,
  );

  if (tab !== "popular" && tab !== "recent") {
    return NextResponse.json(
      { error: "tab은 popular 또는 recent만 가능합니다" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  if (tab === "popular") {
    const { data: rawPlaces, error } = await supabase
      .from("places")
      .select(
        "id, name, address, category, kona_card_status, image_urls, reviews(rating)",
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const places = (rawPlaces ?? [])
      .map(({ reviews, ...rest }) => {
        const reviewCount = reviews.length;
        const avgRating =
          reviewCount > 0
            ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
            : null;
        return { ...rest, avg_rating: avgRating, review_count: reviewCount };
      })
      .filter(
        (p) =>
          p.avg_rating !== null &&
          p.avg_rating >= POPULAR_RATING_THRESHOLD &&
          p.review_count >= POPULAR_MIN_REVIEW_COUNT,
      )
      .sort(
        (a, b) =>
          b.avg_rating! - a.avg_rating! || b.review_count - a.review_count,
      );

    const items = places.slice(cursor, cursor + limit);
    const nextCursor =
      cursor + limit < places.length ? cursor + limit : null;

    return NextResponse.json({ items, nextCursor });
  }

  // tab === "recent"
  const since = new Date();
  since.setDate(since.getDate() - RECENT_DAYS);

  const { data: rawPlaces, error } = await supabase
    .from("places")
    .select(
      "id, name, address, category, kona_card_status, image_urls, created_at, reviews(rating)",
    )
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .range(cursor, cursor + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (rawPlaces ?? []).map(({ reviews, ...rest }) => {
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
        : null;
    return { ...rest, avg_rating: avgRating, review_count: reviewCount };
  });

  const nextCursor = items.length === limit ? cursor + limit : null;

  return NextResponse.json({ items, nextCursor });
}
