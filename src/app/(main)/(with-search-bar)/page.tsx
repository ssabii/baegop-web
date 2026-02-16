import Link from "next/link";
import { Star, Clock, UtensilsCrossed } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
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

  const hasPlaces =
    (popularPlaces && popularPlaces.length > 0) ||
    (recentPlaces && recentPlaces.length > 0);

  if (!hasPlaces) {
    return (
      <main className="mx-auto flex h-[calc(100dvh-9rem)] max-w-4xl flex-col items-center justify-center px-4 text-center">
        <UtensilsCrossed className="size-16 text-muted-foreground/30" />
        <p className="mt-4 text-lg font-semibold">등록된 장소가 없어요.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          장소 검색 후 장소를 등록해보세요.
        </p>
        <Button asChild className="mt-6">
          <Link href="/search">장소 검색하기</Link>
        </Button>
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
