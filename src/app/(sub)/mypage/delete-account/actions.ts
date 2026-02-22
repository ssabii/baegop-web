"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { toOriginalSupabaseImageUrl } from "@/lib/image";

export async function deleteAccount() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const adminClient = createServiceRoleClient();

  // 1. 프로필 조회 → 아바타 삭제
  const { data: profile } = await adminClient
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.avatar_url) {
    const originalUrl = toOriginalSupabaseImageUrl(profile.avatar_url);
    const parts = originalUrl.split("/profile-images/");
    if (parts[1]) {
      await adminClient.storage.from("profile-images").remove([parts[1]]);
    }
  }

  // 2. 리뷰 익명화 (user_id → null)
  await adminClient
    .from("reviews")
    .update({ user_id: null })
    .eq("user_id", user.id);

  // 3. 장소 익명화 (created_by → null)
  await adminClient
    .from("places")
    .update({ created_by: null })
    .eq("created_by", user.id);

  // 4. 리액션 삭제
  await adminClient.from("reactions").delete().eq("user_id", user.id);

  // 5. 코나카드 투표 삭제
  await adminClient.from("kona_card_votes").delete().eq("user_id", user.id);

  // 6. auth user 삭제 (profile은 cascade 삭제)
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    throw new Error("회원탈퇴에 실패했습니다. 다시 시도해주세요.");
  }
}
