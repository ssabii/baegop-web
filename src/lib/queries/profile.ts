import { buildProfile, type Profile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

/**
 * 서버에서 현재 사용자의 Profile을 조회한다. 루트 레이아웃에서 프리페치해
 * profileKeys.all로 hydrate하면 클라이언트 useProfile의 초기 왕복을 제거할 수 있다.
 */
export async function getServerProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, avatar_url, total_points")
    .eq("id", user.id)
    .single();

  return buildProfile(user, profile);
}
