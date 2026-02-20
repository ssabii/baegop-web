import { useInfiniteQuery } from "@tanstack/react-query";
import type { NaverSearchResult } from "@/types";

const DISPLAY = 10;

export function useSearchPlaces(query: string) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["search-places", query],
      queryFn: async ({ pageParam = 1 }) => {
        const res = await fetch(
          `/api/naver-search?query=${encodeURIComponent(query)}&display=${DISPLAY}&start=${pageParam}`,
        );
        if (!res.ok) throw new Error("Search failed");
        return res.json() as Promise<NaverSearchResult[]>;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, _allPages, lastPageParam) => {
        if (lastPage.length < DISPLAY) return undefined;
        return lastPageParam + DISPLAY;
      },
      enabled: !!query,
    });

  const results = data?.pages.flat() ?? [];

  return {
    results,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
}
