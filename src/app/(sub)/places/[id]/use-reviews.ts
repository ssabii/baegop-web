import { useInfiniteQuery } from "@tanstack/react-query";

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
  review_images: {
    url: string;
    display_order: number;
  }[];
}

interface ReviewsResponse {
  items: ReviewData[];
  nextCursor: number | null;
}

const LIMIT = 10;

export function useReviews(placeId: string) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["reviews", placeId],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await fetch(
          `/api/places/${placeId}/reviews?cursor=${pageParam}&limit=${LIMIT}`,
        );
        if (!res.ok) throw new Error("Failed to fetch reviews");
        return res.json() as Promise<ReviewsResponse>;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const reviews = data?.pages.flatMap((page) => page.items) ?? [];

  return {
    reviews,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
}
