"use client";

import { useQuery } from "@tanstack/react-query";

interface StoreMenu {
  name: string;
  price: string | null;
  images: string[];
  description: string | null;
  recommend: boolean;
}

interface StoreMenusResponse {
  items: StoreMenu[];
  nextCursor: number | null;
}

export function useStoreMenus(placeId: string | null) {
  return useQuery<StoreMenusResponse>({
    queryKey: ["store-menus", placeId],
    queryFn: () =>
      fetch(`/api/places/${placeId}/menus?limit=3`).then((r) => r.json()),
    enabled: !!placeId,
  });
}
