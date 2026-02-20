import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { ReviewFormPage } from "./review-form-page";

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
    redirect(`/signin?redirect=/places/${naverPlaceId}/review`);
  }

  const { data: place } = await supabase
    .from("places")
    .select("id")
    .eq("id", naverPlaceId)
    .single();

  if (!place) notFound();

  return (
    <>
      <SubHeader title="리뷰 작성" />
      <ReviewFormPage placeId={place.id} naverPlaceId={naverPlaceId} />
    </>
  );
}
