import type { NaverPlaceDetail } from "@/types";

const GRAPHQL_URL = "https://pcmap-api.place.naver.com/place/graphql";

const GRAPHQL_HEADERS = {
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  Referer: "https://m.place.naver.com/",
  Origin: "https://m.place.naver.com",
};

export function buildNaverMapLink(name: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(name)}`;
}

/** 네이버 플레이스 상세 정보 조회 (이미지 복수, 메뉴 이미지/추천 포함) */
export async function fetchPlaceDetail(
  placeId: string
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
              base { id name description address roadAddress phone category coordinate { x y } }
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
      description: base.description ?? null,
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
        })
      ),
    };
  } catch {
    return null;
  }
}
