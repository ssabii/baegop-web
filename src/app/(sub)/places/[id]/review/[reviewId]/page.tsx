import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { optimizeNaverImageUrl, optimizeSupabaseImageUrl } from "@/lib/image";
import { ReviewEditFormPage } from "./review-edit-form-page";

export default async function ReviewEditPage({
  params,
}: {
  params: Promise<{ id: string; reviewId: string }>;
}) {
  const { id: naverPlaceId, reviewId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/signin?redirect=/places/${naverPlaceId}/review/${reviewId}`);
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("*, review_images(url, display_order)")
    .eq("id", Number(reviewId))
    .single();

  if (!review) notFound();

  if (review.user_id !== user.id) notFound();

  const { data: place } = await supabase
    .from("places")
    .select("name, category, image_urls")
    .eq("id", review.place_id)
    .single();

  if (!place) notFound();

  return (
    <ReviewEditFormPage
      review={{
        id: review.id,
        rating: review.rating,
        content: review.content,
        review_images: (review.review_images ?? []).map((img) => ({
          ...img,
          url: optimizeSupabaseImageUrl(img.url),
        })),
      }}
      naverPlaceId={naverPlaceId}
      place={{
        name: place.name,
        category: place.category,
        imageUrl: place.image_urls?.[0] ? optimizeNaverImageUrl(place.image_urls[0]) : null,
      }}
    />
  );
}
