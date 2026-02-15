import { NextRequest, NextResponse } from "next/server";
import type { NaverSearchResult } from "@/types";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "query 파라미터가 필요합니다" },
      { status: 400 }
    );
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "네이버 API 키가 설정되지 않았습니다" },
      { status: 500 }
    );
  }

  const url = new URL("https://openapi.naver.com/v1/search/local.json");
  url.searchParams.set("query", query);
  url.searchParams.set("display", "5");

  const res = await fetch(url.toString(), {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "네이버 API 호출 실패" },
      { status: res.status }
    );
  }

  const data = (await res.json()) as { items: NaverSearchResult[] };

  return NextResponse.json(data.items);
}
