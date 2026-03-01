import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { KonaCardStatus, KonaVote } from "@/types";

interface PlaceDataResponse {
  place: {
    id: string;
    name: string;
    kona_card_status: KonaCardStatus;
    image_urls: string[] | null;
  } | null;
  avgRating: number | null;
  reviewCount: number;
  userKonaVote: KonaVote | null;
  isLoggedIn: boolean;
  walkingRoute: {
    distance: number;
    duration: number;
  } | null;
}

function placeDataQueryKey(naverPlaceId: string) {
  return ["place-data", naverPlaceId] as const;
}

function fetchPlaceData(naverPlaceId: string, coords: { x: string; y: string }) {
  return async () => {
    const res = await fetch(
      `/api/places/${naverPlaceId}/detail?x=${coords.x}&y=${coords.y}`,
    );
    if (!res.ok) throw new Error("Failed to fetch place data");
    return res.json() as Promise<PlaceDataResponse>;
  };
}

export function usePlaceData(naverPlaceId: string, coords: { x: string; y: string }) {
  return useQuery({
    queryKey: placeDataQueryKey(naverPlaceId),
    queryFn: fetchPlaceData(naverPlaceId, coords),
  });
}

const PREFETCH_COUNT = 5;

/** 검색 결과 상위 N개의 장소 데이터를 미리 가져온다 */
export function usePrefetchPlaceData(items: { id: string; x: string; y: string }[]) {
  const queryClient = useQueryClient();

  // 최초 결과가 도착했을 때 상위 N개만 prefetch
  const firstId = items[0]?.id;
  useEffect(() => {
    if (!firstId) return;
    for (const item of items.slice(0, PREFETCH_COUNT)) {
      queryClient.prefetchQuery({
        queryKey: placeDataQueryKey(item.id),
        queryFn: fetchPlaceData(item.id, { x: item.x, y: item.y }),
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [firstId, queryClient, items]);
}
