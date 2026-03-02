import { NextRequest, NextResponse } from "next/server";
import { fetchPlaceDetail } from "@/lib/naver";

const DEFAULT_LIMIT = 10;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: naverPlaceId } = await params;
  const { searchParams } = request.nextUrl;
  const cursor = Math.max(Number(searchParams.get("cursor")) || 0, 0);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1),
    50,
  );

  const detail = await fetchPlaceDetail(naverPlaceId);
  const allMenus = detail?.menus ?? [];

  const items = allMenus.slice(cursor, cursor + limit);
  const nextCursor = cursor + limit < allMenus.length ? cursor + limit : null;

  return NextResponse.json({ items, nextCursor });
}
