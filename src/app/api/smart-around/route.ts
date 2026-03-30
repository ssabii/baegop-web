import { NextRequest, NextResponse } from "next/server";
import { fetchSmartAround } from "@/lib/smart-around";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "lat, lng 파라미터가 필요합니다" },
      { status: 400 },
    );
  }

  try {
    const places = await fetchSmartAround(lat, lng);
    return NextResponse.json(places);
  } catch {
    return NextResponse.json(
      { error: "추천 장소 조회 중 오류 발생" },
      { status: 500 },
    );
  }
}
