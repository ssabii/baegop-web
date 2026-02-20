import { NextRequest, NextResponse } from "next/server";
import { COMPANY_LOCATION } from "@/lib/constants";
import { searchPlaces } from "@/lib/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  const displayParam = Number(request.nextUrl.searchParams.get("display")) || 10;
  const display = Math.min(Math.max(displayParam, 1), 100);
  const start = Math.max(Number(request.nextUrl.searchParams.get("start")) || 1, 1);

  if (!query) {
    return NextResponse.json(
      { error: "query 파라미터가 필요합니다" },
      { status: 400 },
    );
  }

  try {
    const items = await searchPlaces(
      query,
      display,
      String(COMPANY_LOCATION.lng),
      String(COMPANY_LOCATION.lat),
      start,
    );
    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "네이버 플레이스 검색 중 오류 발생" },
      { status: 500 },
    );
  }
}
