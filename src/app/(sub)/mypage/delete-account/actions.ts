"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function deleteAccount() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const adminClient = createServiceRoleClient();

  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    throw new Error("회원탈퇴에 실패했습니다. 다시 시도해주세요.");
  }
}
