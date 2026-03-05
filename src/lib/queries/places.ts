import { createClient } from "@/lib/supabase/server";
import { optimizeNaverImageUrls } from "@/lib/image";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlaceRow {
  id: string;
  name: string;
  address: string;
  category: string | null;
  kona_card_status: string | null;
  image_urls: string[] | null;
  avg_rating: number | null;
  review_count: number;
  [key: string]: unknown;
}

export interface PlacesResult {
  items: PlaceRow[];
  nextCursor: number | null;
}

/**
 * "created_at" → DB-level ORDER + RANGE (efficient, supports incremental pagination)
 * "rating" | "review_count" → JS-level sort after full fetch (reviews are computed)
 */
export type PlacesOrderBy = "created_at" | "rating" | "review_count";

export interface PlacesFilter {
  /** 최소 평점 (avg_rating 기준) */
  minRating?: number;
  /** 최소 리뷰 수 */
  minReviewCount?: number;
  /** ISO string — DB 레벨 gte 필터 */
  createdAfter?: string;
}

export interface FetchPlacesOptions {
  orderBy?: PlacesOrderBy;
  ascending?: boolean;
  filter?: PlacesFilter;
  cursor?: number;
  limit?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KONA_ORDER: Record<string, number> = {
  available: 0,
  unavailable: 1,
  unknown: 2,
};

const DEFAULT_LIMIT = 10;

function computeReviewAggregates(reviews: { rating: number }[]) {
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;
  return { avg_rating: avgRating, review_count: reviewCount };
}

function toPlaceRow(raw: Record<string, unknown>): PlaceRow {
  const { reviews, image_urls, ...rest } = raw;
  const aggregates = computeReviewAggregates(
    (reviews as { rating: number }[]) ?? [],
  );
  return {
    ...rest,
    image_urls: Array.isArray(image_urls)
      ? optimizeNaverImageUrls(image_urls)
      : image_urls,
    ...aggregates,
  } as PlaceRow;
}

function applyFilter(places: PlaceRow[], filter: PlacesFilter): PlaceRow[] {
  return places.filter((p) => {
    if (
      filter.minRating !== undefined &&
      (p.avg_rating === null || p.avg_rating < filter.minRating)
    )
      return false;
    if (
      filter.minReviewCount !== undefined &&
      p.review_count < filter.minReviewCount
    )
      return false;
    return true;
  });
}

function sortByRating(places: PlaceRow[], ascending: boolean): PlaceRow[] {
  return [...places].sort((a, b) => {
    // Primary: avg_rating
    let primary = 0;
    if (a.avg_rating === null && b.avg_rating === null) primary = 0;
    else if (a.avg_rating === null) primary = ascending ? -1 : 1;
    else if (b.avg_rating === null) primary = ascending ? 1 : -1;
    else
      primary = ascending
        ? a.avg_rating - b.avg_rating
        : b.avg_rating - a.avg_rating;

    if (primary !== 0) return primary;

    // Secondary: kona_card_status
    const konaA = KONA_ORDER[String(a.kona_card_status ?? "unknown")] ?? 2;
    const konaB = KONA_ORDER[String(b.kona_card_status ?? "unknown")] ?? 2;
    if (konaA !== konaB) return konaA - konaB;

    // Tertiary: review_count desc, id asc
    return (
      b.review_count - a.review_count ||
      String(a.id).localeCompare(String(b.id))
    );
  });
}

function sortByReviewCount(places: PlaceRow[], ascending: boolean): PlaceRow[] {
  return [...places].sort((a, b) => {
    const primary = ascending
      ? a.review_count - b.review_count
      : b.review_count - a.review_count;
    if (primary !== 0) return primary;

    const konaA = KONA_ORDER[String(a.kona_card_status ?? "unknown")] ?? 2;
    const konaB = KONA_ORDER[String(b.kona_card_status ?? "unknown")] ?? 2;
    return konaA - konaB || String(a.id).localeCompare(String(b.id));
  });
}

function paginate(places: PlaceRow[], cursor: number, limit: number) {
  const items = places.slice(cursor, cursor + limit);
  const nextCursor = cursor + limit < places.length ? cursor + limit : null;
  return { items, nextCursor };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function fetchPlaces({
  orderBy = "created_at",
  ascending = false,
  filter = {},
  cursor = 0,
  limit = DEFAULT_LIMIT,
}: FetchPlacesOptions = {}): Promise<PlacesResult> {
  const supabase = await createClient();

  let query = supabase.from("places").select("*, reviews(rating)");

  if (filter.createdAfter) {
    query = query.gte("created_at", filter.createdAfter);
  }

  // DB-level ordering + pagination — only possible for actual columns
  if (orderBy === "created_at") {
    query = query
      .order("created_at", { ascending })
      .order("id")
      .range(cursor, cursor + limit - 1);
  }

  const { data: rawPlaces, error } = await query;
  if (error) throw new Error(error.message);

  const places = (rawPlaces ?? []).map((raw: Record<string, unknown>) =>
    toPlaceRow(raw),
  );


  if (orderBy === "created_at") {
    const nextCursor = places.length === limit ? cursor + limit : null;
    return { items: places, nextCursor };
  }

  // JS-level: filter → sort → paginate
  const filtered = applyFilter(places, filter);
  const sorted =
    orderBy === "rating"
      ? sortByRating(filtered, ascending)
      : sortByReviewCount(filtered, ascending);

  return paginate(sorted, cursor, limit);
}
