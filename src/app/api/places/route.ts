import { NextRequest, NextResponse } from "next/server";
import { fetchPlaces, type PlacesOrderBy } from "@/lib/queries/places";

const DEFAULT_LIMIT = 10;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const orderBy = (searchParams.get("orderBy") ?? "created_at") as PlacesOrderBy;
  const ascending = searchParams.get("ascending") === "true";
  const cursor = Math.max(Number(searchParams.get("cursor")) || 0, 0);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1),
    50,
  );

  const minRating = searchParams.get("minRating")
    ? Number(searchParams.get("minRating"))
    : undefined;
  const minReviewCount = searchParams.get("minReviewCount")
    ? Number(searchParams.get("minReviewCount"))
    : undefined;
  const createdAfter = searchParams.get("createdAfter") ?? undefined;

  if (!["created_at", "rating", "review_count"].includes(orderBy)) {
    return NextResponse.json(
      { error: "orderBy는 created_at, rating, review_count만 가능합니다" },
      { status: 400 },
    );
  }

  try {
    const result = await fetchPlaces({
      orderBy,
      ascending,
      filter: { minRating, minReviewCount, createdAfter },
      cursor,
      limit,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
