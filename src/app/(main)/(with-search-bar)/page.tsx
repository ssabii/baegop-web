import { Star, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlaceCard, EmptyPlace } from "@/components/places";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: rawPopular } = await supabase
    .from("places")
    .select("id, name, address, category, kona_card_status, image_urls, reviews(rating)")
    .order("like_count", { ascending: false, nullsFirst: false })
    .limit(5);

  const { data: rawRecent } = await supabase
    .from("places")
    .select("id, name, address, category, kona_card_status, image_urls, reviews(rating)")
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

  const popularPlaces = withRating(rawPopular);
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
    <main className="mx-auto max-w-4xl p-4">
      {/* 인기 장소 */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Star className="size-5" />
          인기 장소
        </h2>
        <div className="mt-1">
          {popularPlaces!.map((r) => (
            <PlaceCard key={r.id} place={r} />
          ))}
        </div>
      </section>

      {/* 최근 등록된 장소 */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="size-5" />
          최근 등록된 장소
        </h2>
        <div className="mt-1">
          {recentPlaces!.map((r) => (
            <PlaceCard key={r.id} place={r} />
          ))}
        </div>
      </section>
    </main>
  );
}
