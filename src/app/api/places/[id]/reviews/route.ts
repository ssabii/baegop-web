import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { optimizeSupabaseImageUrl } from "@/lib/image";

const DEFAULT_LIMIT = 10;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: placeId } = await params;
  const { searchParams } = request.nextUrl;
  const cursor = Math.max(Number(searchParams.get("cursor")) || 0, 0);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1),
    50,
  );

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(nickname, avatar_url)")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false })
    .range(cursor, cursor + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? []).map((review) => ({
    ...review,
    image_urls: (review.image_urls ?? []).map((url) => optimizeSupabaseImageUrl(url)),
  }));
  const nextCursor = items.length === limit ? cursor + limit : null;

  return NextResponse.json({ items, nextCursor });
}
