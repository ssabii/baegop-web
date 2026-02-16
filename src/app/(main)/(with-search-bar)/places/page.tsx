import { List } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlaceCard, EmptyPlace } from "@/components/places";

export default async function PlacesPage() {
  const supabase = await createClient();

  const { data: places } = await supabase
    .from("places")
    .select("id, naver_place_id, name, address, category, kona_card_status, image_urls")
    .order("created_at", { ascending: false });

  if (!places || places.length === 0) {
    return (
      <main className="mx-auto flex h-[calc(100dvh-9rem)] w-full max-w-4xl items-center justify-center px-4">
        <EmptyPlace />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <List className="size-6" />
        장소 목록
      </h1>
      <div className="mt-6">
        {places.map((r) => (
          <PlaceCard key={r.id} place={r} />
        ))}
      </div>
    </main>
  );
}
