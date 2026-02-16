import { List } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlaceCard } from "@/components/place-card";

export default async function PlacesPage() {
  const supabase = await createClient();

  const { data: places } = await supabase
    .from("places")
    .select("id, name, address, category, kona_card_status, like_count, image_urls")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <List className="size-6" />
        장소 목록
      </h1>

      {places && places.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {places.map((r) => (
            <PlaceCard key={r.id} place={r} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          아직 등록된 장소가 없습니다. 검색에서 첫 번째 장소를 등록해보세요!
        </p>
      )}
    </main>
  );
}
