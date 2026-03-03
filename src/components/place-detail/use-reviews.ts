import { useInfiniteQuery } from "@tanstack/react-query";

interface ReviewData {
  id: number;
  rating: number;
  content: string | null;
  created_at: string | null;
  updated_at: string | null;
  place_id: string;
  user_id: string | null;
  image_urls: string[] | null;
  profiles: {
    nickname: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReviewsResponse {
  items: ReviewData[];
  nextCursor: number | null;
}

const LIMIT = 10;

export type { ReviewsResponse };

export function useReviews(
  placeId: string,
  initialData?: ReviewsResponse,
) {
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
      ...(initialData && {
        initialData: {
          pages: [initialData],
          pageParams: [0],
        },
      }),
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
