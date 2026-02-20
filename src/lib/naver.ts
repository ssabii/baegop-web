import type { NaverPlaceDetail, NaverSearchResult } from "@/types";

const GRAPHQL_URL = "https://pcmap-api.place.naver.com/place/graphql";

const GRAPHQL_HEADERS = {
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  Referer: "https://m.place.naver.com/",
  Origin: "https://m.place.naver.com",
};

export function buildNaverPlaceLink(placeId: string): string {
  return `https://m.place.naver.com/restaurant/${placeId}/home`;
}

/** 네이버 플레이스 상세 정보 조회 (이미지 복수, 메뉴 이미지/추천 포함) */
export async function fetchPlaceDetail(
  placeId: string,
): Promise<NaverPlaceDetail | null> {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: GRAPHQL_HEADERS,
      body: JSON.stringify([
        {
          operationName: "getPlaceDetail",
          variables: { input: { id: placeId } },
          query: `query getPlaceDetail($input: PlaceDetailInput!) {
            placeDetail(input: $input) {
              base { id name address roadAddress phone category coordinate { x y } }
              images { images { origin } }
              menus { name price images description recommend }
            }
          }`,
        },
      ]),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const detail = json[0]?.data?.placeDetail;
    if (!detail?.base) return null;

    const base = detail.base;
    return {
      id: base.id,
      name: base.name,
      category: base.category ?? "",
      address: base.address ?? "",
      roadAddress: base.roadAddress ?? "",
      phone: base.phone ?? null,
      x: base.coordinate?.x ?? "",
      y: base.coordinate?.y ?? "",
      imageUrls: ((detail.images?.images ?? []) as { origin: string | null }[])
        .map((img) => img.origin)
        .filter(Boolean)
        .slice(0, 10) as string[],
      menus: (detail.menus ?? []).map(
        (m: {
          name: string;
          price: string | null;
          images: string[] | null;
          description: string | null;
          recommend: boolean | null;
        }) => ({
          name: m.name,
          price: m.price ?? null,
          images: m.images ?? [],
          description: m.description || null,
          recommend: m.recommend ?? false,
        }),
      ),
    };
  } catch {
    return null;
  }
}

/** 검색 API(getPlaces)로 장소명 검색 → ID 매칭하여 상세 정보 구성 (Tier 2 폴백) */
async function fetchPlaceBySearch(
  placeId: string,
  placeName: string,
): Promise<NaverPlaceDetail | null> {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: GRAPHQL_HEADERS,
      body: JSON.stringify([
        {
          operationName: "getPlaces",
          variables: { input: { query: placeName, display: 10, start: 1 } },
          query: `query getPlaces($input: PlacesInput!) {
            places(input: $input) {
              items {
                id name category address roadAddress
                phone x y imageUrl menus
              }
            }
          }`,
        },
      ]),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const items: NaverSearchResult[] = json[0]?.data?.places?.items ?? [];
    const match = items.find((item) => item.id === placeId);
    if (!match) return null;

    return {
      id: match.id,
      name: match.name,
      category: match.category ?? "",
      address: match.address ?? "",
      roadAddress: match.roadAddress ?? "",
      phone: match.phone ?? null,
      x: match.x ?? "",
      y: match.y ?? "",
      imageUrls: match.imageUrl ? [match.imageUrl] : [],
      menus: (match.menus ?? []).map((menuStr) => ({
        name: menuStr,
        price: null,
        images: [],
        description: null,
        recommend: false,
      })),
    };
  } catch {
    return null;
  }
}

/** 네이버 플레이스 상세 조회 (Tier 1 → Tier 2 폴백) */
export async function fetchPlaceDetailWithFallback(
  placeId: string,
  placeName?: string,
): Promise<NaverPlaceDetail | null> {
  const detail = await fetchPlaceDetail(placeId);
  if (detail) return detail;

  if (placeName) {
    const searchResult = await fetchPlaceBySearch(placeId, placeName);
    if (searchResult) return searchResult;
  }

  return null;
}
