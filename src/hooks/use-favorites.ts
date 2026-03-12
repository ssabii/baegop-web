import { useQuery } from "@tanstack/react-query";
import { QUERY_STALE_TIME } from "@/lib/constants";

export const favoritesQueryKey = ["favorites"];

export function useFavorites() {
  const { data, isLoading } = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) return [];
      const { placeIds } = await res.json();
      return placeIds as string[];
    },
    staleTime: QUERY_STALE_TIME,
  });

  return {
    favoriteIds: new Set(data ?? []),
    isLoading,
  };
}
