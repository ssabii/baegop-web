import { useQuery } from "@tanstack/react-query";
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

export function usePlaceData(naverPlaceId: string, coords: { x: string; y: string }) {
  return useQuery({
    queryKey: ["place-data", naverPlaceId] as const,
    queryFn: async () => {
      const res = await fetch(
        `/api/places/${naverPlaceId}/detail?x=${coords.x}&y=${coords.y}`,
      );
      if (!res.ok) throw new Error("Failed to fetch place data");
      return res.json() as Promise<PlaceDataResponse>;
    },
  });
}
