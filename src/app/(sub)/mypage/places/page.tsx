import { Fragment } from "react";
import { redirect } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { optimizeNaverImageUrls } from "@/lib/image";
import { Separator } from "@/components/ui/separator";
import { SubHeader } from "@/components/sub-header";
import { PlaceCard } from "@/components/places";

export default async function MyPlacesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const { data: rawPlaces } = await supabase
    .from("places")
    .select(
      "id, name, address, category, kona_card_status, image_urls, reviews(rating)",
    )
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  const places = rawPlaces?.map(({ reviews, image_urls, ...rest }) => ({
    ...rest,
    image_urls: image_urls ? optimizeNaverImageUrls(image_urls) : image_urls,
    avg_rating:
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : null,
    review_count: reviews.length,
  }));

  return (
    <>
      <SubHeader title="내 장소" />
      {places && places.length > 0 ? (
        <div className="flex flex-col px-4">
          {places.map((place, index) => (
            <Fragment key={place.id}>
              {index > 0 && <Separator />}
              <PlaceCard place={place} />
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
          <UtensilsCrossed className="size-8" />
          <p className="text-sm">아직 등록한 장소가 없습니다.</p>
        </div>
      )}
    </>
  );
}
