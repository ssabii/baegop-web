"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildNaverMapLink } from "@/lib/naver";
import type { NaverPlaceDetail } from "@/types";

export async function findRestaurantByNaverPlaceId(
  naverPlaceId: string
): Promise<{ id: number } | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("restaurants")
    .select("id")
    .eq("naver_place_id", naverPlaceId)
    .single();

  return data;
}

export async function createRestaurantWithReview(
  place: NaverPlaceDetail,
  review: {
    rating: number;
    content: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다");
  }

  // 이미 등록된 맛집인지 확인
  let restaurantId: number;

  const { data: existing } = await supabase
    .from("restaurants")
    .select("id")
    .eq("naver_place_id", place.id)
    .single();

  if (existing) {
    restaurantId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from("restaurants")
      .insert({
        name: place.name,
        address: place.roadAddress || place.address,
        category: place.category || null,
        naver_place_id: place.id,
        naver_link: buildNaverMapLink(place.name),
        telephone: place.phone || null,
        lat: place.y ? parseFloat(place.y) : null,
        lng: place.x ? parseFloat(place.x) : null,
        image_urls: place.imageUrls.length > 0 ? place.imageUrls : null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error || !created) {
      throw new Error("맛집 등록에 실패했습니다");
    }
    restaurantId = created.id;
  }

  // 리뷰 저장
  const { error: reviewError } = await supabase.from("reviews").insert({
    restaurant_id: restaurantId,
    user_id: user.id,
    rating: review.rating,
    content: review.content || null,
  });

  if (reviewError) {
    throw new Error("리뷰 작성에 실패했습니다");
  }

  redirect(`/restaurants/${restaurantId}`);
}
