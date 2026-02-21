import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { optimizeNaverImageUrl } from "@/lib/image";
import { ReviewFormPage } from "../review-form-page";

export default async function ReviewWritePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: naverPlaceId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/signin?redirect=/places/${naverPlaceId}/review/new`);
  }

  const { data: place } = await supabase
    .from("places")
    .select("id, name, category, image_urls")
    .eq("id", naverPlaceId)
    .single();

  if (!place) notFound();

  return (
    <ReviewFormPage
      placeId={place.id}
      naverPlaceId={naverPlaceId}
      place={{
        name: place.name,
        category: place.category,
        imageUrl: place.image_urls?.[0] ? optimizeNaverImageUrl(place.image_urls[0]) : null,
      }}
    />
  );
}
