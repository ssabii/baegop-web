import { Shuffle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyPlace } from "@/components/places";
import { Roulette } from "./roulette";

export default async function RandomPage() {
  const supabase = await createClient();

  const { data: rawPlaces } = await supabase
    .from("places")
    .select("id, name, address, category, kona_card_status, image_urls, reviews(rating)");

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
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Shuffle className="size-6" />
        오늘 뭐 먹지?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        버튼을 눌러 랜덤으로 장소를 추천받아보세요!
      </p>

      <div className="mt-8">
        <Roulette places={places} />
      </div>
    </main>
  );
}
