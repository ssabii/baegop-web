import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Profile {
  nickname: string;
  avatarUrl: string | null;
  email: string | null;
}

export const profileQueryKey = ["profile"];

export function useProfile() {
  const { data, isLoading } = useQuery({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, avatar_url")
        .eq("id", user.id)
        .single();

      return {
        nickname: profile?.nickname ?? user.email ?? "사용자",
        avatarUrl: profile?.avatar_url ?? null,
        email: user.email ?? null,
      } as Profile;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return { profile: data ?? null, isLoading };
}
