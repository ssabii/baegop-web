"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ReactionType, KonaVote } from "@/types";

export async function createReview(
  restaurantId: number,
  data: { rating: number; content: string }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const { error } = await supabase.from("reviews").insert({
    restaurant_id: restaurantId,
    user_id: user.id,
    rating: data.rating,
    content: data.content || null,
  });

  if (error) throw new Error("리뷰 작성에 실패했습니다");

  revalidatePath(`/restaurants/${restaurantId}`);
}

export async function deleteReview(reviewId: number, restaurantId: number) {
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

  revalidatePath(`/restaurants/${restaurantId}`);
}

export async function toggleReaction(
  restaurantId: number,
  type: ReactionType
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  // 기존 reaction 확인
  const { data: existing } = await supabase
    .from("reactions")
    .select("id, type")
    .eq("restaurant_id", restaurantId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    if (existing.type === type) {
      // 같은 타입 → 취소
      await supabase.from("reactions").delete().eq("id", existing.id);
    } else {
      // 다른 타입 → 변경
      await supabase
        .from("reactions")
        .update({ type })
        .eq("id", existing.id);
    }
  } else {
    // 없으면 → 새로 생성
    await supabase.from("reactions").insert({
      restaurant_id: restaurantId,
      user_id: user.id,
      type,
    });
  }

  revalidatePath(`/restaurants/${restaurantId}`);
}

export async function voteKonaCard(
  restaurantId: number,
  vote: KonaVote
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  // 기존 투표 확인
  const { data: existing } = await supabase
    .from("kona_card_votes")
    .select("id, vote")
    .eq("restaurant_id", restaurantId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    if (existing.vote === vote) {
      // 같은 투표 → 취소
      await supabase.from("kona_card_votes").delete().eq("id", existing.id);
    } else {
      // 다른 투표 → 변경
      await supabase
        .from("kona_card_votes")
        .update({ vote })
        .eq("id", existing.id);
    }
  } else {
    // 없으면 → 새로 생성
    await supabase.from("kona_card_votes").insert({
      restaurant_id: restaurantId,
      user_id: user.id,
      vote,
    });
  }

  revalidatePath(`/restaurants/${restaurantId}`);
}
