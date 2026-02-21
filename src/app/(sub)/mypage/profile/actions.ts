"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toOriginalSupabaseImageUrl } from "@/lib/image";

export async function updateNickname(nickname: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  const { error } = await supabase
    .from("profiles")
    .update({ nickname })
    .eq("id", user.id);

  if (error) throw new Error("닉네임 변경에 실패했습니다.");

  revalidatePath("/mypage");
  revalidatePath("/mypage/profile");
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) throw new Error("파일이 없습니다.");

  // 기존 아바타 삭제
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.avatar_url) {
    const originalUrl = toOriginalSupabaseImageUrl(profile.avatar_url);
    const parts = originalUrl.split("/profile-images/");
    if (parts[1]) {
      await supabase.storage.from("profile-images").remove([parts[1]]);
    }
  }

  // 새 아바타 업로드
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("profile-images")
    .upload(path, file);

  if (uploadError) throw new Error("아바타 업로드에 실패했습니다.");

  const {
    data: { publicUrl },
  } = supabase.storage.from("profile-images").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) throw new Error("아바타 저장에 실패했습니다.");

  revalidatePath("/mypage");
  revalidatePath("/mypage/profile");
}
