import { unstable_cache } from "next/cache";
import type { NaverSearchResult } from "@/types";

const GRAPHQL_URL = "https://pcmap-api.place.naver.com/place/graphql";

export async function searchPlaces(
  query: string,
  display: number,
  x?: string,
  y?: string,
): Promise<NaverSearchResult[]> {
  const cacheKey = x && y ? `${query}:${display}:${x}:${y}` : `${query}:${display}`;
  return cachedSearchPlaces(cacheKey, query, display, x, y);
}

const cachedSearchPlaces = unstable_cache(
  async (
    _cacheKey: string,
    query: string,
    display: number,
    x?: string,
    y?: string,
  ): Promise<NaverSearchResult[]> => {
    const input: Record<string, unknown> = { query, display, start: 1 };
    if (x) input.x = x;
    if (y) input.y = y;

    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        Referer: "https://m.place.naver.com/",
        Origin: "https://m.place.naver.com",
      },
      body: JSON.stringify([
        {
          operationName: "getPlaces",
          variables: { input },
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

    if (!res.ok) return [];

    const json = await res.json();
    return json[0]?.data?.places?.items ?? [];
  },
  ["search-places"],
  { revalidate: 300 },
);
