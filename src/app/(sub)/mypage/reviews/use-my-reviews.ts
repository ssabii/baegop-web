import { useInfiniteQuery } from "@tanstack/react-query";

interface ReviewPlace {
  id: number;
  name: string;
}

interface MyReview {
  id: number;
  rating: number;
  content: string | null;
  created_at: string | null;
  places: ReviewPlace | null;
}

interface MyReviewsResponse {
  items: MyReview[];
  nextCursor: number | null;
}

const LIMIT = 10;

export function useMyReviews(userId: string) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["mypage", "reviews", userId],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await fetch(
          `/api/mypage/reviews?cursor=${pageParam}&limit=${LIMIT}`,
        );
        if (!res.ok) throw new Error("Failed to fetch reviews");
        return res.json() as Promise<MyReviewsResponse>;
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
