import { Star, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlaceCard, EmptyPlace } from "@/components/places";
import {
  POPULAR_RATING_THRESHOLD,
  POPULAR_MIN_REVIEW_COUNT,
} from "@/lib/constants";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: rawPopular } = await supabase
    .from("places")
    .select(
      "id, name, address, category, kona_card_status, image_urls, reviews(rating)",
    );

  const { data: rawRecent } = await supabase
    .from("places")
    .select(
      "id, name, address, category, kona_card_status, image_urls, reviews(rating)",
    )
    .order("created_at", { ascending: false })
    .limit(5);

  function withRating(places: typeof rawPopular) {
    return places?.map(({ reviews, ...rest }) => ({
      ...rest,
      avg_rating:
        reviews.length > 0
          ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
          : null,
      review_count: reviews.length,
    }));
  }

  const popularPlaces = withRating(rawPopular)
    ?.filter(
      (p) =>
        p.avg_rating !== null &&
        p.avg_rating >= POPULAR_RATING_THRESHOLD &&
        p.review_count >= POPULAR_MIN_REVIEW_COUNT,
    )
    .sort(
      (a, b) =>
        b.avg_rating! - a.avg_rating! || b.review_count - a.review_count,
    )
    .slice(0, 5);
  const recentPlaces = withRating(rawRecent);

  const hasPlaces =
    (popularPlaces && popularPlaces.length > 0) ||
    (recentPlaces && recentPlaces.length > 0);

  if (!hasPlaces) {
    return (
      <main className="mx-auto flex h-[calc(100dvh-9rem)] w-full max-w-4xl items-center justify-center px-4">
        <EmptyPlace />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pt-4 pb-15">
      {/* 인기 장소 */}
      {popularPlaces && popularPlaces.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Star className="size-5" />
            인기 장소
          </h2>
          <div className="mt-1">
            {popularPlaces.map((r) => (
              <PlaceCard key={r.id} place={r} />
            ))}
          </div>
        </section>
      )}

      {/* 최근 등록된 장소 */}
      {recentPlaces && recentPlaces.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="size-5" />
            최근 등록된 장소
          </h2>
          <div className="mt-1">
            {recentPlaces.map((r) => (
              <PlaceCard key={r.id} place={r} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
