import { useInfiniteQuery } from "@tanstack/react-query";
import { mypageKeys } from "@/lib/query-keys";
import type { FeedbackWithImages } from "@/types";

interface MyFeedbacksResponse {
  items: FeedbackWithImages[];
  nextCursor: number | null;
}

const LIMIT = 10;

export function useMyFeedbacks(userId: string) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: mypageKeys.feedbacks(userId),
      queryFn: async ({ pageParam = 0 }) => {
        const res = await fetch(
          `/api/mypage/feedbacks?cursor=${pageParam}&limit=${LIMIT}`,
        );
        if (!res.ok) throw new Error("Failed to fetch feedbacks");
        return res.json() as Promise<MyFeedbacksResponse>;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const feedbacks = data?.pages.flatMap((page) => page.items) ?? [];

  return {
    feedbacks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
}
