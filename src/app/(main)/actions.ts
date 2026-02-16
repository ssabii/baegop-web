"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { NaverPlaceDetail } from "@/types";

export async function createPlaceWithReview(
  place: NaverPlaceDetail,
  review: {
    rating: number;
    content: string;
  },
  images?: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다");
  }

  // 이미 등록된 장소인지 확인
  const { data: existing } = await supabase
    .from("places")
    .select("id")
    .eq("id", place.id)
    .single();

  if (!existing) {
    const { error } = await supabase.from("places").insert({
      id: place.id,
      name: place.name,
      address: place.roadAddress || place.address,
      category: place.category || null,
      lat: place.y ? parseFloat(place.y) : null,
      lng: place.x ? parseFloat(place.x) : null,
      image_urls: place.imageUrls.length > 0 ? place.imageUrls : null,
      created_by: user.id,
    });

    if (error) {
      throw new Error("장소 등록에 실패했습니다");
    }
  }

  // 리뷰 저장
  const { data: reviewData, error: reviewError } = await supabase
    .from("reviews")
    .insert({
      place_id: place.id,
      user_id: user.id,
      rating: review.rating,
      content: review.content || null,
    })
    .select("id")
    .single();

  if (reviewError || !reviewData) {
    throw new Error("리뷰 작성에 실패했습니다");
  }

  // 이미지 업로드
  if (images) {
    const files = images.getAll("images") as File[];
    const imageUrls: string[] = [];

    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${place.id}/${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

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
          review_id: reviewData.id,
          url,
          display_order: i,
        }))
      );
    }
  }

  redirect(`/places/${place.id}`);
}

export async function registerPlace(place: NaverPlaceDetail) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다");
  }

  // 이미 등록된 장소인지 확인
  const { data: existing } = await supabase
    .from("places")
    .select("id")
    .eq("id", place.id)
    .single();

  if (existing) {
    revalidatePath(`/places/${place.id}`);
    return;
  }

  const { error } = await supabase.from("places").insert({
    id: place.id,
    name: place.name,
    address: place.roadAddress || place.address,
    category: place.category || null,
    lat: place.y ? parseFloat(place.y) : null,
    lng: place.x ? parseFloat(place.x) : null,
    image_urls: place.imageUrls.length > 0 ? place.imageUrls : null,
    created_by: user.id,
  });

  if (error) {
    throw new Error("장소 등록에 실패했습니다");
  }

  revalidatePath(`/places/${place.id}`);
}
