"use server";

import { toOriginalSupabaseImageUrl } from "@/lib/image";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type AdminClient = ReturnType<typeof createServiceRoleClient>;

/**
 * 특정 사용자가 남긴 콘텐츠(reviews/feedbacks)의 이미지 파일을 Storage에서 삭제한다.
 * 익명화(user_id → null) 이전에 호출해야 대상 행을 조회할 수 있다.
 */
async function removeUserBucketImages(
  adminClient: AdminClient,
  table: "reviews" | "feedbacks",
  bucket: "review-images" | "feedback-images",
  userId: string,
) {
  const { data: rows } = await adminClient
    .from(table)
    .select("image_urls")
    .eq("user_id", userId);

  const paths = (rows ?? [])
    .flatMap((row) => row.image_urls ?? [])
    .map((url) => url.split(`/${bucket}/`)[1])
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    await adminClient.storage.from(bucket).remove(paths);
  }
}

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

  // 2. 리뷰/피드백 이미지 Storage 삭제 (익명화 전에 수집해야 함)
  await removeUserBucketImages(adminClient, "reviews", "review-images", user.id);
  await removeUserBucketImages(
    adminClient,
    "feedbacks",
    "feedback-images",
    user.id,
  );

  // 3. 리뷰 익명화 (user_id → null)
  await adminClient
    .from("reviews")
    .update({ user_id: null })
    .eq("user_id", user.id);

  // 4. 피드백 익명화 (user_id → null)
  await adminClient
    .from("feedbacks")
    .update({ user_id: null })
    .eq("user_id", user.id);

  // 5. 장소 익명화 (created_by → null)
  await adminClient
    .from("places")
    .update({ created_by: null })
    .eq("created_by", user.id);

  // 6. 코나카드 투표 삭제
  await adminClient.from("kona_card_votes").delete().eq("user_id", user.id);

  // 7. auth user 삭제 (profile은 cascade 삭제)
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    throw new Error("회원탈퇴에 실패했습니다. 다시 시도해주세요.");
  }
}
