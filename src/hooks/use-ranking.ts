import { useInfiniteQuery } from "@tanstack/react-query";

export interface RankingUser {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  total_points: number;
}

interface RankingResponse {
  items: RankingUser[];
  nextCursor: number | null;
}

const LIMIT = 20;

export function useRanking() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["ranking"],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await fetch(
          `/api/ranking?cursor=${pageParam}&limit=${LIMIT}`,
        );
        if (!res.ok) throw new Error("Failed to fetch ranking");
        return res.json() as Promise<RankingResponse>;
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
