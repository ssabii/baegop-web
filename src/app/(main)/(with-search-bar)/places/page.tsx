import { Fragment } from "react";
import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import { PlaceCard, EmptyPlace } from "@/components/places";

export default async function PlacesPage() {
  const supabase = await createClient();

  const { data: rawPlaces } = await supabase
    .from("places")
    .select(
      "id, name, address, category, kona_card_status, image_urls, reviews(rating)",
    )
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
      <main className="flex h-[calc(100dvh-8rem)] items-center justify-center px-4">
        <EmptyPlace />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pt-4 pb-23">
      <div className="flex flex-col">
        {places.map((r, index) => (
          <Fragment key={r.id}>
            {index > 0 && <Separator />}
            <PlaceCard place={r} />
          </Fragment>
        ))}
      </div>
    </main>
  );
}
