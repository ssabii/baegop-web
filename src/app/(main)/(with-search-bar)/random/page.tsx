import { createClient } from "@/lib/supabase/server";
import { optimizeNaverImageUrls } from "@/lib/image";
import { EmptyPlace } from "@/components/places";
import { Roulette } from "./roulette";

export default async function RandomPage() {
  const supabase = await createClient();

  const { data: rawPlaces } = await supabase
    .from("places")
    .select(
      "id, name, address, category, kona_card_status, image_urls, reviews(rating)",
    );

  const places = rawPlaces?.map(({ reviews, image_urls, ...rest }) => ({
    ...rest,
    image_urls: image_urls ? optimizeNaverImageUrls(image_urls) : image_urls,
    avg_rating:
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : null,
    review_count: reviews.length,
  }));

  if (!places || places.length === 0) {
    return (
      <main className="h-[calc(100dvh-4rem)] flex pt-21">
        <EmptyPlace />
      </main>
    );
  }

  return (
    <main className="h-[calc(100dvh-4rem)] flex pt-21">
      <Roulette places={places} />
    </main>
  );
}
