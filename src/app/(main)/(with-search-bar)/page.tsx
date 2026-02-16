import { Star, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlaceCard, EmptyPlace } from "@/components/places";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: popularPlaces } = await supabase
    .from("places")
    .select("id, naver_place_id, name, address, category, kona_card_status, image_urls")
    .order("like_count", { ascending: false, nullsFirst: false })
    .limit(5);

  const { data: recentPlaces } = await supabase
    .from("places")
    .select("id, naver_place_id, name, address, category, kona_card_status, image_urls")
    .order("created_at", { ascending: false })
    .limit(5);

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
    <main className="mx-auto max-w-4xl px-4 py-4">
      {/* 인기 장소 */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Star className="size-5" />
          인기 장소
        </h2>
        <div className="mt-3">
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
        <div className="mt-3">
          {recentPlaces!.map((r) => (
            <PlaceCard key={r.id} place={r} />
          ))}
        </div>
      </section>
    </main>
  );
}
