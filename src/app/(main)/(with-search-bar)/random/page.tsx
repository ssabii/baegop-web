import { createClient } from "@/lib/supabase/server";
import { optimizeNaverImageUrls } from "@/lib/image";
import { calculateDistance, estimateWalkingMinutes } from "@/lib/geo";
import { COMPANY_LOCATION } from "@/lib/constants";
import { EmptyPlace } from "@/components/places";
import { Roulette } from "./roulette";

export default async function RandomPage() {
  const supabase = await createClient();

  const { data: rawPlaces } = await supabase
    .from("places")
    .select(
      "id, name, address, category, kona_card_status, image_urls, lat, lng, reviews(rating)",
    );

  const places = rawPlaces?.map(({ reviews, image_urls, lat, lng, ...rest }) => {
    const walkingMinutes =
      lat != null && lng != null
        ? estimateWalkingMinutes(
            calculateDistance(COMPANY_LOCATION, { lat, lng }),
          )
        : null;

    return {
      ...rest,
      image_urls: image_urls ? optimizeNaverImageUrls(image_urls) : image_urls,
      avg_rating:
        reviews.length > 0
          ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
          : null,
      review_count: reviews.length,
      walking_minutes: walkingMinutes,
    };
  });

  if (!places || places.length === 0) {
    return (
      <main className="flex h-[calc(100dvh-4rem)] flex-col pt-17">
        <EmptyPlace />
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100dvh-4rem)] flex-col pt-17">
      <Roulette places={places} />
    </main>
  );
}
