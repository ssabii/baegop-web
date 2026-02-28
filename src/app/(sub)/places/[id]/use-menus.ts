import { useInfiniteQuery } from "@tanstack/react-query";
import type { NaverPlaceMenu } from "@/types";

interface MenusResponse {
  items: NaverPlaceMenu[];
  nextCursor: number | null;
}

const LIMIT = 10;

export type { MenusResponse };

export function useMenus(naverPlaceId: string, initialData: MenusResponse) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["menus", naverPlaceId],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await fetch(
          `/api/places/${naverPlaceId}/menus?cursor=${pageParam}&limit=${LIMIT}`,
        );
        if (!res.ok) throw new Error("Failed to fetch menus");
        return res.json() as Promise<MenusResponse>;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialData: {
        pages: [initialData],
        pageParams: [0],
      },
    });

  const menus = data?.pages.flatMap((page) => page.items) ?? [];

  return {
    menus,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
}
