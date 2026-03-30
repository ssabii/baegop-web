import { useQuery } from "@tanstack/react-query";
import { QUERY_STALE_TIME } from "@/lib/constants";
import { recommendKeys } from "@/lib/query-keys";
import type { NaverSearchResult } from "@/types";

export function useRecommendPlaces(lat: number, lng: number) {
  const { data, isLoading } = useQuery({
    queryKey: recommendKeys.places(lat, lng),
    queryFn: async () => {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
      });
      const res = await fetch(`/api/smart-around?${params}`);
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json() as Promise<NaverSearchResult[]>;
    },
    staleTime: QUERY_STALE_TIME,
  });

  return {
    places: data ?? [],
    isLoading,
  };
}
