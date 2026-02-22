import { useInfiniteQuery } from "@tanstack/react-query";

interface PlaceCardData {
  id: string;
  name: string;
  address: string;
  category: string | null;
  kona_card_status: string | null;
  image_urls: string[] | null;
  avg_rating: number | null;
  review_count: number;
}

interface PlacesResponse {
  items: PlaceCardData[];
  nextCursor: number | null;
}

const LIMIT = 10;

export function useAllPlaces() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["places", "all"],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await fetch(
          `/api/places?tab=all&cursor=${pageParam}&limit=${LIMIT}`,
        );
        if (!res.ok) throw new Error("Failed to fetch places");
        return res.json() as Promise<PlacesResponse>;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const places = data?.pages.flatMap((page) => page.items) ?? [];

  return {
    places,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
}
