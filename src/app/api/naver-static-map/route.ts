import { NextRequest, NextResponse } from "next/server";

const ALLOWED_KEYS = ["w", "h", "level", "scale", "maptype", "format", "lang"];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const center = searchParams.get("center");

  if (!center) {
    return NextResponse.json(
      { error: "center 파라미터가 필요합니다" },
      { status: 400 },
    );
  }

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;
  const clientSecret = process.env.X_NCP_APIGW_API_KEY;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "네이버 지도 API 키가 설정되지 않았습니다" },
      { status: 500 },
    );
  }

  const params = new URLSearchParams();
  params.set("center", center);
  for (const key of ALLOWED_KEYS) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }
  for (const value of searchParams.getAll("markers")) {
    params.append("markers", value);
  }

  const res = await fetch(
    `https://maps.apigw.ntruss.com/map-static/v2/raster?${params}`,
    {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": clientId,
        "X-NCP-APIGW-API-KEY": clientSecret,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }

  return new NextResponse(await res.arrayBuffer(), {
    headers: {
      "Content-Type": res.headers.get("content-type") || "image/png",
    },
  });
}
