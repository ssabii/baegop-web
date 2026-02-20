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
      <main className="flex h-[calc(100svh-8rem)] items-center justify-center px-4">
        <EmptyPlace />
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100svh-8rem)] items-center justify-center px-4">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="mt-4 text-lg font-semibold">
          버튼을 눌러 랜덤으로 장소를 추천받아보세요!
        </p>

        <div className="mt-8 w-full">
          <Roulette places={places} />
        </div>
      </div>
    </main>
  );
}
