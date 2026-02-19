"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function deleteAccount() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const adminClient = createServiceRoleClient();

  // DB 함수로 스토리지 owner 해제 + auth.users 삭제를 한 트랜잭션에서 처리
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminClient.rpc as any)("delete_user_account", {
    target_user_id: user.id,
  });

  if (error) {
    // rpc 에러가 나더라도 실제 삭제 여부 확인
    const { data } = await adminClient.auth.admin.getUserById(user.id);
    if (data.user) {
      console.error("delete_user_account error:", error.message);
      throw new Error("회원탈퇴에 실패했습니다. 다시 시도해주세요.");
    }
  }

  // 유저 삭제 후 세션이 무효화되어 signOut이 실패할 수 있음
  try {
    await supabase.auth.signOut();
  } catch {
    // 이미 삭제된 유저의 세션 정리 실패는 무시
  }

  redirect("/signin");
}
