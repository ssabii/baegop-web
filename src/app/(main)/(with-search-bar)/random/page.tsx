import { createClient } from "@/lib/supabase/server";
import { EmptyPlace } from "@/components/places";
import { Roulette } from "./roulette";

export default async function RandomPage() {
  const supabase = await createClient();

  const { data: rawPlaces } = await supabase
    .from("places")
    .select(
      "id, name, address, category, kona_card_status, image_urls, reviews(rating)",
    );

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
      <main className="flex h-[calc(100dvh-4rem)] items-center justify-center pt-17">
        <EmptyPlace />
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100dvh-4rem)] items-center justify-center pt-17">
      <Roulette places={places} />
    </main>
  );
}
