import { useInfiniteQuery } from "@tanstack/react-query";

interface MyPlace {
  id: string;
  name: string;
  address: string;
  category: string | null;
  kona_card_status: string | null;
  image_urls: string[] | null;
  avg_rating: number | null;
  review_count: number;
}

interface MyPlacesResponse {
  items: MyPlace[];
  nextCursor: number | null;
}

const LIMIT = 10;

export function useMyPlaces() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["mypage", "places"],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await fetch(
          `/api/mypage/places?cursor=${pageParam}&limit=${LIMIT}`,
        );
        if (!res.ok) throw new Error("Failed to fetch places");
        return res.json() as Promise<MyPlacesResponse>;
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
