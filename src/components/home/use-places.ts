import { useInfiniteQuery } from "@tanstack/react-query";
import {
  POPULAR_RATING_THRESHOLD,
  POPULAR_MIN_REVIEW_COUNT,
  QUERY_STALE_TIME,
  RECENT_DAYS,
} from "@/lib/constants";
import type { PlacesOrderBy, PlacesResult } from "@/lib/queries/places";

interface PlacesResponse {
  items: {
    id: string;
    name: string;
    address: string;
    category: string | null;
    kona_card_status: string | null;
    image_urls: string[] | null;
    avg_rating: number | null;
    review_count: number;
  }[];
  nextCursor: number | null;
}

interface TabParams {
  orderBy: PlacesOrderBy;
  ascending: boolean;
  minRating?: number;
  minReviewCount?: number;
  createdAfter?: string;
}

function getRecentCreatedAfter() {
  const since = new Date();
  since.setDate(since.getDate() - RECENT_DAYS);
  return since.toISOString();
}

const TAB_PARAMS: Record<string, TabParams> = {
  recent: {
    orderBy: "created_at",
    ascending: false,
    createdAfter: getRecentCreatedAfter(),
  },
  popular: {
    orderBy: "rating",
    ascending: false,
    minRating: POPULAR_RATING_THRESHOLD,
    minReviewCount: POPULAR_MIN_REVIEW_COUNT,
  },
  all: {
    orderBy: "rating",
    ascending: false,
  },
};

function buildApiUrl(params: TabParams, cursor: number, limit = 10) {
  const query = new URLSearchParams({
    orderBy: params.orderBy,
    ascending: String(params.ascending),
    cursor: String(cursor),
    limit: String(limit),
  });
  if (params.minRating !== undefined) query.set("minRating", String(params.minRating));
  if (params.minReviewCount !== undefined) query.set("minReviewCount", String(params.minReviewCount));
  if (params.createdAfter !== undefined) query.set("createdAfter", params.createdAfter);
  return `/api/places?${query}`;
}

const LIMIT = 10;

export function usePlaces(tab: string, initialData?: PlacesResult) {
  const params = TAB_PARAMS[tab] ?? TAB_PARAMS.recent;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["places", tab],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await fetch(buildApiUrl(params, pageParam as number, LIMIT));
        if (!res.ok) throw new Error("Failed to fetch places");
        return res.json() as Promise<PlacesResponse>;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage: PlacesResponse) => lastPage.nextCursor ?? undefined,
      initialData: initialData
        ? { pages: [initialData], pageParams: [0] }
        : undefined,
      initialDataUpdatedAt: initialData ? Date.now() : undefined,
      staleTime: QUERY_STALE_TIME,
    });

  const places = data?.pages.flatMap((page: PlacesResponse) => page.items) ?? [];

  return {
    places,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
}
