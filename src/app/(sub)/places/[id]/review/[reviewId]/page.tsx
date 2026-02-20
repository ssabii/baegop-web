import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
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

  return (
    <>
      <SubHeader title="리뷰 수정" />
      <ReviewEditFormPage
        review={{
          id: review.id,
          rating: review.rating,
          content: review.content,
          review_images: review.review_images ?? [],
        }}
        naverPlaceId={naverPlaceId}
      />
    </>
  );
}
