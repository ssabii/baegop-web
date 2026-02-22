import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, content, created_at, places(id, name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(cursor, cursor + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = data ?? [];
  const nextCursor = items.length === limit ? cursor + limit : null;

  return NextResponse.json({ items, nextCursor });
}
