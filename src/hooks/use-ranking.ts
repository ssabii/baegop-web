import { useInfiniteQuery } from "@tanstack/react-query";
import { rankingKeys } from "@/lib/query-keys";
import type { RankingResult } from "@/lib/queries/ranking";

export type { RankingUser } from "@/lib/queries/ranking";

const LIMIT = 20;

export function useRanking() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: rankingKeys.all,
      queryFn: async ({ pageParam = 0 }) => {
        const res = await fetch(
          `/api/ranking?cursor=${pageParam}&limit=${LIMIT}`,
        );
        if (!res.ok) throw new Error("Failed to fetch ranking");
        return res.json() as Promise<RankingResult>;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 5 * 60 * 1000,
    });

  const users = data?.pages.flatMap((page) => page.items) ?? [];

  return {
    users,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
}
