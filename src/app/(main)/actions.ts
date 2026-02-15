"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripHtml, extractNaverPlaceId, convertNaverCoord } from "@/lib/naver";
import type { NaverSearchResult } from "@/types";

export async function findOrCreateRestaurant(item: NaverSearchResult) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다");
  }

  const naverPlaceId = extractNaverPlaceId(item.link);

  // naver_place_id가 있으면 기존 레코드 조회
  if (naverPlaceId) {
    const { data: existing } = await supabase
      .from("restaurants")
      .select("id")
      .eq("naver_place_id", naverPlaceId)
      .single();

    if (existing) {
      redirect(`/restaurants/${existing.id}`);
    }
  }

  // 새 레코드 생성
  const { data: created, error } = await supabase
    .from("restaurants")
    .insert({
      name: stripHtml(item.title),
      address: item.roadAddress || item.address,
      category: item.category || null,
      naver_place_id: naverPlaceId || null,
      lat: item.mapy ? convertNaverCoord(item.mapy) : null,
      lng: item.mapx ? convertNaverCoord(item.mapx) : null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error("맛집 등록에 실패했습니다");
  }

  redirect(`/restaurants/${created.id}`);
}
