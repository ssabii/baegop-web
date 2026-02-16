import { NextRequest, NextResponse } from "next/server";
import type { NaverSearchResult } from "@/types";

const GRAPHQL_URL = "https://pcmap-api.place.naver.com/place/graphql";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "query 파라미터가 필요합니다" },
      { status: 400 },
    );
  }

  try {
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
          variables: { input: { query, display: 5, start: 1 } },
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

    if (!res.ok) {
      return NextResponse.json(
        { error: "네이버 플레이스 검색 실패" },
        { status: res.status },
      );
    }

    const json = await res.json();
    const items: NaverSearchResult[] = json[0]?.data?.places?.items ?? [];

    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "네이버 플레이스 검색 중 오류 발생" },
      { status: 500 },
    );
  }
}
