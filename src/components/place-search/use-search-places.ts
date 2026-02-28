import { useInfiniteQuery } from "@tanstack/react-query";
import type { NaverSearchResult } from "@/types";

const DISPLAY = 10;

interface Coords {
  lat: number;
  lng: number;
}

export function useSearchPlaces(query: string, coords?: Coords) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["search-places", query, coords?.lat, coords?.lng],
      queryFn: async ({ pageParam = 1 }) => {
        const params = new URLSearchParams({
          query,
          display: String(DISPLAY),
          start: String(pageParam),
        });
        if (coords) {
          params.set("x", String(coords.lng));
          params.set("y", String(coords.lat));
        }
        const res = await fetch(`/api/naver-search?${params}`);
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
