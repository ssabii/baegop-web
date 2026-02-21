import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { optimizeNaverImageUrls } from "@/lib/image";

const DEFAULT_LIMIT = 10;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = Math.max(Number(searchParams.get("cursor")) || 0, 0);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1),
    50,
  );

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: rawPlaces, error } = await supabase
    .from("places")
    .select(
      "id, name, address, category, kona_card_status, image_urls, reviews(rating)",
    )
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })
    .range(cursor, cursor + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (rawPlaces ?? []).map(({ reviews, image_urls, ...rest }) => {
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
        : null;
    return {
      ...rest,
      image_urls: image_urls ? optimizeNaverImageUrls(image_urls) : image_urls,
      avg_rating: avgRating,
      review_count: reviewCount,
    };
  });

  const nextCursor = items.length === limit ? cursor + limit : null;

  return NextResponse.json({ items, nextCursor });
}
