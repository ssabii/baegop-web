import { List } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlaceCard, EmptyPlace } from "@/components/places";

export default async function PlacesPage() {
  const supabase = await createClient();

  const { data: rawPlaces } = await supabase
    .from("places")
    .select("id, name, address, category, kona_card_status, image_urls, reviews(rating)")
    .order("created_at", { ascending: false });

  const places = rawPlaces?.map(({ reviews, ...rest }) => ({
    ...rest,
    avg_rating:
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : null,
    review_count: reviews.length,
  }));

  if (!places || places.length === 0) {
    return (
      <main className="mx-auto flex h-[calc(100dvh-9rem)] w-full max-w-4xl items-center justify-center px-4">
        <EmptyPlace />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-4">
      {places.map((r) => (
        <PlaceCard key={r.id} place={r} />
      ))}
    </main>
  );
}
