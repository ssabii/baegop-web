import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  POPULAR_RATING_THRESHOLD,
  POPULAR_MIN_REVIEW_COUNT,
  RECENT_DAYS,
} from "@/lib/constants";
import { optimizeNaverImageUrls } from "@/lib/image";

const DEFAULT_LIMIT = 10;

const KONA_ORDER: Record<string, number> = {
  available: 0,
  unavailable: 1,
  unknown: 2,
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tab = searchParams.get("tab") ?? "popular";
  const cursor = Math.max(Number(searchParams.get("cursor")) || 0, 0);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1),
    50,
  );

  if (tab !== "popular" && tab !== "recent" && tab !== "all") {
    return NextResponse.json(
      { error: "tab은 popular, recent, all만 가능합니다" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  if (tab === "all") {
    const { data: rawPlaces, error } = await supabase
      .from("places")
      .select(
        "id, name, address, category, kona_card_status, image_urls, reviews(rating)",
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const places = (rawPlaces ?? [])
      .map(({ reviews, image_urls, ...rest }) => {
        const reviewCount = reviews.length;
        const avgRating =
          reviewCount > 0
            ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
            : null;
        return {
          ...rest,
          image_urls: image_urls ? optimizeNaverImageUrls(image_urls) : image_urls,
          avg_rating: avgRating,
          review_count: reviewCount,
        };
      })
      .sort((a, b) => {
        // 1. 별점 내림차순
        if (a.avg_rating === null && b.avg_rating === null) {
          // 둘 다 별점 없으면 코나카드 비교로
        } else if (a.avg_rating === null) return 1;
        else if (b.avg_rating === null) return -1;
        else {
          const ratingDiff = b.avg_rating - a.avg_rating;
          if (ratingDiff !== 0) return ratingDiff;
        }

        // 2. 코나카드 available 우선
        const konaA = KONA_ORDER[a.kona_card_status ?? "unknown"] ?? 2;
        const konaB = KONA_ORDER[b.kona_card_status ?? "unknown"] ?? 2;
        if (konaA !== konaB) return konaA - konaB;

        // 3. 리뷰 수, ID
        return b.review_count - a.review_count || a.id.localeCompare(b.id);
      });

    const items = places.slice(cursor, cursor + limit);
    const nextCursor =
      cursor + limit < places.length ? cursor + limit : null;

    return NextResponse.json({ items, nextCursor });
  }

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
      .map(({ reviews, image_urls, ...rest }) => {
        const reviewCount = reviews.length;
        const avgRating =
          reviewCount > 0
            ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
            : null;
        return {
          ...rest,
          image_urls: image_urls ? optimizeNaverImageUrls(image_urls) : image_urls,
          avg_rating: avgRating,
          review_count: reviewCount,
        };
      })
      .filter(
        (p) =>
          p.avg_rating !== null &&
          p.avg_rating >= POPULAR_RATING_THRESHOLD &&
          p.review_count >= POPULAR_MIN_REVIEW_COUNT,
      )
      .sort((a, b) => {
        const ratingDiff = b.avg_rating! - a.avg_rating!;
        if (ratingDiff !== 0) return ratingDiff;

        const konaA = KONA_ORDER[a.kona_card_status ?? "unknown"] ?? 2;
        const konaB = KONA_ORDER[b.kona_card_status ?? "unknown"] ?? 2;
        if (konaA !== konaB) return konaA - konaB;

        return b.review_count - a.review_count || a.id.localeCompare(b.id);
      });

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
    .order("id")
    .range(cursor, cursor + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (rawPlaces ?? []).map(({ reviews, image_urls, ...rest }) => {
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
        : null;
    return {
      ...rest,
      image_urls: image_urls ? optimizeNaverImageUrls(image_urls) : image_urls,
      avg_rating: avgRating,
      review_count: reviewCount,
    };
  });

  const nextCursor = items.length === limit ? cursor + limit : null;

  return NextResponse.json({ items, nextCursor });
}
