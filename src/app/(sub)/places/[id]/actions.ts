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

  const { error } = await supabase.from("reviews").insert({
    place_id: placeId,
    user_id: user.id,
    rating: data.rating,
    content: data.content || null,
    image_urls: imageUrls?.length ? imageUrls : null,
  });

  if (error) throw new Error("리뷰 작성에 실패했습니다");
}

export async function deleteReview(reviewId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  // 이미지 URL 조회 → Storage 삭제
  const { data: review } = await supabase
    .from("reviews")
    .select("image_urls")
    .eq("id", reviewId)
    .eq("user_id", user.id)
    .single();

  if (review && review.image_urls && review.image_urls.length > 0) {
    const storagePaths = review.image_urls.map((url) => {
      const parts = url.split("/review-images/");
      return parts[1];
    });
    await supabase.storage.from("review-images").remove(storagePaths);
  }

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

  // 기존 이미지 URL 조회
  const { data: existing } = await supabase
    .from("reviews")
    .select("image_urls")
    .eq("id", reviewId)
    .eq("user_id", user.id)
    .single();

  // 삭제할 이미지 계산: DB에 있지만 keptImageUrls에 없는 이미지
  const keptOriginalUrls = new Set(keptImageUrls.map(toOriginalSupabaseImageUrl));
  const toDelete = (existing?.image_urls ?? []).filter(
    (url) => !keptOriginalUrls.has(url),
  );

  if (toDelete.length > 0) {
    const storagePaths = toDelete.map((url) => {
      const parts = url.split("/review-images/");
      return parts[1];
    });
    await supabase.storage.from("review-images").remove(storagePaths);
  }

  // 리뷰 수정 (image_urls 포함)
  const finalImageUrls = [
    ...keptImageUrls.map(toOriginalSupabaseImageUrl),
    ...(newImageUrls ?? []),
  ];

  const { error } = await supabase
    .from("reviews")
    .update({
      rating: data.rating,
      content: data.content || null,
      image_urls: finalImageUrls.length > 0 ? finalImageUrls : null,
    })
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) throw new Error("리뷰 수정에 실패했습니다");
}

export async function toggleFavorite(
  placeId: string,
): Promise<{ isFavorited: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("place_id", placeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    return { isFavorited: false };
  } else {
    await supabase
      .from("favorites")
      .insert({ place_id: placeId, user_id: user.id });
    return { isFavorited: true };
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
