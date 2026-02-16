"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildNaverMapLink } from "@/lib/naver";
import type { NaverPlaceDetail } from "@/types";

export async function createPlaceWithReview(
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

  // 이미 등록된 장소인지 확인
  let placeId: number;

  const { data: existing } = await supabase
    .from("places")
    .select("id")
    .eq("naver_place_id", place.id)
    .single();

  if (existing) {
    placeId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from("places")
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
      throw new Error("장소 등록에 실패했습니다");
    }
    placeId = created.id;
  }

  // 리뷰 저장
  const { error: reviewError } = await supabase.from("reviews").insert({
    place_id: placeId,
    user_id: user.id,
    rating: review.rating,
    content: review.content || null,
  });

  if (reviewError) {
    throw new Error("리뷰 작성에 실패했습니다");
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
    .eq("naver_place_id", place.id)
    .single();

  if (existing) {
    revalidatePath(`/places/${place.id}`);
    return;
  }

  const { error } = await supabase.from("places").insert({
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
  });

  if (error) {
    throw new Error("장소 등록에 실패했습니다");
  }

  revalidatePath(`/places/${place.id}`);
}
