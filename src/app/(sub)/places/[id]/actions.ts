"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { KonaCardStatus, KonaVote } from "@/types";

export async function createReview(
  placeId: string,
  naverPlaceId: string,
  data: { rating: number; content: string },
  images?: FormData
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

  // 이미지 업로드
  if (images) {
    const files = images.getAll("images") as File[];
    const imageUrls: string[] = [];

    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${naverPlaceId}/${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("review-images")
        .upload(path, file);

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("review-images").getPublicUrl(path);
        imageUrls.push(publicUrl);
      }
    }

    if (imageUrls.length > 0) {
      await supabase.from("review_images").insert(
        imageUrls.map((url, i) => ({
          review_id: review.id,
          url,
          display_order: i,
        }))
      );
    }
  }

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

export async function updateReview(
  reviewId: number,
  naverPlaceId: string,
  data: { rating: number; content: string },
  newImages?: FormData,
  deletedImageUrls?: string[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const { error } = await supabase
    .from("reviews")
    .update({
      rating: data.rating,
      content: data.content || null,
    })
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) throw new Error("리뷰 수정에 실패했습니다");

  // 삭제할 이미지 처리
  if (deletedImageUrls && deletedImageUrls.length > 0) {
    // Storage에서 파일 삭제
    const storagePaths = deletedImageUrls.map((url) => {
      const parts = url.split("/review-images/");
      return parts[1];
    });
    await supabase.storage.from("review-images").remove(storagePaths);

    // DB에서 레코드 삭제
    await supabase
      .from("review_images")
      .delete()
      .eq("review_id", reviewId)
      .in("url", deletedImageUrls);
  }

  // 새 이미지 업로드
  if (newImages) {
    const files = newImages.getAll("images") as File[];
    const imageUrls: string[] = [];

    // 현재 이미지 최대 display_order 조회
    const { data: existingImages } = await supabase
      .from("review_images")
      .select("display_order")
      .eq("review_id", reviewId)
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = (existingImages?.[0]?.display_order ?? -1) + 1;

    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${naverPlaceId}/${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("review-images")
        .upload(path, file);

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("review-images").getPublicUrl(path);
        imageUrls.push(publicUrl);
      }
    }

    if (imageUrls.length > 0) {
      await supabase.from("review_images").insert(
        imageUrls.map((url, i) => ({
          review_id: reviewId,
          url,
          display_order: nextOrder + i,
        }))
      );
    }
  }

  revalidatePath(`/places/${naverPlaceId}`);
}

export async function voteKonaCard(
  placeId: string,
  naverPlaceId: string,
  vote: KonaVote
) {
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

  revalidatePath(`/places/${naverPlaceId}`);

  return {
    status: (updatedPlace?.kona_card_status ?? "unknown") as KonaCardStatus,
    userVote: existing?.vote === vote ? null : vote,
  };
}
