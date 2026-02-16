import { Star, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlaceCard } from "@/components/place-card";

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

  return (
    <main className="mx-auto max-w-4xl px-4 py-4">
      {/* 인기 장소 */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Star className="size-5" />
          인기 장소
        </h2>
        {popularPlaces && popularPlaces.length > 0 ? (
          <div className="mt-3">
            {popularPlaces.map((r) => (
              <PlaceCard key={r.id} place={r} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            아직 등록된 장소가 없습니다. 첫 번째 장소를 등록해보세요!
          </p>
        )}
      </section>

      {/* 최근 등록된 장소 */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="size-5" />
          최근 등록된 장소
        </h2>
        {recentPlaces && recentPlaces.length > 0 ? (
          <div className="mt-3">
            {recentPlaces.map((r) => (
              <PlaceCard key={r.id} place={r} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            아직 등록된 장소가 없습니다.
          </p>
        )}
      </section>
    </main>
  );
}
