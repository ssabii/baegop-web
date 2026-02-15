"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripHtml, extractNaverPlaceId, convertNaverCoord } from "@/lib/naver";
import type { NaverSearchResult } from "@/types";

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
  item: NaverSearchResult,
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

  const naverPlaceId = extractNaverPlaceId(item.link);

  // 이미 등록된 맛집인지 확인
  let restaurantId: number;

  if (naverPlaceId) {
    const { data: existing } = await supabase
      .from("restaurants")
      .select("id")
      .eq("naver_place_id", naverPlaceId)
      .single();

    if (existing) {
      restaurantId = existing.id;
    } else {
      const { data: created, error } = await supabase
        .from("restaurants")
        .insert({
          name: stripHtml(item.title),
          address: item.roadAddress || item.address,
          category: item.category || null,
          naver_place_id: naverPlaceId,
          naver_link: item.link || null,
          telephone: item.telephone || null,
          lat: item.mapy ? convertNaverCoord(item.mapy) : null,
          lng: item.mapx ? convertNaverCoord(item.mapx) : null,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (error || !created) {
        throw new Error("맛집 등록에 실패했습니다");
      }
      restaurantId = created.id;
    }
  } else {
    const { data: created, error } = await supabase
      .from("restaurants")
      .insert({
        name: stripHtml(item.title),
        address: item.roadAddress || item.address,
        category: item.category || null,
        naver_link: item.link || null,
        telephone: item.telephone || null,
        lat: item.mapy ? convertNaverCoord(item.mapy) : null,
        lng: item.mapx ? convertNaverCoord(item.mapx) : null,
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
