import { useQuery } from "@tanstack/react-query";

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
    staleTime: 5 * 60 * 1000,
  });

  return {
    favoriteIds: new Set(data ?? []),
    isLoading,
  };
}
