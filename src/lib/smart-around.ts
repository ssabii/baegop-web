import { unstable_cache } from "next/cache";
import type {
  NaverSearchResult,
  SmartAroundPlace,
  SmartAroundResponse,
} from "@/types";

const SMART_AROUND_URL = "https://map.naver.com/p/api/smart-around/places";

const NAVER_MAP_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Accept-Language": "ko-KR,ko;q=0.9",
  Referer: "https://map.naver.com/",
  Origin: "https://map.naver.com",
};

const BOUNDARY_OFFSET_LNG = 0.005;
const BOUNDARY_OFFSET_LAT = 0.004;

function computeBoundary(lng: number, lat: number): string {
  const minX = lng - BOUNDARY_OFFSET_LNG;
  const minY = lat - BOUNDARY_OFFSET_LAT;
  const maxX = lng + BOUNDARY_OFFSET_LNG;
  const maxY = lat + BOUNDARY_OFFSET_LAT;
  return `${minX};${minY};${maxX};${maxY}`;
}

function getTimeCode(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return "MORNING";
  if (hour >= 11 && hour < 14) return "LUNCH";
  if (hour >= 14 && hour < 17) return "AFTERNOON";
  if (hour >= 17 && hour < 21) return "EVENING";
  return "NIGHT";
}

function toNaverSearchResult(place: SmartAroundPlace): NaverSearchResult {
  return {
    id: place.id,
    name: place.name,
    category: place.category.join(" > "),
    address: place.address,
    roadAddress: place.roadAddress,
    phone: null,
    x: place.x,
    y: place.y,
    imageUrl: place.images[0] ?? null,
    menus: [],
  };
}

export async function fetchSmartAround(
  lat: number,
  lng: number,
): Promise<NaverSearchResult[]> {
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;

  try {
    return await unstable_cache(
      async () => {
        const searchCoord = `${roundedLng};${roundedLat}`;
        const boundary = computeBoundary(roundedLng, roundedLat);
        const timeCode = getTimeCode();

        const params = new URLSearchParams({
          searchCoord,
          boundary,
          code: "01",
          limit: "10",
          sortType: "RECOMMEND",
          timeCode,
        });

        const res = await fetch(`${SMART_AROUND_URL}?${params}`, {
          headers: NAVER_MAP_HEADERS,
          signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) return [];

        const json: SmartAroundResponse = await res.json();
        return (json.result?.list ?? []).map(toNaverSearchResult);
      },
      [`smart-around-${roundedLat}-${roundedLng}`],
      { revalidate: 300 },
    )();
  } catch {
    return [];
  }
}
