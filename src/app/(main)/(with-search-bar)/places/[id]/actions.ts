"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createReview(
  placeId: number,
  naverPlaceId: string,
  data: { rating: number; content: string }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const { error } = await supabase.from("reviews").insert({
    place_id: placeId,
    user_id: user.id,
    rating: data.rating,
    content: data.content || null,
  });

  if (error) throw new Error("리뷰 작성에 실패했습니다");

  revalidatePath(`/places/${naverPlaceId}`);
}

export async function deleteReview(
  reviewId: number,
  naverPlaceId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) throw new Error("리뷰 삭제에 실패했습니다");

  revalidatePath(`/places/${naverPlaceId}`);
}
