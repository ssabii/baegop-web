import { optimizeNaverImageUrls } from "@/lib/image";
import { createClient } from "@/lib/supabase/server";

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
 * 모든 정렬은 places의 집계 컬럼(avg_rating, review_count)을 사용해
 * DB 레벨 ORDER + RANGE로 처리한다. (집계 컬럼은 reviews 트리거로 유지 — 020 참조)
 */
export type PlacesOrderBy = "created_at" | "rating" | "review_count";

export interface PlacesFilter {
  /** 최소 평점 (avg_rating 기준) */
  minRating?: number;
  /** 최소 리뷰 수 */
  minReviewCount?: number;
  /** ISO string — created_at gte 필터 */
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

const DEFAULT_LIMIT = 10;

function toPlaceRow(raw: Record<string, unknown>): PlaceRow {
  const { image_urls, ...rest } = raw;
  return {
    ...rest,
    image_urls: Array.isArray(image_urls)
      ? optimizeNaverImageUrls(image_urls)
      : image_urls,
  } as PlaceRow;
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

  let query = supabase.from("places").select("*");

  if (filter.createdAfter) {
    query = query.gte("created_at", filter.createdAfter);
  }
  if (filter.minRating !== undefined) {
    query = query.gte("avg_rating", filter.minRating);
  }
  if (filter.minReviewCount !== undefined) {
    query = query.gte("review_count", filter.minReviewCount);
  }

  // DB 레벨 정렬 + 페이지네이션 (집계 컬럼 기반). id를 최종 tie-breaker로 안정 정렬.
  if (orderBy === "rating") {
    query = query
      .order("avg_rating", { ascending, nullsFirst: ascending })
      .order("review_count", { ascending: false })
      .order("id", { ascending: true });
  } else if (orderBy === "review_count") {
    query = query
      .order("review_count", { ascending })
      .order("id", { ascending: true });
  } else {
    query = query
      .order("created_at", { ascending })
      .order("id", { ascending: true });
  }

  query = query.range(cursor, cursor + limit - 1);

  const { data: rawPlaces, error } = await query;
  if (error) throw new Error(error.message);

  const places = (rawPlaces ?? []).map((raw: Record<string, unknown>) =>
    toPlaceRow(raw),
  );

  const nextCursor = places.length === limit ? cursor + limit : null;
  return { items: places, nextCursor };
}
