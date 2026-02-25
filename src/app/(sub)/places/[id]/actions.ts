"use server";

import { createClient } from "@/lib/supabase/server";
import { toOriginalSupabaseImageUrl } from "@/lib/image";
import type { KonaCardStatus, KonaVote } from "@/types";

export async function createReview(
  placeId: string,
  data: { rating: number; content: string },
  imageUrls?: string[],
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      place_id: placeId,
      user_id: user.id,
      rating: data.rating,
      content: data.content || null,
    })
    .select("id")
    .single();

  if (error || !review) throw new Error("리뷰 작성에 실패했습니다");

  if (imageUrls && imageUrls.length > 0) {
    await supabase.from("review_images").insert(
      imageUrls.map((url, i) => ({
        review_id: review.id,
        url,
        display_order: i,
      })),
    );
  }
}

export async function deleteReview(reviewId: number) {
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
}

export async function updateReview(
  reviewId: number,
  data: { rating: number; content: string },
  keptImageUrls: string[],
  newImageUrls?: string[],
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  // 리뷰 수정 + 기존 이미지 조회 병렬 실행
  const [updateResult, existingResult] = await Promise.all([
    supabase
      .from("reviews")
      .update({ rating: data.rating, content: data.content || null })
      .eq("id", reviewId)
      .eq("user_id", user.id),
    supabase
      .from("review_images")
      .select("url")
      .eq("review_id", reviewId),
  ]);

  if (updateResult.error) throw new Error("리뷰 수정에 실패했습니다");

  // 삭제할 이미지 계산: DB에 있지만 keptImageUrls에 없는 이미지
  const keptOriginalUrls = new Set(keptImageUrls.map(toOriginalSupabaseImageUrl));
  const toDelete = (existingResult.data ?? [])
    .map((row) => row.url as string)
    .filter((url) => !keptOriginalUrls.has(url));

  if (toDelete.length > 0) {
    const storagePaths = toDelete.map((url) => {
      const parts = url.split("/review-images/");
      return parts[1];
    });

    await Promise.all([
      supabase.storage.from("review-images").remove(storagePaths),
      supabase
        .from("review_images")
        .delete()
        .eq("review_id", reviewId)
        .in("url", toDelete),
    ]);
  }

  // 새 이미지 DB 등록
  if (newImageUrls && newImageUrls.length > 0) {
    const nextOrder = keptImageUrls.length;
    await supabase.from("review_images").insert(
      newImageUrls.map((url, i) => ({
        review_id: reviewId,
        url,
        display_order: nextOrder + i,
      })),
    );
  }
}

export async function voteKonaCard(placeId: string, vote: KonaVote) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const { data: existing } = await supabase
    .from("kona_card_votes")
    .select("id, vote")
    .eq("place_id", placeId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    if (existing.vote === vote) {
      await supabase.from("kona_card_votes").delete().eq("id", existing.id);
    } else {
      await supabase
        .from("kona_card_votes")
        .update({ vote })
        .eq("id", existing.id);
    }
  } else {
    await supabase.from("kona_card_votes").insert({
      place_id: placeId,
      user_id: user.id,
      vote,
    });
  }

  // 트리거에 의해 업데이트된 kona_card_status 조회
  const { data: updatedPlace } = await supabase
    .from("places")
    .select("kona_card_status")
    .eq("id", placeId)
    .single();

  return {
    status: (updatedPlace?.kona_card_status ?? "unknown") as KonaCardStatus,
    userVote: existing?.vote === vote ? null : vote,
  };
}
